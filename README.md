# iziClub Mobile 🏆

Application mobile **iziClub** développée avec [Expo](https://expo.dev) / React Native. Elle permet aux utilisateurs de rechercher des clubs sportifs et des événements autour d'eux, de consulter leurs fiches détaillées, de gérer leur adhésion et leur participation, et de suivre leur activité (clubs suivis, événements aimés/enregistrés, inscriptions, notifications...).

## Sommaire

- [Fonctionnalités clés](#fonctionnalités-clés)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration (.env)](#configuration-env)
- [Lancer l'application](#lancer-lapplication)
- [Scripts disponibles](#scripts-disponibles)
- [Build & déploiement (EAS)](#build--déploiement-eas)
- [Notes techniques](#notes-techniques)
- [Dépannage](#dépannage)

## Fonctionnalités clés

### 🔐 Authentification
- Inscription en plusieurs étapes (informations personnelles, création de mot de passe) et connexion par email/mot de passe.
- Récupération de mot de passe oublié.
- Session persistante via un token stocké de façon sécurisée (`expo-secure-store`), rafraîchi automatiquement à chaque requête et invalidé proprement en cas d'expiration (401).

### 🔎 Recherche de clubs & d'événements
- Recherche textuelle avec filtres avancés (rayon de recherche géolocalisé, sport, tri) accessibles via un panneau de filtres animé.
- Deux onglets de résultats : **Clubs** et **Événements**, avec pagination infinie sur les événements.
- Vue **carte interactive** (`react-native-maps`) centrée sur la position de l'utilisateur, avec marqueurs personnalisés, bulles d'info (callouts) et recherche "dans cette zone" en déplaçant la carte.
- Filtrage indépendant de l'affichage des clubs / événements sur la carte.

### 🏟️ Fiches clubs & événements
- Fiche club complète : informations générales, sessions/calendrier, galerie photo, contact, adhésion (avec formulaire dynamique de questions), sélection de sections par onglets.
- Fiche événement complète : description, tags/sport, date/heure, lieu (mini-carte), club organisateur et clubs partenaires, ajout au calendrier natif du téléphone, partage natif, like/participation.
- Système de like ❤️, sauvegarde 🔖 et participation ✅ sur les clubs et événements, avec compteur d'engagement.

### 👤 Profil utilisateur
- Clubs suivis, événements aimés, événements sauvegardés, événements à venir, historique d'inscriptions.
- Détail d'une inscription (statut, informations transmises).
- Avatar généré via Gravatar.

### 🔔 Notifications
- Liste des notifications avec détail par notification.

### 📍 Géolocalisation
- Demande de permission de localisation à la volée, avec repli sur une position par défaut si l'utilisateur la refuse, utilisée pour trier/filtrer les résultats par distance.

## Stack technique

| Domaine | Choix technique |
|---|---|
| Framework | [Expo](https://expo.dev) (SDK 57) + React Native 0.86 + React 19 |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (routing par fichiers, groupes `(auth)` / `(main)`) |
| Langage | TypeScript |
| Requêtes HTTP | [Axios](https://axios-http.com/) avec intercepteurs (auth + gestion des erreurs 401) |
| Stockage sécurisé | `expo-secure-store` / `@react-native-async-storage/async-storage` |
| Carte | `react-native-maps` (Apple Maps sur iOS, Google Maps sur Android) |
| Calendrier | `expo-calendar` + `react-native-big-calendar` |
| UI | Composants React Native "faits main" (cartes, modales, barres d'onglets personnalisées), `@expo/vector-icons`, `react-native-paper` |
| Gestion d'état | React Context (`AuthContext`, `LocationContext`) + hooks dédiés (`useSearch`, `useClubs`, `useEngagement`) |

## Architecture du projet

```
app/                     # Écrans (routing basé sur les fichiers via expo-router)
  _layout.tsx            # Layout racine (Stack + providers globaux)
  (auth)/                # Écrans non authentifiés : login, register, mot de passe oublié...
  (main)/                # Écrans authentifiés, organisés par onglets (Tabs)
    home/                # Accueil
    search/               # Recherche (onglets Clubs/Événements, carte, fiches détail)
    profile/              # Profil et sous-pages (clubs suivis, favoris, inscriptions...)
  notifications/          # Liste + détail des notifications

components/              # Composants UI réutilisables (cartes, barres, modales, sections de fiche club...)
context/                 # Contexts React globaux (authentification, localisation)
hooks/                    # Hooks personnalisés
mappers/                  # Fonctions de mapping API -> modèles front (club, événement)
services/                 # Appels API (axios) : auth, clubs, événements, notifications, formulaires, sports...
types/                    # Types TypeScript partagés (club, événement, notification...)
assets/                   # Images et ressources statiques
```

**Principes retenus :**
- Chaque écran d'`app/` reste léger et délègue la logique métier aux `services/` (accès API) et aux hooks (`useSearch`, `useClubs`, `useEngagement`...).
- Les réponses API brutes sont converties via `mappers/` en modèles typés (`types/`) consommés par l'UI, pour découpler le format API du format d'affichage.
- L'authentification et la position de l'utilisateur sont partagées globalement via `AuthContext` et `LocationContext`, disponibles dans toute l'application.

## Prérequis

- [Node.js](https://nodejs.org/) 20 LTS ou supérieur, et npm.
- Un compte [Expo](https://expo.dev) (recommandé, notamment pour les builds EAS).
- L'application [Expo Go](https://expo.dev/go) installée sur votre téléphone (Android ou iOS), en vous assurant qu'elle correspond à la version du SDK Expo du projet (voir `expo` dans [package.json](package.json)). Le projet ne nécessite **aucun build natif personnalisé** : toutes les dépendances utilisées (carte, calendrier, capteurs...) sont compatibles avec Expo Go telles quelles.
- Alternative : un simulateur iOS (Xcode, macOS uniquement) ou un émulateur Android (Android Studio), si vous préférez ne pas utiliser un appareil physique.

## Installation

```bash
git clone <url-du-repo>
cd iziclub-mobile
npm install
```

## Configuration (.env)

Le projet nécessite un fichier **`.env`** à la racine (non versionné, exclu par `.gitignore`) pour fonctionner. Copiez le modèle fourni puis complétez-le :

```bash
cp .env.example .env
```

```bash
# .env
AUTH_API_KEY="<votre_clé>"
EXPO_PUBLIC_API_URL="https://api.iziclub.fr/api/v1/"
```

| Variable | Obligatoire | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | URL de base de l'API iziClub consommée par [services/api.tsx](services/api.tsx). Le préfixe `EXPO_PUBLIC_` est requis par Expo pour exposer la variable au code client (voir [documentation Expo](https://docs.expo.dev/guides/environment-variables/)). Changez-la pour pointer vers un environnement de staging/local si besoin. |
| `AUTH_API_KEY` | ✅ | Clé utilisée par la chaîne d'outils/scripts du projet au démarrage. |

> ⚠️ Sans `EXPO_PUBLIC_API_URL` défini, l'application lève une erreur explicite au démarrage plutôt que d'appeler une API par défaut potentiellement incorrecte.

## Lancer l'application

```bash
npx expo start
```

Le projet est configuré pour être **directement utilisable dans Expo Go**, sans étape supplémentaire : le CLI Expo affiche un QR code qu'il suffit de scanner avec l'app [Expo Go](https://expo.dev/go) sur votre téléphone. Le même menu permet aussi d'ouvrir le projet dans :
- un simulateur iOS,
- un émulateur Android,
- le navigateur (web).

Raccourcis disponibles :

```bash
npx expo start --ios       # Ouvre directement le simulateur iOS
npx expo start --android   # Ouvre directement l'émulateur Android
npx expo start --web       # Ouvre la version web
npx expo start -c          # Démarre en vidant le cache Metro (utile après un changement de dépendances natives)
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run start` | Démarre le serveur de développement Expo. |
| `npm run android` | Démarre et ouvre l'app sur un émulateur/appareil Android. |
| `npm run ios` | Démarre et ouvre l'app sur un simulateur/appareil iOS. |
| `npm run web` | Démarre la version web de l'app. |
| `npm run lint` | Analyse le code avec ESLint (`eslint-config-expo`). |
| `npm run reset-project` | Réinitialise le dossier `app/` sur un projet vierge (script de démarrage Expo, à utiliser avec précaution). |

## Build & déploiement (EAS)

Les profils de build sont définis dans [eas.json](eas.json) et s'utilisent avec [EAS CLI](https://docs.expo.dev/eas/) :

```bash
npm install -g eas-cli
eas login

eas build --profile development --platform ios      # Développement (dev client)
eas build --profile preview --platform android       # Build interne de test
eas build --profile production --platform all        # Build de production (stores)
```

Le profil `production-apk` permet de générer un `.apk` Android directement installable (hors Play Store), pratique pour des tests internes.

## Notes techniques

- **Routing** : `expo-router` avec `main: "expo-router/entry"`. Les groupes de dossiers `(auth)` et `(main)` isolent les écrans non-authentifiés des écrans authentifiés ; `(main)` utilise un layout `Tabs` (accueil, recherche, profil).
- **Authentification** : le token est injecté automatiquement dans chaque requête Axios via un intercepteur ([services/api.tsx](services/api.tsx)). Une réponse `401` déclenche la purge du token et une redirection vers l'écran de connexion.
- **Géolocalisation** : `LocationContext` centralise la demande de permission et la position courante (`expo-location`), consommée par la recherche, la carte et les fiches club pour calculer les distances.
- **Cartes** : `react-native-maps` utilise Apple Maps par défaut sur iOS et Google Maps sur Android (`PROVIDER_GOOGLE`), sans configuration de clé API supplémentaire nécessaire en développement avec Expo Go.
- **Nouvelle architecture React Native** : le projet tourne sous SDK 57, qui active la New Architecture (Fabric/TurboModules) par défaut.
- **TypeScript strict** : tous les écrans et services sont typés ; les modèles API bruts sont convertis via les fonctions de `mappers/` avant d'être utilisés dans l'UI.

## Dépannage

- **"Project is incompatible with this version of Expo Go"** : la version installée d'Expo Go ne correspond pas au SDK du projet. Mettez à jour Expo Go sur votre appareil, ou alignez la version d'`expo` du projet sur celle attendue.
- **La carte s'affiche vide** : vérifiez que les autorisations de localisation sont accordées et relancez avec `npx expo start -c` pour vider le cache Metro après une mise à jour de dépendances natives (`react-native-maps`, `react-native-reanimated`...).
- **Changement de dépendances natives sans effet** : fermez complètement Expo Go / l'app de dev et relancez `npx expo start -c`.

