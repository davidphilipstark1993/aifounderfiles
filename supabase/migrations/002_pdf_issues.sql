-- AI Founder Files PDF newsletter. Run once in the Supabase SQL editor of the AIFF project.
-- The admin page (/admin/) uploads a PDF, creates a row here, and the Sunday send emails the newest
-- 'approved' issue. Only the service-role key touches this table (RLS on, no policies).

create table if not exists public.newsletter_issues (
  id                   uuid primary key default gen_random_uuid(),
  issue_number         integer generated always as identity,
  title                text not null,
  note                 text,
  pdf_path             text not null,
  pdf_name             text not null,
  status               text not null default 'draft'
                         check (status in ('draft', 'approved', 'sending', 'sent', 'failed')),
  recipient_count      integer not null default 0,
  sent_count           integer not null default 0,
  sendgrid_message_id  text,
  error                text,
  created_at           timestamptz not null default now(),
  approved_at          timestamptz,
  sent_at              timestamptz
);

create index if not exists newsletter_issues_status_idx
  on public.newsletter_issues (status, approved_at);

alter table public.newsletter_issues enable row level security;

-- Public bucket for the PDFs: emailed links must work for subscribers without a login.
-- Every file sits under a random uuid folder, so the URL cannot be guessed. PDFs only, max 50 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('issues', 'issues', true, 52428800, array['application/pdf'])
on conflict (id) do nothing;
