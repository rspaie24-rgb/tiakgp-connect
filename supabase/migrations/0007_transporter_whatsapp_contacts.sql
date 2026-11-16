-- Exposes a transporter WhatsApp contact only when that transporter has
-- explicitly enabled it. Direct reads of transporter_profiles remain owner-only.
create or replace function public.transporter_whatsapp_contacts(p_ids uuid[] default null)
returns table(user_id uuid, whatsapp_e164 text)
language sql
stable
security definer
set search_path = ''
as $$
  select tp.user_id, tp.whatsapp_e164
  from public.transporter_profiles tp
  where tp.whatsapp_enabled is true
    and tp.whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$'
    and (p_ids is null or tp.user_id = any(p_ids));
$$;

revoke all on function public.transporter_whatsapp_contacts(uuid[]) from public;
grant execute on function public.transporter_whatsapp_contacts(uuid[]) to anon, authenticated;
