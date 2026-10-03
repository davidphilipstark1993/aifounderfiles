-- AI Founder Files newsletter. Run once in the Supabase SQL editor of the AIFF project.
-- Only the service-role key (used by the Vercel functions and the weekly GitHub Action)
-- touches these tables; RLS is on with no policies, so the public/anon key can read nothing.

create table if not exists public.newsletter_subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null unique check (email = lower(email)),
  source             text not null default 'unknown',
  consent            boolean not null default false,
  consent_at         timestamptz,
  status             text not null default 'active'
                       check (status in ('active', 'unsubscribed', 'bounced', 'suppressed')),
  sendgrid_synced    boolean not null default false,
  sendgrid_job_id    text,
  welcome_sent       boolean not null default false,
  created_at         timestamptz not null default now(),
  unsubscribed_at    timestamptz
);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status, created_at, id);

-- One row per file emailed. The unique file_slug is what stops a file ever being sent twice.
create table if not exists public.newsletter_sends (
  id                  uuid primary key default gen_random_uuid(),
  file_slug           text not null unique,
  subject             text not null,
  status              text not null default 'sending'
                        check (status in ('sending', 'sent', 'failed')),
  recipient_count     integer not null default 0,
  sent_count          integer not null default 0,
  sendgrid_message_id text,
  error               text,
  started_at          timestamptz not null default now(),
  sent_at             timestamptz
);

alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_sends enable row level security;
