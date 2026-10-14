// Run with: npm test   (Node's built-in test runner, via tsx)
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import { createSubscriberCountHandler } from '../lib/newsletter/stats.js';

const KEY = 'test-stats-key-0123456789abcdef0123456789abcdef';
const counts = { active: 1234, created: 17, unsubscribed: 3 };

let calls: string[][] = [];
let failQueries = false;

// Fake Supabase client: records the filters of each count query and answers from `counts`.
const fakeClient: any = {
  from(table: string) {
    assert.equal(table, 'newsletter_subscribers');
    return {
      select(columns: string, opts: unknown) {
        // Read-only, count-only queries: never selects personal columns.
        assert.equal(columns, 'id');
        assert.deepEqual(opts, { count: 'exact', head: true });
        const filters: string[] = [];
        calls.push(filters);
        const q: any = {
          eq(col: string, val: string) { filters.push(`eq:${col}=${val}`); return q; },
          gte(col: string) { filters.push(`gte:${col}`); return q; },
          then(resolve: (v: unknown) => void) {
            if (failQueries) return resolve({ count: null, error: { message: 'db down' } });
            const f = filters.join(',');
            resolve({ count: f.includes('unsubscribed') ? counts.unsubscribed : f.startsWith('eq:status=active') ? counts.active : counts.created, error: null });
          },
        };
        return q;
      },
    };
  },
};

const request = (headers: Record<string, string> = {}) => new Request('http://localhost/api/subscriber-count/', { headers });

beforeEach(() => {
  calls = [];
  failQueries = false;
  process.env.STATS_API_KEY = KEY;
});

describe('GET /api/subscriber-count', () => {
  it('returns 200 with the expected shape for the right key', async () => {
    const GET = createSubscriberCountHandler(() => fakeClient);
    const res = await GET(request({ 'x-stats-key': KEY }));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');

    const body = await res.json();
    assert.deepEqual(Object.keys(body).sort(), ['as_of', 'new_last_24h', 'site', 'total_subscribers', 'unsubscribed_last_24h']);
    assert.equal(body.site, 'aifounderfiles.com');
    assert.equal(body.total_subscribers, 1234);
    assert.equal(body.new_last_24h, 17);
    assert.equal(body.unsubscribed_last_24h, 3);
    assert.equal(new Date(body.as_of).toISOString(), body.as_of);
  });

  it('counts only active rows for the total and uses 24h windows for the rest', async () => {
    const GET = createSubscriberCountHandler(() => fakeClient);
    await GET(request({ 'x-stats-key': KEY }));
    const filters = calls.map((f) => f.join(','));
    assert.ok(filters.includes('eq:status=active'));
    assert.ok(filters.includes('gte:created_at'));
    assert.ok(filters.includes('eq:status=unsubscribed,gte:unsubscribed_at'));
  });

  it('returns 401 for a wrong key, without touching the database', async () => {
    const GET = createSubscriberCountHandler(() => fakeClient);
    const res = await GET(request({ 'x-stats-key': 'wrong' }));
    assert.equal(res.status, 401);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(calls.length, 0);
  });

  it('returns 401 when the key header is missing', async () => {
    const GET = createSubscriberCountHandler(() => fakeClient);
    const res = await GET(request());
    assert.equal(res.status, 401);
    assert.equal(calls.length, 0);
  });

  it('returns 401 for every request when STATS_API_KEY is not configured', async () => {
    delete process.env.STATS_API_KEY;
    const err = mock.method(console, 'error', () => {});
    const GET = createSubscriberCountHandler(() => fakeClient);
    assert.equal((await GET(request({ 'x-stats-key': 'anything' }))).status, 401);
    assert.equal((await GET(request())).status, 401);
    err.mock.restore();
  });

  it('never logs the key', async () => {
    const err = mock.method(console, 'error', () => {});
    const log = mock.method(console, 'log', () => {});
    failQueries = true;
    const GET = createSubscriberCountHandler(() => fakeClient);
    await GET(request({ 'x-stats-key': KEY }));
    await GET(request({ 'x-stats-key': 'wrong-key-attempt' }));
    const logged = JSON.stringify([...err.mock.calls.map((c) => c.arguments), ...log.mock.calls.map((c) => c.arguments)]);
    assert.ok(!logged.includes(KEY));
    assert.ok(!logged.includes('wrong-key-attempt'));
    err.mock.restore();
    log.mock.restore();
  });

  it('returns 500 (not zeros) when the database query fails', async () => {
    const err = mock.method(console, 'error', () => {});
    failQueries = true;
    const GET = createSubscriberCountHandler(() => fakeClient);
    assert.equal((await GET(request({ 'x-stats-key': KEY }))).status, 500);
    err.mock.restore();
  });

  it('rate limits to 30 requests per hour per IP', async () => {
    const GET = createSubscriberCountHandler(() => fakeClient);
    const headers = { 'x-stats-key': KEY, 'x-forwarded-for': '203.0.113.9' };
    for (let i = 0; i < 30; i++) assert.equal((await GET(request(headers))).status, 200);
    const limited = await GET(request(headers));
    assert.equal(limited.status, 429);
    assert.ok(limited.headers.get('retry-after'));
    // A different IP is unaffected.
    assert.equal((await GET(request({ ...headers, 'x-forwarded-for': '198.51.100.7' }))).status, 200);
  });
});
