/** Env values pasted into dashboards often pick up stray quotes/whitespace/newlines. */
export const clean = (value: string | undefined): string => (value ?? '').trim().replace(/^["']|["']$/g, '').trim();

export const env = (name: string): string => clean(process.env[name]);

export const SITE_URL = env('SITE_URL') || 'https://aifounderfiles.com';
export const SITE_NAME = 'AI Founder Files';
export const SITE_TAGLINE = 'One founder. One company. One deep dive.';

export function requireEnv(...names: string[]): Record<string, string> {
  const missing = names.filter((n) => !env(n));
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  return Object.fromEntries(names.map((n) => [n, env(n)]));
}
