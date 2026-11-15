export function whatsappLink(phone: string | null | undefined, message: string) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (!clean) return null;
  const num = clean.startsWith("221") ? clean : `221${clean.replace(/^0/, "")}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | null | undefined) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  return clean ? `tel:+${clean.startsWith("221") ? clean : "221" + clean}` : null;
}
