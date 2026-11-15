-- Abonnements professionnels (GP / Tiak-Tiak)
-- Accès aux coordonnées des chercheurs pendant la période payante

create table if not exists public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text default 'transporter_monthly',
  amount integer default 1500,
  currency text default 'XOF',
  status text default 'active' check (status in ('active', 'expired', 'pending')),
  starts_at timestamptz default now(),
  ends_at timestamptz not null,
  provider text,
  provider_ref text,
  created_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions"
  on public.subscriptions for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

grant select on public.subscriptions to authenticated;
grant insert, update on public.subscriptions to authenticated; -- admin via policy

-- Période de lancement gratuite (6 mois à partir du 15 nov 2026)
-- Fonction qui détermine si un transporteur a accès aux contacts
create or replace function public.has_seeker_contact_access(p_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  launch_end timestamptz := '2027-05-15 23:59:59+00';
  has_active_sub boolean;
begin
  -- Pendant le lancement : gratuit pour tous les transporteurs
  if now() < launch_end then
    return true;
  end if;

  -- Après : vérifie un abonnement actif
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user_id
      and status = 'active'
      and ends_at > now()
  ) into has_active_sub;

  return has_active_sub;
end;
$$;

grant execute on function public.has_seeker_contact_access to authenticated;
