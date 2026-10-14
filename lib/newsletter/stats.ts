// Logic behind GET /api/subscriber-count: read-only subscriber numbers for the daily stats post.
// Kept out of api/ (every file there is deployed as a function) so it can be tested without a database.
import { createHash, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env, SITE_URL } from './env.js';

export interface SubscriberStats {
  total_subscribers: number;
  new_last_24h: number;
  unsubscribed_last_24h: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Constant-time check of the X-Stats-Key header against STATS_API_KEY. Both sides are hashed first so
 * the comparison is the same length whatever the caller sends. An unset or empty key never matches.
 */
export function statsKeyMatches(provided: string | null, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Fixed-window per-key limiter held in process memory. Each warm serverless instance keeps its own
 * counters, so this is a best-effort brake on abuse rather than an exact global cap.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    check(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
      if (hits.size > 5000) hits.forEach((v, k) => { if (v.resetAt <= now) hits.delete(k); });
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
      }
      entry.count += 1;
      return { allowed: entry.count <= limit, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
    },
  };
}

/**
 * Counts read from newsletter_subscribers: the same table and `status` values that /admin/ reads
 * (api/admin/subscribers.ts). There is no double opt-in here, so `active` is the confirmed state;
 * unsubscribed, bounced and suppressed rows are all excluded from the total.
 *
 *  - new_last_24h:          rows created in the last 24 hours (gross signups)
 *  - unsubscribed_last_24h: rows whose status is `unsubscribed` and whose unsubscribed_at is in the last 24 hours
 */
export async function fetchSubscriberStats(supabase: Pick<SupabaseClient, 'from'>, now: Date = new Date()): Promise<SubscriberStats> {
  const since = new Date(now.getTime() - DAY_MS).toISOString();

  const count = async (apply: (q: any) => any): Promise<number> => {
    const base = supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true });
    const { count: n, error } = await apply(base);
    if (error) throw new Error(error.message);
    return n ?? 0;
  };

  const [total_subscribers, new_last_24h, unsubscribed_last_24h] = await Promise.all([
    count((q) => q.eq('status', 'active')),
    count((q) => q.gte('created_at', since)),
    count((q) => q.eq('status', 'unsubscribed').gte('unsubscribed_at', since)),
  ]);

  return { total_subscribers, new_last_24h, unsubscribed_last_24h };
}

const json = (body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });

/** Builds the GET handler. The database client is injected so tests can run without Supabase. */
export function createSubscriberCountHandler(getClient: () => Pick<SupabaseClient, 'from'>) {
  const limiter = createRateLimiter(30, 60 * 60 * 1000); // 30 requests / hour / IP

  return async function GET(request: Request): Promise<Response> {
    // Rate limit before auth so guessing the key is throttled as well.
    const limit = limiter.check(clientIp(request));
    if (!limit.allowed) return json({ ok: false, error: 'Too many requests.' }, 429, { 'Retry-After': String(limit.retryAfterSeconds) });

    const expected = env('STATS_API_KEY');
    if (!expected) console.error('subscriber-count: STATS_API_KEY is not configured');
    if (!statsKeyMatches(request.headers.get('x-stats-key'), expected)) return json({ ok: false, error: 'Unauthorized.' }, 401);

    try {
      const stats = await fetchSubscriberStats(getClient());
      return json({ site: new URL(SITE_URL).hostname.replace(/^www\./, ''), ...stats, as_of: new Date().toISOString() });
    } catch (err) {
      console.error('subscriber-count: query failed:', err instanceof Error ? err.message : 'unknown error');
      return json({ ok: false, error: 'Could not load subscriber counts.' }, 500);
    }
  };
}
