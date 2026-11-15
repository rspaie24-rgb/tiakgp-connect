export type AppRole = "particulier" | "commercant" | "tiak_tiak" | "gp" | "admin";

export const ROLE_LABELS: Record<AppRole, string> = {
  particulier: "Personnel",
  commercant: "Commerçant",
  tiak_tiak: "Tiak-Tiak",
  gp: "GP",
  admin: "Admin",
};

export function isTransporter(role: AppRole | null): boolean {
  return role === "tiak_tiak" || role === "gp";
}

export function isSeeker(role: AppRole | null): boolean {
  return role === "particulier" || role === "commercant";
}
