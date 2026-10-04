import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './env.js';

export function adminClient(): SupabaseClient {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = requireEnv('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced' | 'suppressed';
