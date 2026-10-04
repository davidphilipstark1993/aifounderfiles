// /api/admin/subscribers/: the subscriber list for the admin page.
//   GET   ?status=active|unsubscribed|bounced|suppressed|all &q=text &page=1  → one page of subscribers + counts
//   GET   ?format=csv (same filters)                                         → every matching subscriber as a CSV
//   POST  { action: 'delete' | 'unsubscribe', id }
// Delete erases the person from SendGrid first and from the database second. If SendGrid fails nothing is
// deleted, so you can simply try again and never end up with an address that is gone here but still held there.
import { isAdmin } from '../../lib/newsletter/admin-auth.js';
import { adminClient } from '../../lib/newsletter/supabase.js';
import { addUnsubscribe, deleteContact } from '../../lib/newsletter/sendgrid.js';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const PAGE_SIZE = 50;
const STATUSES = ['active', 'unsubscribed', 'bounced', 'suppressed'];
const COLUMNS = 'id,email,source,consent,consent_at,status,sendgrid_synced,welcome_sent,created_at,unsubscribed_at';

/** Stops spreadsheet apps treating a cell as a formula. */
const csvCell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: Request): Promise<Response> {
  if (!isAdmin(request)) return json({ ok: false, error: 'Not signed in.' }, 401);
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const q = (url.searchParams.get('q') ?? '').replace(/[%_,()\\]/g, ' ').trim().slice(0, 100);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const supabase = adminClient();

  const filtered = (query: any) => {
    let out = query;
    if (STATUSES.includes(status)) out = out.eq('status', status);
    if (q) out = out.ilike('email', `%${q}%`);
    return out;
  };

  if (url.searchParams.get('format') === 'csv') {
    const rows: Record<string, unknown>[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await filtered(supabase.from('newsletter_subscribers').select(COLUMNS))
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, from + 999);
      if (error) return json({ ok: false, error: error.message }, 500);
      rows.push(...data);
      if (data.length < 1000) break;
    }
    const head = ['email', 'status', 'subscribed_at', 'source', 'consent', 'consent_at', 'welcome_sent', 'synced_to_sendgrid', 'unsubscribed_at'];
    const lines = rows.map((r) =>
      [r.email, r.status, r.created_at, r.source, r.consent, r.consent_at, r.welcome_sent, r.sendgrid_synced, r.unsubscribed_at].map(csvCell).join(','),
    );
    return new Response([head.join(','), ...lines].join('\r\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await filtered(supabase.from('newsletter_subscribers').select(COLUMNS, { count: 'exact' }))
    .order('created_at', { ascending: false })
    .order('id')
    .range(from, from + PAGE_SIZE - 1);
  if (error) return json({ ok: false, error: error.message }, 500);

  const countOf = async (apply?: (q: any) => any) => {
    const base = supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true });
    const { count: n } = await (apply ? apply(base) : base);
    return n ?? 0;
  };
  const day = 86_400_000;
  const [total, active, unsubscribed, bounced, suppressed, last7, last30] = await Promise.all([
    countOf(),
    countOf((b) => b.eq('status', 'active')),
    countOf((b) => b.eq('status', 'unsubscribed')),
    countOf((b) => b.eq('status', 'bounced')),
    countOf((b) => b.eq('status', 'suppressed')),
    countOf((b) => b.gte('created_at', new Date(Date.now() - 7 * day).toISOString())),
    countOf((b) => b.gte('created_at', new Date(Date.now() - 30 * day).toISOString())),
  ]);

  return json({
    ok: true,
    subscribers: data,
    page,
    pageSize: PAGE_SIZE,
    matching: count ?? 0,
    counts: { total, active, unsubscribed, bounced, suppressed, last7, last30 },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!isAdmin(request)) return json({ ok: false, error: 'Not signed in.' }, 401);
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'Bad request.' }, 400);
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = typeof b.action === 'string' ? b.action : '';
  const id = typeof b.id === 'string' ? b.id : '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false, error: 'Bad request.' }, 400);

  const supabase = adminClient();
  const { data: sub } = await supabase.from('newsletter_subscribers').select('id,email,status').eq('id', id).maybeSingle();
  if (!sub) return json({ ok: false, error: 'Subscriber not found.' }, 404);

  try {
    if (action === 'delete') {
      await deleteContact(sub.email);
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true, message: `${sub.email} was deleted.` });
    }

    if (action === 'unsubscribe') {
      if (sub.status === 'unsubscribed') return json({ ok: true, message: `${sub.email} is already unsubscribed.` });
      await addUnsubscribe(sub.email);
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true, message: `${sub.email} was unsubscribed and won't be emailed again.` });
    }

    return json({ ok: false, error: 'Unknown action.' }, 400);
  } catch (err) {
    console.error('admin/subscribers failed:', action, err);
    return json({ ok: false, error: err instanceof Error ? err.message : 'Something went wrong.' }, 500);
  }
}
