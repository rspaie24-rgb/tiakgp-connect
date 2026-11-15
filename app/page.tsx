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
          Des livreurs Tiak-Tiak près de chez vous et des GP entre le Sénégal et la France.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Profils vérifiables</span>
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Disponibilités publiées</span>
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Contact direct</span>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/local" className="block bg-white border border-[#e0e9e7] rounded-2xl p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🛵</div>
          <h2 className="text-xl font-bold mb-2">Livraison locale</h2>
          <p className="text-[#425d61]">Tiak-Tiak à Dakar, Thiès et environs. Filtrez par ville et quartier.</p>
        </Link>

        <Link href="/gp" className="block bg-white border border-[#e0e9e7] rounded-2xl p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">✈️</div>
          <h2 className="text-xl font-bold mb-2">GP international</h2>
          <p className="text-[#425d61]">Trajets Sénégal ↔ France. Capacité, dates et tarifs indicatifs.</p>
        </Link>
      </div>

      <p className="mt-12 text-sm text-[#72878a] text-center">
        YobbuGo — paiement direct entre client et transporteur. Aucun paiement sur la plateforme.
      </p>
    </div>
  );
}
