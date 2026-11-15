# YobbuGo

Marketplace web mobile-first de mise en relation pour le transport de colis au Sénégal (Tiak-Tiak) et à l'international Sénégal ↔ France (GP).

**Ancien nom de travail :** TiakGP Connect.

**Paiement :** exclusivement direct entre client et transporteur (hors plateforme).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Postgres, RLS)

## Configuration Supabase

1. Projet Supabase : `https://babzsgakaxovdkszrtip.supabase.co`
2. **SQL Editor** → exécuter `supabase/migrations/0001_initial_schema.sql`
3. Variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Local
```bash
cp .env.example .env.local
npm install
npm run dev
```

### Vercel
Settings → Environment Variables → ajouter les deux clés → Redeploy.

## Pages

- `/` Accueil
- `/local` Recherche Tiak-Tiak
- `/gp` Recherche GP
- `/transporter/[id]` Fiche + Messagerie / WhatsApp
- `/publish` Publier une disponibilité
- `/login` Auth Supabase
- `/dashboard` Tableau de bord
- `/admin` Signalements & requêtes

## Live

https://tiakgp-connect.vercel.app

> Aucun paiement réel. Données protégées par RLS.
