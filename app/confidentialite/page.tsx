export default function Confidentialite() {
  return (
    <div className="max-w-2xl prose prose-sm">
      <h1 className="text-2xl font-bold mb-4">Politique de confidentialité</h1>

      <p>
        Cette politique explique comment YobbuGo (responsable : Astou) traite vos données personnelles.
      </p>

      <h2 className="text-lg font-semibold mt-6">Données collectées</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Nom complet</li>
        <li>Numéro de téléphone</li>
        <li>Mot de passe (stocké de façon sécurisée)</li>
        <li>Annonces publiées (trajets, disponibilités, demandes)</li>
        <li>Messages et avis</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">Finalités</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Création et gestion de votre compte</li>
        <li>Mise en relation entre clients et transporteurs</li>
        <li>Affichage de vos annonces et coordonnées aux personnes concernées</li>
        <li>Amélioration du service et lutte contre les abus</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">Base légale</h2>
      <p>
        Exécution du contrat (utilisation du service) et intérêt légitime
        (sécurité, amélioration). Vous pouvez retirer votre consentement à tout moment.
      </p>

      <h2 className="text-lg font-semibold mt-6">Partage</h2>
      <p>
        Vos données sont partagées uniquement avec les utilisateurs nécessaires
        (ex. un GP voit le téléphone d’un client qui cherche un GP).
        Aucune vente de données à des tiers.
        Hébergeurs techniques : Vercel et Supabase.
      </p>

      <h2 className="text-lg font-semibold mt-6">Durée de conservation</h2>
      <p>
        Données conservées tant que votre compte est actif, puis supprimées
        sur demande ou après une période d’inactivité raisonnable.
      </p>

      <h2 className="text-lg font-semibold mt-6">Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification ou la suppression de vos données
        en écrivant à :{" "}
        <a href="mailto:rspaie24@gmail.com" className="text-[#176c64] underline">rspaie24@gmail.com</a>
      </p>

      <h2 className="text-lg font-semibold mt-6">Sécurité</h2>
      <p>
        Connexions sécurisées (HTTPS). Mots de passe chiffrés.
        Accès limité aux données nécessaires.
      </p>

      <p className="text-sm text-[#698084] mt-8">
        Dernière mise à jour : novembre 2026
      </p>
    </div>
  );
}
