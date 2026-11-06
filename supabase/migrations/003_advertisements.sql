-- AI Founder Files advertising / cross-promotion. Run once in the Supabase SQL editor of the AIFF project
-- (after 001 and 002). Safe to re-run.
--
-- Only the service-role key (Vercel functions) touches these tables and functions: RLS is on with no
-- policies, and the functions are not executable by the public/anon key.
--
--   advertisements        one row per advert, edited from /admin/ > Advertisements
--   advertisement_stats   one row per advert + placement + day, holding counters only. No IP address,
--                         cookie or visitor identifier is ever stored.
--   record_ad_event()     atomic counter increment used by the impression and click endpoints
--   ad_analytics()        aggregates for the admin analytics view (avoids PostgREST's 1,000-row cap)
--   storage bucket "ads"  public images (WebP only, 1 MB each); the admin page resizes/optimises before upload

create table if not exists public.advertisements (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 90),
  description      text not null default '' check (char_length(description) <= 220),
  destination_url  text not null check (destination_url ~* '^https?://' and char_length(destination_url) <= 1000),
  cta_text         text not null default 'Read more' check (char_length(cta_text) between 1 and 28),
  image_path       text not null,
  image_alt        text not null check (char_length(image_alt) between 1 and 200),
  -- house = one of my own sites, partner = a resource I recommend, sponsored = paid placement
  ad_type          text not null default 'house' check (ad_type in ('house', 'partner', 'sponsored')),
  placements       text[] not null default '{}',
  site_wide        boolean not null default false,
  starts_at        timestamptz,
  ends_at          timestamptz,
  is_active        boolean not null default false,
  priority         integer not null default 0 check (priority between 0 and 100),
  utm_campaign     text check (utm_campaign is null or utm_campaign ~ '^[a-z0-9_-]{1,50}$'),
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (site_wide or cardinality(placements) > 0)
);

create index if not exists advertisements_live_idx
  on public.advertisements (is_active, archived_at);

create table if not exists public.advertisement_stats (
  ad_id        uuid not null references public.advertisements (id) on delete cascade,
  day          date not null,
  placement    text not null,
  impressions  integer not null default 0,
  clicks       integer not null default 0,
  primary key (ad_id, day, placement)
);

create index if not exists advertisement_stats_day_idx
  on public.advertisement_stats (day);

alter table public.advertisements enable row level security;
alter table public.advertisement_stats enable row level security;

create or replace function public.record_ad_event(p_ad uuid, p_placement text, p_kind text)
returns void
language plpgsql
set search_path = public
as $$
begin
  if p_kind not in ('impression', 'click') then
    raise exception 'unknown ad event kind: %', p_kind;
  end if;
  insert into public.advertisement_stats (ad_id, day, placement, impressions, clicks)
  values (
    p_ad,
    (now() at time zone 'utc')::date,
    left(p_placement, 40),
    case when p_kind = 'impression' then 1 else 0 end,
    case when p_kind = 'click' then 1 else 0 end
  )
  on conflict (ad_id, day, placement) do update
    set impressions = public.advertisement_stats.impressions + excluded.impressions,
        clicks      = public.advertisement_stats.clicks + excluded.clicks;
end;
$$;

-- p_days: window for the "daily", "by_ad" and "by_placement" results. p_ad (optional) narrows all
-- three to a single advert. "lifetime" is always all-time, per advert.
create or replace function public.ad_analytics(p_days integer default 30, p_ad uuid default null)
returns jsonb
language sql
stable
set search_path = public
as $$
  with win as (
    select * from public.advertisement_stats
    where day >= (now() at time zone 'utc')::date - (greatest(p_days, 1) - 1)
      and (p_ad is null or ad_id = p_ad)
  )
  select jsonb_build_object(
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', day, 'impressions', i, 'clicks', c) order by day)
      from (select day, sum(impressions)::bigint as i, sum(clicks)::bigint as c from win group by day) d
    ), '[]'::jsonb),
    'by_ad', coalesce((
      select jsonb_agg(jsonb_build_object('ad_id', ad_id, 'impressions', i, 'clicks', c))
      from (select ad_id, sum(impressions)::bigint as i, sum(clicks)::bigint as c from win group by ad_id) a
    ), '[]'::jsonb),
    'by_placement', coalesce((
      select jsonb_agg(jsonb_build_object('placement', placement, 'impressions', i, 'clicks', c))
      from (select placement, sum(impressions)::bigint as i, sum(clicks)::bigint as c from win group by placement) p
    ), '[]'::jsonb),
    'lifetime', coalesce((
      select jsonb_agg(jsonb_build_object('ad_id', ad_id, 'impressions', i, 'clicks', c))
      from (select ad_id, sum(impressions)::bigint as i, sum(clicks)::bigint as c
            from public.advertisement_stats group by ad_id) l
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.record_ad_event(uuid, text, text) from public, anon, authenticated;
revoke all on function public.ad_analytics(integer, uuid) from public, anon, authenticated;
grant execute on function public.record_ad_event(uuid, text, text) to service_role;
grant execute on function public.ad_analytics(integer, uuid) to service_role;

-- Public bucket: the images are shown to every visitor. Each upload sits under a random uuid folder.
-- WebP only, max 1 MB per file (the admin page converts and resizes before uploading).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ads', 'ads', true, 1048576, array['image/webp'])
on conflict (id) do nothing;
