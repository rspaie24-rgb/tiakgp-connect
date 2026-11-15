# TiakGP Connect

Marketplace web mobile-first de mise en relation pour le transport de colis au Sénégal (Tiak-Tiak) et à l'international Sénégal ↔ France (GP).

**Paiement :** exclusivement direct entre client et transporteur (hors plateforme).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Postgres, RLS)

## Configuration Supabase (obligatoire pour auth réelle)

1. Crée un projet sur [https://supabase.com](https://supabase.com)
2. **SQL** → New query → colle et exécute le fichier `supabase/migrations/0001_initial_schema.sql`
3. **Project Settings → API** : copie
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Auth → Providers** : Email activé (confirmation e-mail optionnelle en dev)
5. Variables d'environnement :

### Local
```bash
cp .env.example .env.local
# édite .env.local avec tes clés
npm install
npm run dev
```

### Vercel
Project → Settings → Environment Variables → ajoute les deux `NEXT_PUBLIC_*`, puis Redeploy.

## Pages

- `/` Accueil
- `/local` Recherche Tiak-Tiak
- `/gp` Recherche GP
- `/transporter/[id]` Fiche + Messagerie / WhatsApp
- `/publish` Publier une disponibilité
- `/login` Auth Supabase
- `/dashboard` Tableau de bord
- `/admin` Signalements & requêtes (mock admin pour l'instant)

## Aperçu live

https://tiakgp-connect.vercel.app

## Prochaines étapes

- Brancher listes Local/GP sur tables Supabase (fallback mock si non configuré)
- Dashboard dynamique (demandes réelles)
- Messagerie liée aux demandes
- Rôle admin + politiques RLS admin

> Aucun paiement réel. Données sensibles protégées par RLS.
