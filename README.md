# TiakGP Connect

Marketplace web mobile-first de mise en relation pour le transport de colis au Sénégal (Tiak-Tiak) et à l'international (GP).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Postgres, Storage, Realtime) + PostGIS (prévu)
- Données mockées pour le démarrage

## Démarrage local

```bash
npm install
cp .env.example .env.local   # puis remplir les clés Supabase
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Pages disponibles

- `/` — Accueil
- `/local` — Recherche Tiak-Tiak (mock + demande)
- `/gp` — Recherche GP (mock + demande)
- `/publish` — Publier une disponibilité (démo)
- `/login` — Connexion / inscription Supabase
- `/dashboard` — Tableau de bord (protégé)

## Fichiers clés

- `lib/mock-data.ts` — Données de démonstration
- `lib/supabase/` — Clients browser + server
- `supabase/migrations/0001_initial_schema.sql` — Schéma initial + RLS de base
- `middleware.ts` — Refresh de session Supabase
- `components/RequestDialog.tsx` — Modal de demande

## Prochaines étapes

1. Connecter un projet Supabase et appliquer la migration
2. Authentification complète + gestion des rôles
3. Persistance des annonces et des demandes
4. Tableaux de bord dynamiques + avis
5. Géolocalisation / PostGIS

Voir `cahier_des_charges.md` et `prompt_codex.md` pour le détail fonctionnel.

> Aucun paiement réel. Données fictives. MVP en construction.
