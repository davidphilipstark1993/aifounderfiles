// POST /api/admin/login/ {password} → sets the session cookie.  DELETE → signs out.
import { adminConfigured, clearCookie, passwordMatches, sessionCookie } from '../../lib/newsletter/admin-auth.js';

const json = (body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });

export async function POST(request: Request): Promise<Response> {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'Bad request.' }, 400);
  if (!adminConfigured()) return json({ ok: false, error: 'Admin sign-in is not set up yet (ADMIN_PASSWORD, at least 12 characters).' }, 503);
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const ok = typeof body.password === 'string' && passwordMatches(body.password);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slows down password guessing
    return json({ ok: false, error: 'Incorrect password.' }, 401);
  }
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie() });
}

export async function DELETE(): Promise<Response> {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
}
