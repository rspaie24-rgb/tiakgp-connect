import Link from "next/link";

/** Bandeau pour personnel / commerçant : publier une demande si pas d'offre. */
export function SeekCta({ kind }: { kind: "gp" | "tiak" }) {
  const isGp = kind === "gp";
  return (
    <div className="mt-8 mb-4 bg-[#fff8e8] border border-[#efbb45]/60 rounded-2xl p-5">
      <h3 className="font-bold text-[#243234] mb-1">
        {isGp
          ? "Pas de GP à la date que vous souhaitez ?"
          : "Pas de Tiak-Tiak disponible à l'horaire voulu ?"}
      </h3>
      <p className="text-sm text-[#425d61] mb-3">
        Personnel et commerçants : publiez une annonce « Je cherche ». Les{" "}
        {isGp ? "GP" : "Tiak-Tiak"} la verront et pourront vous contacter.
      </p>
      <Link
        href="/chercher"
        className="inline-block bg-[#efbb45] text-[#243234] font-bold rounded-xl px-5 py-2.5 text-sm"
      >
        {isGp ? "Publier « Je cherche un GP »" : "Publier « Je cherche un Tiak-Tiak »"}
      </Link>
    </div>
  );
}
