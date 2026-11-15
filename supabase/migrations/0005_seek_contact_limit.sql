-- Limite de 5 contacts par annonce « je cherche »

alter table public.seek_posts
  add column if not exists contact_count integer default 0,
  add column if not exists status text default 'active';

-- Table pour éviter les doubles clics du même transporteur
create table if not exists public.seek_contact_clicks (
  id bigint generated always as identity primary key,
  seek_id bigint references public.seek_posts(id) on delete cascade,
  transporter_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (seek_id, transporter_id)
);

alter table public.seek_contact_clicks enable row level security;

drop policy if exists "Transporters insert own clicks" on public.seek_contact_clicks;
create policy "Transporters insert own clicks" on public.seek_contact_clicks
  for insert with check (auth.uid() = transporter_id);

drop policy if exists "Public read clicks" on public.seek_contact_clicks;
create policy "Public read clicks" on public.seek_contact_clicks
  for select using (true);

grant select, insert on public.seek_contact_clicks to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Autoriser les auteurs à mettre à jour leurs propres annonces
drop policy if exists "Authors update own seeks" on public.seek_posts;
create policy "Authors update own seeks" on public.seek_posts
  for update using (auth.uid() = author_id);

grant update on public.seek_posts to authenticated;
