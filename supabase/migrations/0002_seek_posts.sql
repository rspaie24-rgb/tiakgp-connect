-- Annonces "je cherche" (personnel / commerçant)
create table if not exists public.seek_posts (
  id bigint generated always as identity primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  kind text check (kind in ('gp', 'tiak_tiak')) not null,
  -- GP: date souhaitée ; Tiak: créneau horaire libre
  desired_date date,
  desired_time text,
  origin text,
  destination text,
  details text,
  status text default 'active',
  created_at timestamptz default now()
);

alter table public.seek_posts enable row level security;

-- Lecture publique des seeks actifs (filtrage métier côté app selon le rôle)
drop policy if exists "Public read active seeks" on public.seek_posts;
create policy "Public read active seeks" on public.seek_posts
  for select using (status = 'active');

drop policy if exists "Authors manage seeks" on public.seek_posts;
create policy "Authors manage seeks" on public.seek_posts
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

grant select on public.seek_posts to anon, authenticated;
grant insert, update, delete on public.seek_posts to authenticated;
grant usage, select on all sequences in schema public to authenticated;
