# Publication mobile YobbuGo

Le site public reste `https://www.yobbugo.com`. L'application native utilise
un bundle local et ne charge pas ce site dans une WebView.

## À configurer avant la première compilation

1. Copier `.env.example` vers `.env.production` et renseigner l'URL Supabase
   et sa clé publique/publishable. Ne jamais placer de clé `service_role` ici.
2. Appliquer `../../supabase/migrations/0006_release_security_hardening.sql`
   sur une base de préproduction, tester, puis appliquer en production.
3. Dans Supabase, configurer les URLs de redirection exactes pour
   `https://www.yobbugo.com` et le schéma mobile `yobbugo://auth/callback` si
   l'authentification par e-mail, magic link ou OAuth est activée ultérieurement.
4. Attribuer le rôle `admin` hors client à un compte de confiance : la migration
   interdit volontairement l'auto-attribution de ce rôle.

## Liens d'application

Pour que des liens `https://www.yobbugo.com/...` ouvrent l'app :

- publier `/.well-known/assetlinks.json` sur `www.yobbugo.com` avec le nom du
  package et l'empreinte SHA-256 du certificat Android de production ;
- publier `/.well-known/apple-app-site-association` avec l'Apple Team ID et
  l'App ID de production ;
- activer Associated Domains dans Xcode et le filtre Android App Links.

Ces identifiants dépendent des comptes développeur et ne doivent pas être
devinés ni remplacés par des valeurs de démonstration.

## Commandes de contrôle

```bash
pnpm --filter yobbugo-mobile run build
pnpm --filter yobbugo-mobile exec cap sync
pnpm --filter yobbugo-mobile exec cap open android
pnpm --filter yobbugo-mobile exec cap open ios
```

## Validation Store

- tester la création de compte, connexion, publication, suppression de compte,
  partage, retour réseau et ouverture de lien sur appareils réels ;
- créer les icônes et captures de chaque plateforme ;
- compléter Google Play Data Safety et Apple App Privacy ;
- fournir un compte de démonstration à la revue ;
- ajouter une interface de signalement et blocage d'utilisateur avant toute
  soumission publique, car les annonces, avis et messages sont du contenu
  généré par les utilisateurs.
