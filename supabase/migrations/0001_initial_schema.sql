-- TiakGP Connect — Schéma initial (MVP)
-- À exécuter dans Supabase SQL Editor ou via CLI

-- Extension PostGIS pour recherches géographiques
create extension if not exists postgis;

-- Types enum
create type user_role as enum ('particulier', 'commercant', 'tiak_tiak', 'gp', 'admin');
create type request_status as enum ('brouillon', 'envoyee', 'acceptee', 'en_cours', 'livree', 'confirmee', 'annulee', 'litige');
create type verification_status as enum ('pending', 'verified', 'rejected');

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  phone text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Roles (un utilisateur peut avoir plusieurs rôles)
create table public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role user_role not null,
  primary key (user_id, role)
);

-- Profils transporteurs
create table public.transporter_profiles (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  kind text check (kind in ('tiak_tiak', 'gp')),
  bio text,
  verification_status verification_status default 'pending',
  service_area text,
  pricing_notes text
);

-- Disponibilités locales
create table public.local_availabilities (
  id bigint generated always as identity primary key,
  transporter_id uuid references public.profiles(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  radius_km int,
  status text default 'active',
  created_at timestamptz default now()
);

-- Trajets GP
create table public.gp_trips (
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
  status text default 'active',
  created_at timestamptz default now()
);

-- Demandes de transport
create table public.transport_requests (
  id bigint generated always as identity primary key,
  client_id uuid references public.profiles(id),
  transporter_id uuid references public.profiles(id),
  local_availability_id bigint references public.local_availabilities(id),
  gp_trip_id bigint references public.gp_trips(id),
  pickup_location text,
  dropoff_location text,
  description text,
  weight_kg numeric,
  requested_at timestamptz default now(),
  status request_status default 'envoyee'
);

-- Messages
create table public.messages (
  id bigint generated always as identity primary key,
  request_id bigint references public.transport_requests(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  body text not null,
  created_at timestamptz default now()
);

-- Avis
create table public.reviews (
  id bigint generated always as identity primary key,
  request_id bigint references public.transport_requests(id),
  author_id uuid references public.profiles(id),
  target_id uuid references public.profiles(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- RLS de base (exemples — à affiner)
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.transporter_profiles enable row level security;
alter table public.local_availabilities enable row level security;
alter table public.gp_trips enable row level security;
alter table public.transport_requests enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- Politiques simples (public read pour annonces, owner pour le reste)
create policy "Public can view active availabilities" on public.local_availabilities for select using (status = 'active');
create policy "Public can view active trips" on public.gp_trips for select using (status = 'active');

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger pour créer un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
