-- Messagerie simple et avis

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  from_user uuid references public.profiles(id) on delete cascade,
  to_user uuid references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "Users see own messages" on public.messages;
create policy "Users see own messages" on public.messages
  for select using (auth.uid() = from_user or auth.uid() = to_user);

drop policy if exists "Users send messages" on public.messages;
create policy "Users send messages" on public.messages
  for insert with check (auth.uid() = from_user);

grant select, insert on public.messages to authenticated;

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  transporter_id uuid references public.profiles(id) on delete cascade,
  rating integer check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

drop policy if exists "Public read reviews" on public.reviews;
create policy "Public read reviews" on public.reviews for select using (true);

drop policy if exists "Authors insert reviews" on public.reviews;
create policy "Authors insert reviews" on public.reviews
  for insert with check (auth.uid() = author_id);

grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;

grant usage, select on all sequences in schema public to authenticated;
