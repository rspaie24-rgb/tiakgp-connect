import type { AppRole } from "./roles";

/** Qui peut voir les offres GP (transporteurs GP publiées). */
export function canSeeGpOffers(role: AppRole | null): boolean {
  if (!role) return true; // visiteur : catalogue ouvert
  // GP ne voit PAS les offres des autres GP
  if (role === "gp") return false;
  // Tiak, personnel, commerçant, admin : oui
  return true;
}

/** Qui peut voir les offres Tiak-Tiak. */
export function canSeeLocalOffers(role: AppRole | null): boolean {
  if (!role) return true;
  // Tiak ne voit PAS les offres des autres Tiak
  if (role === "tiak_tiak") return false;
  return true;
}

/** Qui peut voir les annonces "je cherche un GP". */
export function canSeeSeekGp(role: AppRole | null): boolean {
  return role === "gp" || role === "admin";
}

/** Qui peut voir les annonces "je cherche un Tiak-Tiak". */
export function canSeeSeekLocal(role: AppRole | null): boolean {
  return role === "tiak_tiak" || role === "admin";
}

export function canPostSeek(role: AppRole | null): boolean {
  return role === "particulier" || role === "commercant" || role === "admin";
}
