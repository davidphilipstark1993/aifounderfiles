// GET /api/subscriber-count/ — read-only subscriber numbers for the daily stats post.
// Needs the X-Stats-Key header to match the STATS_API_KEY env var, otherwise 401.
// Counts only: no emails or any other personal data. Logic and tests: lib/newsletter/stats.ts.
import { adminClient } from '../lib/newsletter/supabase.js';
import { createSubscriberCountHandler } from '../lib/newsletter/stats.js';

export const GET = createSubscriberCountHandler(adminClient);
