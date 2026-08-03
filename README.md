# UpDate — Tech & Digital Solutions

Socle du projet fusionnant `uptodateelectronic.com` et `gd-digital-studio.space`
en une seule plateforme Next.js : site public (boutique + services digitaux)
et système POS interne caché.

## Démarrage

```bash
npm install
cp .env.example .env   # puis remplir les valeurs, notamment ADMIN_GATE_SLUG
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

> Dans le bac à sable où ce projet a été préparé, l'accès réseau est limité
> et ne permet pas de télécharger les moteurs Prisma (binaries.prisma.sh)
> ni les polices Google. Ces deux opérations fonctionneront normalement
> dans ton propre environnement (avec accès internet complet).

## Comment fonctionne le POS caché

Le chemin du POS n'est jamais écrit en dur dans le code. Il vient
uniquement de la variable d'environnement `ADMIN_GATE_SLUG` (ex. `ops-7f2ac91`).

1. Toute URL `/[quelque-chose]/...` est interceptée par `src/app/[gate]/layout.tsx`.
2. Si `quelque-chose` ne correspond pas exactement à `ADMIN_GATE_SLUG`, on
   renvoie une 404 standard — indiscernable d'une vraie page introuvable.
3. Si ça correspond, `src/middleware.ts` protège `/dashboard` et `/api` derrière
   une session (cookie httpOnly, signé en JWT, expire après 12h).
4. La connexion (`login/actions.ts`) vérifie l'email + mot de passe hashé
   (bcrypt) en base, et bloque une adresse après 5 tentatives ratées (15 min).
5. Le manifest PWA (`manifest.webmanifest`) est généré dynamiquement avec le
   bon chemin secret — donc jamais exposé sur le site public, et seul le
   personnel qui installe l'app depuis la bonne URL y a accès.

**À faire avant la mise en prod :**
- Choisir un `ADMIN_GATE_SLUG` long et aléatoire (ex. généré avec
  `openssl rand -hex 8`), ne jamais le partager par SMS/email en clair.
- Ne jamais commiter le fichier `.env` réel dans Git.
- Ajouter les icônes PWA dans `public/icons/` (192px et 512px).
- Remplacer le rate-limit en mémoire par Redis si plusieurs instances serveur
  tournent en parallèle (Vercel = plusieurs instances possibles).

## Structure

```
src/app/
  page.tsx               Accueil public
  shop/                  Boutique hardware (stub)
  services/              Services digitaux & tarifs (stub)
  [gate]/                 Tout le POS, derrière le slug secret
    login/                Connexion
    dashboard/            Caisse / Stock / Ventes (stub)
    manifest.webmanifest/ Manifest PWA dynamique
src/components/public/   Navbar, Hero, Footer (thème coral)
src/lib/                  auth.ts (sessions), prisma.ts (DB)
prisma/schema.prisma      Modèles: User, Product, Variant, Order, ServiceBrief
```

## État du projet

Ce README couvre la mise en route initiale. Pour l'état détaillé et à jour
du projet (ce qui est fait, ce qui reste, ce qui a été volontairement
annulé — dont le générateur IA "Instant Web" et le service de commande
assistée AliExpress/Amazon/Shein/Temu), voir **`PROGRESS.md`** à la racine.
