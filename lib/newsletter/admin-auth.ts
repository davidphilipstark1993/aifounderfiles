// Admin sign-in for /admin/. One shared password (ADMIN_PASSWORD) and a signed, HttpOnly session
// cookie. The cookie is signed with the password itself, so changing ADMIN_PASSWORD signs everyone out.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env.js';

const COOKIE = 'aiff_admin';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

const sign = (value: string, key: string) => createHmac('sha256', key).update(value).digest('hex');

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

export const adminConfigured = () => env('ADMIN_PASSWORD').length >= 12;

export function passwordMatches(candidate: string): boolean {
  const password = env('ADMIN_PASSWORD');
  if (password.length < 12) return false;
  // Compare digests so the comparison is constant-time whatever the lengths.
  return safeEqual(sign(candidate, 'pw'), sign(password, 'pw'));
}

export function sessionCookie(): string {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const token = `${exp}.${sign(exp, env('ADMIN_PASSWORD'))}`;
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function isAdmin(request: Request): boolean {
  const password = env('ADMIN_PASSWORD');
  if (password.length < 12) return false;
  const raw = (request.headers.get('cookie') ?? '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign(exp, password));
}
