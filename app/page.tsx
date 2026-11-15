import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#155b58] to-[#0b3d44] text-white rounded-3xl p-8 md:p-12 mb-8">
        <div className="text-sm mb-2">📦 YobbuGo — LE TRANSPORT DE COLIS, SIMPLIFIÉ</div>
        <h1 className="text-3xl md:text-5xl font-bold max-w-2xl mb-4">
          Un colis à envoyer ? Trouvez le bon transporteur.
        </h1>
        <p className="opacity-90 max-w-xl mb-6">
          Tiak-Tiak locaux et GP internationaux : Sénégal, France, Maroc, Chine, Dubaï, Turquie.
        </p>
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            href="/publish"
            className="bg-[#f5c65d] text-[#132a35] font-bold rounded-xl px-6 py-3"
          >
            Publier une annonce
          </Link>
          <Link
            href="/chercher"
            className="bg-white/20 font-semibold rounded-xl px-6 py-3"
          >
            Je cherche un transporteur
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Profils vérifiables</span>
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Disponibilités publiées</span>
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Contact direct WhatsApp</span>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link href="/local" className="block bg-white border border-[#e0e9e7] rounded-2xl p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🛵</div>
          <h2 className="text-xl font-bold mb-2">Livraison locale</h2>
          <p className="text-[#425d61]">Tiak-Tiak à Dakar, Thiès et dans les grandes villes.</p>
        </Link>

        <Link href="/gp" className="block bg-white border border-[#e0e9e7] rounded-2xl p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">✈️</div>
          <h2 className="text-xl font-bold mb-2">GP international</h2>
          <p className="text-[#425d61]">
            Trajets Sénégal ↔ France, Maroc, Chine, Dubaï, Turquie.
          </p>
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">Corridors GP populaires</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {[
          "Dakar → Paris",
          "Paris → Dakar",
          "Dakar → Casablanca",
          "Casablanca → Dakar",
          "Dakar → Dubaï",
          "Dubaï → Dakar",
          "Dakar → Istanbul",
          "Istanbul → Dakar",
          "Dakar → Guangzhou / Chine",
          "Chine → Dakar",
        ].map(route => (
          <Link
            key={route}
            href={`/gp?q=${encodeURIComponent(route.split(" → ")[1] || "")}`}
            className="bg-white border border-[#e0e9e7] rounded-xl px-4 py-3 text-sm font-medium hover:border-[#176c64] transition"
          >
            🌍 {route}
          </Link>
        ))}
      </div>

      <section className="bg-white border border-[#e0e9e7] rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">FAQ</h2>
        <div className="space-y-4 text-sm">
          <div>
            <div className="font-bold">Comment ça marche ?</div>
            <p className="text-[#425d61]">
              Les transporteurs publient leurs disponibilités. Les clients publient « je cherche » ou contactent directement. Le paiement se fait en direct.
            </p>
          </div>
          <div>
            <div className="font-bold">C’est gratuit ?</div>
            <p className="text-[#425d61]">
              Oui pendant le lancement. Pas de commission sur la plateforme.
            </p>
          </div>
          <div>
            <div className="font-bold">Qui peut publier ?</div>
            <p className="text-[#425d61]">
              Personnel, commerçant, Tiak-Tiak et GP. Chaque profil voit ce qui le concerne.
            </p>
          </div>
          <div>
            <div className="font-bold">Comment contacter ?</div>
            <p className="text-[#425d61]">
              Téléphone, WhatsApp ou message interne, selon ce qui est affiché.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-12 text-sm text-[#72878a] text-center">
        YobbuGo — paiement direct entre client et transporteur. Aucun paiement sur la plateforme.
      </p>
    </div>
  );
}
