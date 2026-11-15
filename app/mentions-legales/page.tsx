export default function MentionsLegales() {
  return (
    <div className="max-w-2xl prose prose-sm">
      <h1 className="text-2xl font-bold mb-4">Mentions légales</h1>

      <h2 className="text-lg font-semibold mt-6">Éditeur du site</h2>
      <p>
        <strong>YobbuGo</strong><br />
        Responsable de la publication : <strong>Astou</strong><br />
        Contact : <a href="mailto:rspaie24@gmail.com" className="text-[#176c64] underline">rspaie24@gmail.com</a>
      </p>

      <h2 className="text-lg font-semibold mt-6">Hébergement</h2>
      <p>
        Site hébergé par <strong>Vercel Inc.</strong><br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
      </p>
      <p>
        Base de données et authentification : <strong>Supabase</strong>
      </p>

      <h2 className="text-lg font-semibold mt-6">Objet du service</h2>
      <p>
        YobbuGo est une marketplace de mise en relation pour le transport de colis
        (Tiak-Tiak local et GP international entre le Sénégal et la France).
        Le paiement du transport se fait <strong>directement entre le client et le transporteur</strong>.
        YobbuGo n’intervient pas dans le paiement du colis.
      </p>

      <h2 className="text-lg font-semibold mt-6">Propriété intellectuelle</h2>
      <p>
        L’ensemble du contenu (textes, logo, structure) est protégé.
        Toute reproduction non autorisée est interdite.
      </p>

      <p className="text-sm text-[#698084] mt-8">
        Dernière mise à jour : novembre 2026
      </p>
    </div>
  );
}
