# PROGRESS.md — État du projet UpDate Tech & Digital Solutions

Ce fichier sert de mémoire de reprise pour continuer le développement dans
VS Code (avec Claude Code ou tout autre agent). Mis à jour après chaque
session de travail. **Cette version couvre une session très dense** — tout
le "plus tard" évoqué précédemment (sauf Moncash) a été construit.

## ✅ Déjà fait

### Fondations
- Next.js (App Router) + TypeScript + Tailwind.
- Design system public "coral e-shop" + design interne "Fixoria-like".
- Script de seed (`npm run seed`) pour le premier compte SUPER_ADMIN.

### POS caché + sécurité + permissions par rôle
- Route secrète dynamique (`ADMIN_GATE_SLUG`), auth bcrypt + session JWT,
  anti brute-force persisté en base.
- Permissions par rôle : CASHIER limité à la Caisse + encaissement de
  solde ; Stock, Ventes, Rapport, Contenu, **Staff, Journal d'audit,
  Marketing** réservés au SUPER_ADMIN (middleware).
- **2FA (TOTP)** pour tout compte staff : activation avec QR code
  (`/dashboard/security`), vérification à la connexion
  (`/login/2fa`) si activée. Accessible à tous les rôles (sécurité
  personnelle, pas une fonctionnalité admin).
- **Gestion des comptes staff** (`/dashboard/staff`, SUPER_ADMIN) : créer,
  activer/désactiver, changer de rôle — impossible de se désactiver ou se
  rétrograder soi-même (évite un blocage total du dashboard).
- **Journal d'audit** (`/dashboard/audit`) : connexions, création de
  compte staff, changement de rôle/désactivation, activation/désactivation
  2FA. ⚠️ Couverture partielle — pas encore sur les changements de prix
  produit ni les annulations de commande (voir "reste à faire").

### Comptes clients (nouveau, remplace le suivi anonyme par numéro+email)
- Inscription/connexion (`/account/register`, `/account/login`), session
  distincte de celle du staff.
- Espace client (`/account`) : historique de commandes, points de
  fidélité, code de parrainage à partager.
- **Programme de fidélité réel** : 10 points gagnés par dollar dépensé
  (payé, en ligne ou au comptoir si l'email du client est reconnu),
  100 points = $1 de réduction utilisable au panier. Taux ajustables dans
  `src/lib/loyalty.ts`.
- **Parrainage automatisé** : un code de parrainage valide au moment de
  l'inscription donne 500 points au parrain ET au filleul, automatiquement
  — remplace l'ancien processus manuel par WhatsApp.

### Boutique publique
- **Recherche tolérante aux fautes de frappe** : repli automatique par
  similarité (distance de Levenshtein) si la recherche exacte ne trouve
  rien — ne nécessite aucune extension PostgreSQL (pg_trgm non requis).
- **Vignettes de couleur** pour les variantes (swatches cliquables, changent
  aussi la photo affichée si une image spécifique existe pour la variante).
- **Paiement en 3 fois sans frais** (`INSTALLMENT_3`) en plus de l'acompte
  50% existant — échéancier généré automatiquement (30/60 jours),
  encaissable au POS une mensualité à la fois.
- **Utilisation des points de fidélité** au panier (si connecté).
- **Avis clients avec photos** (jusqu'à 3 par avis, upload via Vercel Blob).
- Recherche, filtres, pagination, double devise, codes promo, frais de
  livraison par zone, suivi de commande, blog, FAQ, témoignages, carte
  Google Maps, widget WhatsApp, sélecteur FR/HT (partiel) — inchangés des
  sessions précédentes.
- **PWA installable** pour le site public (`site-manifest.json`), en plus
  du POS qui l'était déjà. ⚠️ Nécessite que Gui ajoute les fichiers
  d'icônes (voir "à faire").

### POS interne
- **Support scanner de code-barres** : dès qu'un SKU exact est détecté
  dans la recherche (comportement typique d'un scanner "clavier"), le
  produit est ajouté automatiquement au panier de caisse, sans clic. Testé
  uniquement en simulant la frappe rapide — **la vérification avec un
  vrai scanner physique reste à faire une fois le matériel en main** (pas
  de la maintenance, un test ponctuel comme n'importe quel nouveau
  périphérique).
- **Impression thermique affinée** : choix du format (58mm / 80mm / PDF
  A4) avant impression, avec `@page` CSS adapté à chaque format. Reste
  dépendant du pilote d'imprimante installé sur l'ordinateur du comptoir
  — **à vérifier avec l'imprimante thermique réelle** une fois reçue.
- **Mode hors-ligne basique** : si la connexion tombe pendant une vente
  (scénario réaliste en Haïti), la vente est mise en file d'attente locale
  (IndexedDB) au lieu d'échouer, avec synchronisation automatique dès le
  retour du réseau. ⚠️ **Limite honnête** : ça protège une vente en cours
  de session déjà chargée — ça ne permet pas de démarrer le POS à froid
  sans connexion du tout (ça demanderait un service worker qui précharge
  toute l'appli et les données produits, un projet nettement plus lourd,
  pas fait ici).
- Caisse, Stock & Produits (+ catégorie/image/**variantes**), Ventes &
  Factures, rapport de clôture quotidien, encaissement de solde/mensualité
  — inchangés des sessions précédentes.
- **Interface de gestion des variantes** (couleur, stockage, prix, stock)
  ajoutée dans l'écran Stock — n'existait pas du tout avant cette session
  (seul Prisma Studio permettait d'en créer).

### Marketing
- **Segmentation email par tag client** (`/dashboard/marketing`,
  SUPER_ADMIN) : envoi de campagnes ciblées par tag ou à tous les clients
  inscrits, historique des campagnes envoyées. ⚠️ Les tags eux-mêmes ne
  sont pas encore assignés automatiquement (champ `Customer.tags`) — à
  faire à la main via Prisma Studio pour l'instant, ou à étendre plus tard
  avec une logique automatique (ex. "vip" si total dépensé > $500).

### Qualité / robustesse
- `npx eslint src` : 0 erreur. `npx tsc --noEmit` : aucune erreur réelle
  en dehors de l'absence du client Prisma généré (limitation du bac à
  sable, voir plus bas).
- **Deux bugs de fusion de code corrigés en cours de route** (des morceaux
  de fichiers mal recollés lors d'éditions précédentes) qui auraient
  empêché le projet de compiler : dans `api/checkout/route.ts` et
  `lib/email.ts`. Trouvés grâce à la vérification systématique après
  chaque gros bloc de travail.

## ⛔️ Définitivement annulé par décision de Gui (PDG)

- **Service de commande assistée** (AliExpress/Amazon/Shein/Temu).
- **Instant Web (générateur IA Gemini)**.
- **Moncash** — explicitement mis de côté pour cette session, pas branché.

## 🔧 Ce qui reste

### Ce qui touche au matériel réel — pas du code, une vérification ponctuelle
- **Scanner de code-barres** : le logiciel est prêt (détection SKU exact →
  ajout automatique), mais n'a jamais été testé avec un vrai scanner
  physique. À brancher et essayer une fois reçu.
- **Imprimante thermique** : le CSS d'impression est prêt pour 58mm/80mm,
  mais le rendu final dépend du pilote d'imprimante réel installé sur
  l'ordinateur du comptoir. À tester avec l'imprimante en main.
- Ces deux points ne sont **pas de la maintenance** — comme brancher une
  clé API, c'est une vérification qui se fait une fois.

### Avant toute mise en ligne réelle — toujours la priorité n°1
Rien de ce qui a été construit (dans cette session ou les précédentes) n'a
été testé avec de vraies clés/API. Voir la checklist de test complète dans
les sections précédentes de ce fichier (conservée ci-dessous) — elle
s'applique d'autant plus maintenant vu le volume de nouveau code : compte
client, fidélité, paiement en 3 fois, 2FA, campagnes email, upload de
photos avis, tout ça doit être testé en conditions réelles avant le
lancement.

### À faire par Gui (contenu, clés, infra)
- Icônes PWA du site public (`public/icons/site-icon-192.png` et `-512.png`)
  — le site est installable mais ces fichiers n'existent pas encore.
- Assigner des tags aux clients (`Customer.tags`) pour que la segmentation
  email serve à quelque chose.
- Toutes les clés listées dans `.env.example` (inchangé : Stripe, Resend,
  Twilio, Sentry, Vercel Blob, base de données, etc.).
- Créer au moins un compte CASHIER en plus du SUPER_ADMIN pour tester les
  permissions par rôle et la 2FA en situation réelle.

### Idées non retenues cette fois (à évaluer plus tard si tu veux)
- Journal d'audit : pas encore sur les changements de prix produit ni les
  annulations de commande — seulement sur les actions liées aux comptes.
- Assignation automatique des tags clients (ex. "vip" selon le montant
  dépensé) — actuellement manuel.
- Service worker complet pour un démarrage 100% hors-ligne du POS (voir
  limitation ci-dessus) — l'actuel protège seulement une session déjà
  chargée.
- Anti-spam plus robuste que le honeypot sur l'upload de photo d'avis
  (endpoint public, donc vecteur d'abus théorique à surveiller).
- Audit d'accessibilité complet (contrastes, lecteur d'écran).

### Déploiement (infra) — inchangé, toujours à vérifier
- Base de données hébergée, domaine, Vercel, webhook Stripe, Resend.
- 4 crons Vercel configurés (`daily-report`, `release-reservations`,
  `abandoned-cart`, `backup-email`) — vérifie les limites de ton plan.
- Si tu actives Sentry/Blob : voir `.env.example` pour les variables.

### Une fois en ligne — exécuter dans l'ordre
```bash
npm install
npx prisma generate
npx prisma migrate deploy   # ou "migrate dev" en local
npm run seed                 # crée ton premier compte admin
npm run build
```

## ⚠️ Limitation connue de l'environnement de préparation

Ce projet a été préparé dans un bac à sable sans accès réseau complet.
`npx prisma generate` et `npx prisma validate` échouent ici car
`binaries.prisma.sh` est bloqué — toutes les erreurs `tsc` restantes dans ce
projet viennent uniquement de ça et disparaîtront après un `prisma generate`
réussi chez toi. Le schéma (near 280 lignes maintenant, beaucoup de
nouveaux modèles cette session) a été relu manuellement pour la syntaxe à
plusieurs reprises. `next/font/google` reste retiré du layout pour la même
raison réseau (fonts systèmes, aussi plus performant).
