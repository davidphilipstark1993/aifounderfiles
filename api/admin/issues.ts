// /api/admin/issues/: everything the admin page needs. Every handler checks the session cookie first.
//   GET   → the list of issues and the active subscriber count
//   POST  → { action: 'prepare' | 'create' | 'update' | 'approve' | 'unapprove' | 'delete' | 'test' | 'send-now' | 'resume', ... }
// PDFs never pass through this function (Vercel limits request bodies to 4.5 MB): 'prepare' returns a
// short-lived signed URL and the browser uploads straight to Supabase Storage, then calls 'create'.
import { randomUUID } from 'node:crypto';
import { isAdmin } from '../../lib/newsletter/admin-auth.js';
import { adminClient } from '../../lib/newsletter/supabase.js';
import { BUCKET, pdfUrl, sendIssue, sendTest, type IssueRow } from '../../lib/newsletter/issues.js';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const PATH_RE = /^[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,120}\.pdf$/i;

const safeName = (name: string) =>
  name.replace(/\.pdf$/i, '').normalize('NFKD').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'issue';

export async function GET(request: Request): Promise<Response> {
  if (!isAdmin(request)) return json({ ok: false, error: 'Not signed in.' }, 401);
  const supabase = adminClient();
  const { data, error } = await supabase.from('newsletter_issues').select('*').order('created_at', { ascending: false });
  if (error) return json({ ok: false, error: error.message }, 500);
  const { count } = await supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active');
  const issues = (data as IssueRow[]).map((i) => ({ ...i, pdf_url: pdfUrl(supabase, i.pdf_path) }));
  return json({ ok: true, issues, activeSubscribers: count ?? 0 });
}

export async function POST(request: Request): Promise<Response> {
  if (!isAdmin(request)) return json({ ok: false, error: 'Not signed in.' }, 401);
  // JSON only: together with the SameSite=Strict cookie this blocks cross-site form posts.
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'Bad request.' }, 400);
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = typeof b.action === 'string' ? b.action : '';
  const supabase = adminClient();

  try {
    if (action === 'prepare') {
      const filename = typeof b.filename === 'string' ? b.filename : '';
      if (!/\.pdf$/i.test(filename)) return json({ ok: false, error: 'Choose a PDF file.' }, 400);
      const path = `${randomUUID()}/${safeName(filename)}.pdf`;
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error || !data) return json({ ok: false, error: `Could not start the upload: ${error?.message ?? 'unknown error'}` }, 500);
      return json({ ok: true, path, signedUrl: data.signedUrl });
    }

    if (action === 'create') {
      const title = typeof b.title === 'string' ? b.title.trim() : '';
      const note = typeof b.note === 'string' ? b.note.trim() : '';
      const path = typeof b.path === 'string' ? b.path : '';
      const filename = typeof b.filename === 'string' ? b.filename.slice(0, 200) : 'issue.pdf';
      if (!title || title.length > 140) return json({ ok: false, error: 'Add a title (up to 140 characters).' }, 400);
      if (note.length > 5000) return json({ ok: false, error: 'The note is too long (5,000 characters max).' }, 400);
      if (!PATH_RE.test(path)) return json({ ok: false, error: 'Invalid upload.' }, 400);
      const [folder, file] = path.split('/');
      const { data: found } = await supabase.storage.from(BUCKET).list(folder, { search: file });
      if (!found?.some((f) => f.name === file)) return json({ ok: false, error: 'The PDF has not finished uploading.' }, 400);
      const { data, error } = await supabase
        .from('newsletter_issues')
        .insert({ title, note: note || null, pdf_path: path, pdf_name: filename })
        .select('*')
        .single();
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true, issue: data });
    }

    const id = typeof b.id === 'string' ? b.id : '';
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false, error: 'Bad request.' }, 400);
    const { data: row } = await supabase.from('newsletter_issues').select('*').eq('id', id).maybeSingle();
    if (!row) return json({ ok: false, error: 'Issue not found.' }, 404);
    const issue = row as IssueRow;

    if (action === 'update') {
      const title = typeof b.title === 'string' ? b.title.trim() : '';
      const note = typeof b.note === 'string' ? b.note.trim() : '';
      if (!title || title.length > 140) return json({ ok: false, error: 'Add a title (up to 140 characters).' }, 400);
      if (note.length > 5000) return json({ ok: false, error: 'The note is too long (5,000 characters max).' }, 400);
      const { data, error } = await supabase
        .from('newsletter_issues')
        .update({ title, note: note || null })
        .eq('id', id)
        .eq('status', 'draft')
        .select('id');
      if (error) return json({ ok: false, error: error.message }, 500);
      if (!data?.length) return json({ ok: false, error: 'Only a draft can be edited. Move it back to draft first.' }, 409);
      return json({ ok: true });
    }

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('newsletter_issues')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'draft')
        .select('id');
      if (error) return json({ ok: false, error: error.message }, 500);
      if (!data?.length) return json({ ok: false, error: 'Only a draft can be approved.' }, 409);
      return json({ ok: true });
    }

    if (action === 'unapprove') {
      const { data, error } = await supabase
        .from('newsletter_issues')
        .update({ status: 'draft', approved_at: null })
        .eq('id', id)
        .eq('status', 'approved')
        .select('id');
      if (error) return json({ ok: false, error: error.message }, 500);
      if (!data?.length) return json({ ok: false, error: 'Only an approved issue can go back to draft.' }, 409);
      return json({ ok: true });
    }

    if (action === 'delete') {
      if (issue.status === 'sent' || issue.status === 'sending') return json({ ok: false, error: 'A sent issue cannot be deleted: subscribers have its download link.' }, 409);
      await supabase.storage.from(BUCKET).remove([issue.pdf_path]);
      const { error } = await supabase.from('newsletter_issues').delete().eq('id', id);
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'test') {
      const n = await sendTest(supabase, issue);
      return json({ ok: true, message: `Test copy sent to ${n} admin address${n === 1 ? '' : 'es'}.` });
    }

    if (action === 'send-now' || action === 'resume') {
      const result = await sendIssue(id, { resume: action === 'resume' });
      return json(result as unknown as Record<string, unknown>, result.ok ? 200 : 409);
    }

    return json({ ok: false, error: 'Unknown action.' }, 400);
  } catch (err) {
    console.error('admin/issues failed:', action, err);
    return json({ ok: false, error: err instanceof Error ? err.message : 'Something went wrong.' }, 500);
  }
}
