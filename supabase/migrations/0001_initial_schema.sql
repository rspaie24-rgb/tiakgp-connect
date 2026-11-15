-- TiakGP Connect — Schéma initial (MVP)
-- À exécuter dans Supabase SQL Editor (Dashboard → SQL → New query)

-- Extension PostGIS (optionnel pour geo plus tard)
create extension if not exists postgis;

-- Types enum
do $$ begin
  create type user_role as enum ('particulier', 'commercant', 'tiak_tiak', 'gp', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type request_status as enum ('brouillon', 'envoyee', 'acceptee', 'en_cours', 'livree', 'confirmee', 'annulee', 'litige');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type verification_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type report_status as enum ('ouvert', 'en_cours', 'traite', 'rejete');
exception when duplicate_object then null;
end $$;

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  phone text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Roles (un utilisateur peut avoir plusieurs rôles)
create table if not exists public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role user_role not null,
  primary key (user_id, role)
);

-- Profils transporteurs
create table if not exists public.transporter_profiles (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  kind text check (kind in ('tiak_tiak', 'gp')),
  bio text,
  verification_status verification_status default 'pending',
  service_area text,
  pricing_notes text,
  -- WhatsApp : consentement explicite + numéro E.164
  whatsapp_enabled boolean default false,
  whatsapp_e164 text
);

-- Disponibilités locales (Tiak-Tiak)
create table if not exists public.local_availabilities (
  id bigint generated always as identity primary key,
  transporter_id uuid references public.profiles(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  district text,
  radius_km int,
  price_label text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Trajets GP
create table if not exists public.gp_trips (
  id bigint generated always as identity primary key,
  transporter_id uuid references public.profiles(id) on delete cascade,
  origin_country text,
  origin_city text,
  destination_country text,
  destination_city text,
  departure_at date,
  arrival_at date,
  return_at date,
  capacity_kg numeric,
  remaining_capacity_kg numeric,
  price_amount numeric,
  price_currency text,
  price_unit text,
  price_label text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Demandes de transport
create table if not exists public.transport_requests (
  id bigint generated always as identity primary key,
  client_id uuid references public.profiles(id),
  transporter_id uuid references public.profiles(id),
  local_availability_id bigint references public.local_availabilities(id),
  gp_trip_id bigint references public.gp_trips(id),
  pickup_location text,
  dropoff_location text,
  description text,
  weight_kg numeric,
  client_contact text,
  requested_at timestamptz default now(),
  status request_status default 'envoyee'
);

-- Messages (liés à une demande)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  request_id bigint references public.transport_requests(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  body text not null,
  created_at timestamptz default now()
);

-- Avis
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  request_id bigint references public.transport_requests(id),
  author_id uuid references public.profiles(id),
  target_id uuid references public.profiles(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Signalements (admin)
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid references public.profiles(id),
  subject_type text check (subject_type in ('profil', 'annonce', 'message', 'demande')),
  subject_id text,
  reason text,
  status report_status default 'ouvert',
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.transporter_profiles enable row level security;
alter table public.local_availabilities enable row level security;
alter table public.gp_trips enable row level security;
alter table public.transport_requests enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

-- Lecture publique des annonces actives
drop policy if exists "Public can view active availabilities" on public.local_availabilities;
create policy "Public can view active availabilities" on public.local_availabilities for select using (status = 'active');

drop policy if exists "Public can view active trips" on public.gp_trips;
create policy "Public can view active trips" on public.gp_trips for select using (status = 'active');

drop policy if exists "Public can view transporter profiles" on public.transporter_profiles;
create policy "Public can view transporter profiles" on public.transporter_profiles for select using (true);

drop policy if exists "Public can view profiles display" on public.profiles;
create policy "Public can view profiles display" on public.profiles for select using (true);

-- Profil : lecture/update soi-même
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Transporteur : gérer ses annonces
drop policy if exists "Owners manage local availabilities" on public.local_availabilities;
create policy "Owners manage local availabilities" on public.local_availabilities
  for all using (auth.uid() = transporter_id) with check (auth.uid() = transporter_id);

drop policy if exists "Owners manage gp trips" on public.gp_trips;
create policy "Owners manage gp trips" on public.gp_trips
  for all using (auth.uid() = transporter_id) with check (auth.uid() = transporter_id);

-- Demandes : client ou transporteur concerné
drop policy if exists "Participants see requests" on public.transport_requests;
create policy "Participants see requests" on public.transport_requests
  for select using (auth.uid() = client_id or auth.uid() = transporter_id);

drop policy if exists "Clients create requests" on public.transport_requests;
create policy "Clients create requests" on public.transport_requests
  for insert with check (auth.uid() = client_id);

drop policy if exists "Participants update requests" on public.transport_requests;
create policy "Participants update requests" on public.transport_requests
  for update using (auth.uid() = client_id or auth.uid() = transporter_id);

-- Messages : participants de la demande
drop policy if exists "Request participants see messages" on public.messages;
create policy "Request participants see messages" on public.messages
  for select using (
    exists (
      select 1 from public.transport_requests r
      where r.id = request_id and (r.client_id = auth.uid() or r.transporter_id = auth.uid())
    )
  );

drop policy if exists "Request participants send messages" on public.messages;
create policy "Request participants send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.transport_requests r
      where r.id = request_id and (r.client_id = auth.uid() or r.transporter_id = auth.uid())
    )
  );

-- Trigger profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
