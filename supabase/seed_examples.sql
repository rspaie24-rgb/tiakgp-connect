-- YobbuGo — exemples (GP, Tiak-Tiak, clients qui cherchent)
-- À exécuter une fois dans SQL Editor

-- Profils démo (sans compte auth : on assouplit temporairement la FK si besoin)
-- Si erreur FK auth.users, crée d'abord les users via l'UI Auth puis adapte les UUID.

do $$
declare
  gp1 uuid := '11111111-1111-4111-8111-111111111101';
  gp2 uuid := '11111111-1111-4111-8111-111111111102';
  tk1 uuid := '22222222-2222-4222-8222-222222222201';
  tk2 uuid := '22222222-2222-4222-8222-222222222202';
  cl1 uuid := '33333333-3333-4333-8333-333333333301';
  cl2 uuid := '33333333-3333-4333-8333-333333333302';
  cm1 uuid := '33333333-3333-4333-8333-333333333303';
begin
  -- Users auth (schéma Supabase)
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values
    (gp1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gp.aminata@phone.yobbugo.app', crypt('demo1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"GP Aminata"}', now(), now()),
    (gp2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gp.moussa@phone.yobbugo.app', crypt('demo1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"GP Moussa"}', now(), now()),
    (tk1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tiak.mamadou@phone.yobbugo.app', crypt('demo1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mamadou Ndiaye"}', now(), now()),
    (tk2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tiak.awa@phone.yobbugo.app', crypt('demo1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Awa Livraison"}', now(), now()),
    (cl1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client.fatou@phone.yobbugo.app', crypt('demo1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatou Diop"}', now(), now()),
    (cl2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client.ibrahima@phone.yobbugo.app', crypt('demo1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ibrahima Sall"}', now(), now()),
    (cm1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'commerce.yoff@phone.yobbugo.app', crypt('demo1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Boutique Yoff"}', now(), now())
  on conflict (id) do nothing;

  insert into public.profiles (id, display_name, phone) values
    (gp1, 'GP Aminata', '221770000001'),
    (gp2, 'GP Moussa', '221770000002'),
    (tk1, 'Mamadou Ndiaye', '221770000011'),
    (tk2, 'Awa Livraison', '221770000012'),
    (cl1, 'Fatou Diop', '221770000021'),
    (cl2, 'Ibrahima Sall', '221770000022'),
    (cm1, 'Boutique Yoff', '221770000031')
  on conflict (id) do update set display_name = excluded.display_name;

  insert into public.user_roles (user_id, role) values
    (gp1, 'gp'), (gp2, 'gp'),
    (tk1, 'tiak_tiak'), (tk2, 'tiak_tiak'),
    (cl1, 'particulier'), (cl2, 'particulier'),
    (cm1, 'commercant')
  on conflict do nothing;

  insert into public.transporter_profiles (user_id, kind, verification_status) values
    (gp1, 'gp', 'verified'),
    (gp2, 'gp', 'verified'),
    (tk1, 'tiak_tiak', 'verified'),
    (tk2, 'tiak_tiak', 'verified')
  on conflict (user_id) do nothing;

  -- Offres GP
  insert into public.gp_trips (transporter_id, origin_city, destination_city, departure_at, capacity_kg, remaining_capacity_kg, price_label, status)
  select gp1, 'Paris', 'Dakar', '2026-12-05', 15, 15, '8 €/kg', 'active'
  where not exists (select 1 from public.gp_trips where transporter_id = gp1 and origin_city = 'Paris');

  insert into public.gp_trips (transporter_id, origin_city, destination_city, departure_at, capacity_kg, remaining_capacity_kg, price_label, status)
  select gp2, 'Dakar', 'Paris', '2026-12-11', 10, 10, '6 000 FCFA/kg', 'active'
  where not exists (select 1 from public.gp_trips where transporter_id = gp2 and origin_city = 'Dakar');

  insert into public.gp_trips (transporter_id, origin_city, destination_city, departure_at, capacity_kg, remaining_capacity_kg, price_label, status)
  select gp1, 'Lyon', 'Dakar', '2026-12-18', 8, 8, '9 €/kg', 'active'
  where not exists (select 1 from public.gp_trips where transporter_id = gp1 and origin_city = 'Lyon');

  -- Offres Tiak-Tiak
  insert into public.local_availabilities (transporter_id, location, district, price_label, status)
  select tk1, 'Dakar', 'Plateau, Médina, Fann', '1 500 FCFA', 'active'
  where not exists (select 1 from public.local_availabilities where transporter_id = tk1);

  insert into public.local_availabilities (transporter_id, location, district, price_label, status)
  select tk2, 'Dakar', 'Parcelles, Yoff, Ouakam', '2 000 FCFA', 'active'
  where not exists (select 1 from public.local_availabilities where transporter_id = tk2 and district like 'Parcelles%');

  insert into public.local_availabilities (transporter_id, location, district, price_label, status)
  select tk1, 'Thiès', 'Centre-ville, Grand Standing', '1 200 FCFA', 'active'
  where not exists (select 1 from public.local_availabilities where transporter_id = tk1 and location = 'Thiès');

  -- Clients / commerçant qui cherchent
  insert into public.seek_posts (author_id, kind, origin, destination, desired_date, details, status)
  select cl1, 'gp', 'Paris', 'Dakar', '2026-12-08', 'Colis 5 kg — vêtements, fragile', 'active'
  where not exists (select 1 from public.seek_posts where author_id = cl1 and kind = 'gp');

  insert into public.seek_posts (author_id, kind, origin, destination, desired_date, details, status)
  select cm1, 'gp', 'Dakar', 'Maubeuge', '2026-12-15', 'Cartons boutique, ~12 kg', 'active'
  where not exists (select 1 from public.seek_posts where author_id = cm1 and kind = 'gp');

  insert into public.seek_posts (author_id, kind, origin, destination, desired_time, details, status)
  select cl2, 'tiak_tiak', 'Plateau', 'Almadies', 'Aujourd''hui 16h–18h', 'Sac 2 kg documents', 'active'
  where not exists (select 1 from public.seek_posts where author_id = cl2 and kind = 'tiak_tiak');

  insert into public.seek_posts (author_id, kind, origin, destination, desired_time, details, status)
  select cm1, 'tiak_tiak', 'Yoff', 'Sandaga', 'Demain matin 9h', 'Livraison commande client', 'active'
  where not exists (select 1 from public.seek_posts where author_id = cm1 and kind = 'tiak_tiak');
end $$;
