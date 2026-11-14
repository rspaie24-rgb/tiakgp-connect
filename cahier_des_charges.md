# TiakGP Connect — Cahier des charges fonctionnel (MVP)

## 1. Vision
Marketplace responsive web/PWA de mise en relation pour la livraison locale au Sénégal (Tiak-Tiak) et le transport international de colis (GP), ouverte aux particuliers et commerçants. Nom provisoire à valider.

## 2. Rôles
- Visiteur : consulter les offres publiques, rechercher.
- Client particulier : compte, demande de transport, messagerie, historique, avis.
- Client commerçant : fonctions client + profil boutique, demandes multiples, adresses enregistrées.
- Tiak-Tiak : profil vérifié, zones couvertes, disponibilité, prix indicatifs, acceptation des demandes, statut de livraison.
- GP : profil vérifié, itinéraires pays/ville départ-arrivée, dates de départ/arrivée/retour, capacité en kg, catégories de colis, prix, demandes.
- Administrateur : vérification, modération, litiges, comptes, annonces et signalements.
- Un compte peut posséder plusieurs rôles.

## 3. Écrans MVP
1. Accueil : deux parcours Livraison locale / GP international.
2. Inscription/connexion (téléphone OTP ou email, à configurer).
3. Recherche locale : ville, quartier, rayon géographique, disponibilité, tarifs, avis.
4. Recherche GP : pays et villes de départ/destination, dates, capacité, tarifs, avis.
5. Résultats en cartes et, à terme, carte géographique.
6. Fiche transporteur : identité publique, vérification, zones/trajets, calendrier, prix, avis.
7. Demande de transport : description, poids/dimensions, collecte/livraison, date, estimation, pièces jointes facultatives.
8. Messagerie liée à la demande.
9. Tableau de bord transporteur : demandes, disponibilités, offres, calendrier, statut.
10. Tableau de bord client : demandes, statut, historique, avis.
11. Administration : utilisateurs, vérifications, annonces, signalements, litiges.

## 4. Flux métier
- Le transporteur s'inscrit, complète son profil, soumet les justificatifs nécessaires, puis publie une disponibilité ou un trajet.
- Le client recherche et filtre, consulte le profil, crée une demande.
- Le transporteur accepte ou refuse; la demande suit les statuts : brouillon, envoyée, acceptée, en_cours, livrée, confirmée, annulée, litige.
- Un avis noté 1 à 5 est possible après livraison confirmée, une fois par partie et par prestation; modération et signalement possibles.
- Les annonces expirées sont masquées automatiquement; capacité GP réduite après confirmation d'une demande selon poids réservé.

## 5. Données essentielles
users(id, email, phone, display_name, status, created_at)
user_roles(user_id, role)
transporter_profiles(user_id, kind, bio, verification_status, service_area, pricing_notes)
local_availabilities(id, transporter_id, starts_at, ends_at, location, radius_km, status)
gp_trips(id, transporter_id, origin_country, origin_city, destination_country, destination_city, departure_at, arrival_at, return_at, capacity_kg, remaining_capacity_kg, price_amount, price_currency, price_unit, status)
transport_requests(id, client_id, transporter_id, local_availability_id nullable, gp_trip_id nullable, pickup_location, dropoff_location, description, weight_kg, requested_at, status)
messages(id, request_id, sender_id, body, created_at)
reviews(id, request_id, author_id, target_id, rating, comment, created_at)
reports(id, reporter_id, subject_type, subject_id, reason, status)
verification_documents(id, user_id, type, private_storage_path, status)

## 6. Règles techniques et sécurité
- Stack proposée : Next.js + TypeScript + Tailwind + Supabase (PostgreSQL, Auth, Storage, Realtime) + PostGIS pour recherches géographiques.
- Interface mobile-first, français en premier; internationalisation possible.
- Supabase RLS stricte sur chaque table; vérification d'autorisation serveur pour toutes les mutations; aucune pièce d'identité accessible publiquement.
- Anti-spam, limites de requêtes, journaux d'audit, consentement et politique de conservation des données.
- Ne pas afficher les coordonnées exactes du domicile; demander l'autorisation de géolocalisation et permettre la saisie manuelle.
- Aucun paiement réel dans le MVP initial : prix indicatifs et accord direct entre parties, à valider juridiquement.
- Vérifier obligations de transport, assurance, douane, protection des données (Sénégal et pays desservis), responsabilités de la plateforme, conditions générales et objets interdits avant lancement commercial.

## 7. Phasage
Phase 1 : authentification, profils, annonces/disponibilités, recherche, demandes, tableaux de bord, avis, modération.
Phase 2 : géolocalisation/cartographie, notifications push, messagerie temps réel, vérification avancée.
Phase 3 : paiements adaptés aux pays, commissions, suivi, preuve de livraison, application mobile native si nécessaire.

## 8. Critères d'acceptation MVP
- Un Tiak-Tiak peut publier et modifier ses zones et créneaux; une recherche par ville/quartier renvoie les profils pertinents.
- Un GP peut publier un trajet Paris→Dakar avec départ, arrivée, retour, capacité et prix; le client peut filtrer par route et date.
- Un client peut demander une prestation; le transporteur peut accepter/refuser; les deux voient les statuts.
- Un avis ne peut être publié que pour une prestation terminée et par une partie autorisée.
- Un utilisateur ne peut pas lire les demandes/messages privés d'autrui.
- L'administrateur peut suspendre un profil et retirer une annonce signalée.

## 9. Points à arbitrer
Nom définitif, pays pilotes, devise et tarification, vérification d'identité, commissions/paiements, réservation immédiate ou demande préalable, assurance et responsabilité.
