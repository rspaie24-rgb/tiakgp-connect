# TiakGP Connect

Marketplace web mobile-first de mise en relation pour le transport de colis au Sénégal (Tiak-Tiak) et à l'international (GP).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Postgres, Storage, Realtime) + PostGIS (prévu)
- Données mockées pour le démarrage

## Démarrage

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Structure actuelle

- `app/page.tsx` — Accueil
- `app/local/page.tsx` — Recherche Tiak-Tiak (mock)
- `app/gp/page.tsx` — Recherche GP (mock)
- `lib/mock-data.ts` — Données de démonstration
- Fichiers de prototype et cahier des charges conservés

## Prochaines étapes

1. Authentification Supabase + rôles
2. Schéma SQL + RLS + migrations
3. Publication de disponibilités / trajets
4. Demandes de transport + statuts
5. Tableaux de bord et avis

Voir `cahier_des_charges.md` et `prompt_codex.md` pour le détail.

> Aucun paiement réel. Données fictives. Prototype en cours de construction.
