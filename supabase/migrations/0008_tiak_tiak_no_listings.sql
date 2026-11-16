-- Tiak-Tiak accounts respond to client demand; they must not create or expose
-- local transporter listings. GP listings remain limited to GP accounts.

drop policy if exists "Public can view active availabilities" on public.local_availabilities;
create policy "Public can view non Tiak-Tiak availabilities" on public.local_availabilities
  for select
  using (
    status = 'active'
    and not exists (
      select 1
      from public.user_roles ur
      where ur.user_id = transporter_id and ur.role = 'tiak_tiak'
    )
  );

drop policy if exists "Owners manage local availabilities" on public.local_availabilities;
create policy "Admins manage local availabilities" on public.local_availabilities
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Owners manage gp trips" on public.gp_trips;
create policy "GP owners manage gp trips" on public.gp_trips
  for all to authenticated
  using (
    (select public.is_admin())
    or (
      (select auth.uid()) = transporter_id
      and exists (
        select 1
        from public.user_roles ur
        where ur.user_id = (select auth.uid()) and ur.role = 'gp'
      )
    )
  )
  with check (
    (select public.is_admin())
    or (
      (select auth.uid()) = transporter_id
      and exists (
        select 1
        from public.user_roles ur
        where ur.user_id = (select auth.uid()) and ur.role = 'gp'
      )
    )
  );
