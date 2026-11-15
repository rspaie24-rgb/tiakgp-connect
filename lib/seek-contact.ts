import { createClient } from "@/lib/supabase/client";

export async function registerContactClick(seekId: number, transporterId: string) {
  const supabase = createClient();

  // Vérifie si déjà cliqué
  const { data: existing } = await supabase
    .from("seek_contact_clicks")
    .select("id")
    .eq("seek_id", seekId)
    .eq("transporter_id", transporterId)
    .maybeSingle();

  if (existing) return { already: true };

  // Enregistre le clic
  const { error: clickErr } = await supabase.from("seek_contact_clicks").insert({
    seek_id: seekId,
    transporter_id: transporterId,
  });
  if (clickErr) return { error: clickErr.message };

  // Incrémente le compteur
  const { data: seek } = await supabase
    .from("seek_posts")
    .select("contact_count")
    .eq("id", seekId)
    .single();

  const newCount = (seek?.contact_count || 0) + 1;
  const updates: { contact_count: number; status?: string } = { contact_count: newCount };
  if (newCount >= 5) updates.status = "hidden";

  await supabase.from("seek_posts").update(updates).eq("id", seekId);

  return { count: newCount, hidden: newCount >= 5 };
}
