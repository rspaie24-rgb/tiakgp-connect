-- Release hardening: fixes migration drift, removes public phone access and
-- adds the account-deletion request flow required by mobile stores.

-- 0001 created early versions of these tables. 0004 used CREATE TABLE IF NOT
-- EXISTS, which did not add its newer columns to already-created tables.
alter table public.messages
  add column if not exists from_user uuid references public.profiles(id) on delete cascade,
  add column if not exists to_user uuid references public.profiles(id) on delete cascade;

alter table public.reviews
  add column if not exists transporter_id uuid references public.profiles(id) on delete cascade;

create table if not exists public.account_deletion_requests (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'processing', 'completed', 'rejected')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  admin_note text
);

alter table public.account_deletion_requests enable row level security;

-- This helper is deliberately not based on user_metadata, which is user-editable.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Public profile browsing must never disclose private telephone numbers.
drop policy if exists "Public can view profiles display" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "Admins read profiles" on public.profiles
  for select to authenticated using ((select public.is_admin()));

-- A deliberately narrow public API for names only. No phone number is selected.
create or replace function public.public_profile_cards(p_ids uuid[] default null)
returns table(id uuid, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.display_name
  from public.profiles p
  where p_ids is null or p.id = any(p_ids);
$$;

revoke all on function public.public_profile_cards(uuid[]) from public;
grant execute on function public.public_profile_cards(uuid[]) to anon, authenticated;

-- Users can read their own roles, but cannot grant themselves administrator.
drop policy if exists "Users read own roles" on public.user_roles;
create policy "Users read own roles" on public.user_roles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Admins read roles" on public.user_roles
  for select to authenticated using ((select public.is_admin()));

create or replace function public.set_my_role(p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if p_role = 'admin' then
    raise exception 'Administrator role cannot be self-assigned';
  end if;

  delete from public.user_roles
  where user_id = (select auth.uid()) and role <> 'admin';
  insert into public.user_roles (user_id, role)
  values ((select auth.uid()), p_role)
  on conflict do nothing;
end;
$$;

revoke all on function public.set_my_role(public.user_role) from public;
grant execute on function public.set_my_role(public.user_role) to authenticated;

-- Transporter contact data stays private. Public transport listings already
-- contain the information needed to discover a service.
drop policy if exists "Public can view transporter profiles" on public.transporter_profiles;
drop policy if exists "Owners manage transporter profiles" on public.transporter_profiles;
create policy "Owners manage transporter profiles" on public.transporter_profiles
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Account deletion can be initiated once by its owner; only an administrator
-- can inspect or change the processing state.
drop policy if exists "Users request own deletion" on public.account_deletion_requests;
drop policy if exists "Admins manage deletion requests" on public.account_deletion_requests;
create policy "Users request own deletion" on public.account_deletion_requests
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Admins manage deletion requests" on public.account_deletion_requests
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Reports are user-generated safety data: submitters can create their own
-- report; review and status changes are reserved for administrators.
drop policy if exists "Users create own reports" on public.reports;
drop policy if exists "Admins manage reports" on public.reports;
create policy "Users create own reports" on public.reports
  for insert to authenticated with check ((select auth.uid()) = reporter_id);
create policy "Admins manage reports" on public.reports
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Give the maintenance dashboard read access without weakening normal users'
-- row-level access. Write access remains constrained to existing owner policies.
create policy "Admins read transport requests" on public.transport_requests
  for select to authenticated using ((select public.is_admin()));
create policy "Admins read local availabilities" on public.local_availabilities
  for select to authenticated using ((select public.is_admin()));
create policy "Admins read gp trips" on public.gp_trips
  for select to authenticated using ((select public.is_admin()));

-- A previously-created SECURITY DEFINER function must not be callable by anon.
alter function public.has_seeker_contact_access(uuid) set search_path = '';
revoke all on function public.has_seeker_contact_access(uuid) from public;
grant execute on function public.has_seeker_contact_access(uuid) to authenticated;

grant select, insert on public.account_deletion_requests to authenticated;
grant usage, select on all sequences in schema public to authenticated;
