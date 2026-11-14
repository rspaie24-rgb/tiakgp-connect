# Prompt à donner à Codex

Je souhaite développer **TiakGP Connect**, une marketplace web mobile-first de transport de colis au Sénégal et entre le Sénégal et l'international. Lis intégralement `cahier_des_charges.md` et prends `prototype.html` comme référence d'interface et de parcours (les données actuelles sont fictives).

Stack : Next.js (App Router), TypeScript, Tailwind, Supabase Auth/Postgres/Storage avec RLS, PostGIS pour la recherche par rayon. Structure le code proprement, avec migrations SQL, validation des entrées côté serveur, composants accessibles, tests essentiels et fichier `.env.example` sans secret.

Procède par étapes :
1. Inspecte le dépôt existant et propose un plan sans écraser les fichiers existants.
2. Implémente le design responsive et les écrans publics (accueil, recherche Tiak-Tiak, recherche GP, fiche transporteur) avec données mockées.
3. Ajoute authentification et rôles multiples (particulier, commerçant, Tiak-Tiak, GP, admin), schéma SQL, migrations et RLS.
4. Ajoute la publication de disponibilités locales et de trajets GP (départ, arrivée, retour, capacité), puis les demandes de transport et statuts.
5. Ajoute les tableaux de bord, avis uniquement après prestation confirmée et administration/modération.
6. Prépare tests, instructions de démarrage et déploiement; indique clairement ce qui reste fictif.

Règles : aucun paiement réel ni promesse de vérification d'identité tant que les intégrations et validations réglementaires ne sont pas en place; pas d'exposition publique des documents d'identité ni des adresses privées; contrôle d'accès serveur et RLS partout; n'invente pas d'intégrations externes. Avant chaque étape importante, présente les changements prévus. Commence par l'étape 1 et attends ma validation avant d'écrire du code.
