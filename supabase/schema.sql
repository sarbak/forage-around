-- Forage Around — community submissions (Supabase / Postgres)
-- Anonymous, optional name, held for quick review before going public.
-- Decisions: people can add observations on existing spots AND new trees;
-- new-tree submissions can opt to be contributed back to Falling Fruit.

create extension if not exists "pgcrypto";

create table if not exists submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  status          text not null default 'pending'
                    check (status in ('pending','approved','hidden')),
  kind            text not null
                    check (kind in ('observation','new_tree')),
  ff_location_id  text,            -- Falling Fruit location id (observations on existing spots)
  species         text,            -- common name (free text)
  lat             double precision,
  lng             double precision,
  note            text,            -- their notes / observation
  plan            text,            -- what they're planning to make with it
  photo_url       text,            -- public URL in the submission-photos bucket
  author_name     text,            -- optional display name
  contribute_to_ff boolean not null default false, -- new_tree: share back to Falling Fruit
  slug            text unique default encode(gen_random_bytes(6),'hex')  -- shareable link
);

create index if not exists submissions_status_created_idx
  on submissions (status, created_at desc);
create index if not exists submissions_loc_idx
  on submissions (ff_location_id);

-- Row Level Security: anon can submit (forced pending) and read only approved.
alter table submissions enable row level security;

create policy "anon can read approved"
  on submissions for select
  using (status = 'approved');

create policy "anon can insert as pending"
  on submissions for insert
  with check (status = 'pending');
-- (approve / hide is done with the service role from the moderation view, never anon.)

-- Storage: create a public bucket `submission-photos` in the dashboard (or):
-- insert into storage.buckets (id, name, public) values ('submission-photos','submission-photos', true);
-- Then allow anon uploads:
-- create policy "anon upload photos" on storage.objects for insert
--   to anon with check (bucket_id = 'submission-photos');
