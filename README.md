# Système de Réservation WhatsApp

Ce projet est une application Next.js permettant de gérer des rendez-vous via WhatsApp, avec intégration de Supabase, Stripe, Twilio et OpenAI.

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
  - [Déploiement sur Vercel](#déploiement-sur-vercel)
  - [Déploiement sur un serveur traditionnel](#déploiement-sur-un-serveur-traditionnel)
- [Variables d'environnement](#variables-denvironnement)
- [Fonctionnalités](#fonctionnalités)

## Prérequis

- Node.js 14.x ou supérieur
- pnpm (recommandé) ou npm
- Compte Supabase
- Compte Twilio avec WhatsApp Business API
- Compte Stripe
- Compte OpenAI (pour les fonctionnalités d'IA)

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/whatsapp-booking.git
   cd whatsapp-booking
   ```

2. Installez les dépendances :
   ```bash
   pnpm install
   ```

3. Créez un fichier `.env.local` à partir du modèle `.env.example` :
   ```bash
   cp .env.example .env.local
   ```

4. Configurez les variables d'environnement dans le fichier `.env.local` (voir la section [Variables d'environnement](#variables-denvironnement)).

5. Lancez le serveur de développement :
   ```bash
   pnpm dev
   ```

## Configuration

### Configuration de Supabase

1. Créez un nouveau projet sur [Supabase](https://supabase.com).
2. Récupérez l'URL et la clé anonyme de votre projet dans les paramètres de l'API.
3. Ajoutez ces informations dans votre fichier `.env.local`.
4. Exécutez les migrations de base de données (si nécessaire).

### Configuration de Twilio pour WhatsApp

1. Créez un compte [Twilio](https://www.twilio.com) et activez l'API WhatsApp Business.
2. Configurez un numéro de téléphone WhatsApp dans votre compte Twilio.
3. Récupérez votre SID de compte, votre jeton d'authentification et votre numéro de téléphone.
4. Ajoutez ces informations dans votre fichier `.env.local`.

### Configuration de Stripe

1. Créez un compte [Stripe](https://stripe.com).
2. Récupérez vos clés API (publique et secrète) dans les paramètres du développeur.
3. Configurez un webhook Stripe pour gérer les événements de paiement.
4. Ajoutez ces informations dans votre fichier `.env.local`.

### Configuration d'OpenAI

1. Créez un compte [OpenAI](https://openai.com).
2. Générez une clé API dans les paramètres de votre compte.
3. Ajoutez cette clé dans votre fichier `.env.local`.

## Déploiement

### Déploiement sur Vercel

Le moyen le plus simple de déployer cette application est d'utiliser la plateforme [Vercel](https://vercel.com), créée par les développeurs de Next.js.

1. Créez un compte sur Vercel et connectez-le à votre dépôt Git.
2. Importez votre projet depuis GitHub, GitLab ou Bitbucket.
3. Configurez les variables d'environnement dans l'interface Vercel.
4. Déployez l'application.

```bash
# Installation de l'outil CLI Vercel (optionnel)
pnpm install -g vercel

# Déploiement avec l'outil CLI
vercel
```

### Déploiement sur un serveur traditionnel

Pour déployer sur un serveur traditionnel (VPS, serveur dédié, etc.) :

1. Construisez l'application pour la production :
   ```bash
   pnpm build
   ```

2. Démarrez le serveur de production :
   ```bash
   pnpm start
   ```

3. Pour un déploiement en production, il est recommandé d'utiliser un gestionnaire de processus comme PM2 :
   ```bash
   # Installation de PM2
   npm install -g pm2

   # Démarrage de l'application avec PM2
   pm2 start npm --name "whatsapp-booking" -- start
   ```

4. Configurez un serveur web (Nginx, Apache) comme proxy inverse :

   Exemple de configuration Nginx :
   ```nginx
   server {
     listen 80;
     server_name votre-domaine.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

5. Configurez HTTPS avec Let's Encrypt :
   ```bash
   sudo certbot --nginx -d votre-domaine.com
   ```

### Déploiement avec Docker

1. Construisez l'image Docker :
   ```bash
   docker build -t whatsapp-booking .
   ```

2. Exécutez le conteneur :
   ```bash
   docker run -p 3000:3000 --env-file .env.local whatsapp-booking
   ```

## Variables d'environnement

Voici les variables d'environnement nécessaires pour le projet :

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anonyme-supabase
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-supabase

# WhatsApp Business API via Twilio
TWILIO_ACCOUNT_SID=votre-sid-compte-twilio
TWILIO_AUTH_TOKEN=votre-jeton-auth-twilio
TWILIO_PHONE_NUMBER=votre-numéro-téléphone-twilio

# OpenAI API
OPENAI_API_KEY=votre-clé-api-openai

# Stripe
STRIPE_SECRET_KEY=votre-clé-secrète-stripe
STRIPE_WEBHOOK_SECRET=votre-secret-webhook-stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre-clé-publiable-stripe

# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-nextauth

# Cron
CRON_SECRET=votre-secret-cron
```

## Fonctionnalités

- Réservation de rendez-vous via WhatsApp
- Paiement en ligne avec Stripe
- Gestion des rendez-vous pour les professionnels
- Notifications automatiques par WhatsApp
- Assistance IA pour les réponses automatiques
- Calendrier de disponibilité
- Tableau de bord pour les professionnels et les clients

## Maintenance

### Mises à jour

Pour mettre à jour l'application :

```bash
git pull
pnpm install
pnpm build
pnpm start
```

### Sauvegardes

Il est recommandé de sauvegarder régulièrement votre base de données Supabase. Vous pouvez utiliser l'interface Supabase pour exporter vos données ou configurer des sauvegardes automatiques.

### Surveillance

Utilisez des outils comme Sentry ou New Relic pour surveiller les performances et les erreurs de votre application en production.

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt GitHub du projet ou contacter l'équipe de support.
