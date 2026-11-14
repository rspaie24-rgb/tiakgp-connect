# TiakGP Connect

Marketplace web mobile-first de mise en relation pour le transport de colis au Sénégal (Tiak-Tiak) et à l'international (GP).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Données mockées (Supabase prévu demain)

## Démarrage local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Pages disponibles

- `/` — Accueil
- `/local` — Recherche Tiak-Tiak (mock + cartes cliquables)
- `/gp` — Recherche GP (mock + cartes cliquables)
- `/transporter/[id]` — Fiche transporteur + avis démo
- `/publish` — Publier une disponibilité (démo)
- `/dashboard` — Tableau de bord mock (demandes + annonces)
- `/login` — Stub connexion (Supabase demain)

## Composants

- `components/TransporterCard.tsx` — Carte réutilisable avec lien profil + demande
- `components/RequestDialog.tsx` — Modal de demande simulée

## Prochaines étapes

- **Demain** : intégration Supabase (auth, persistance, RLS)
- Géolocalisation / carte
- Messagerie
- Avis réels après livraison

Voir `cahier_des_charges.md` pour le détail fonctionnel.

> Aucun paiement réel. Données fictives. MVP en construction.
