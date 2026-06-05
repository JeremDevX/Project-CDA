# LegacyGift Back

API LegacyGift en `Express 5`, `TypeScript`, `Prisma` et `PostgreSQL`.

## Rôle

Le back porte la logique métier serveur :

- authentification JWT ;
- création et édition de gifts ;
- message HTML sanitisé ;
- gestion des médias via stockage S3 compatible Supabase ;
- destinataires et tiers de confiance ;
- validation finale, paiement Stripe, justificatif PDF ;
- check-in périodique, relances, escalade tiers, livraison ou expiration.

Base API locale : `http://localhost:1337/api`.

## Stack

- Runtime : Node.js
- API : Express 5
- Langage : TypeScript strict, CommonJS compile vers `dist/`
- ORM : Prisma 7 avec adaptateur PostgreSQL
- Auth : JWT + bcrypt + blacklist logout
- Paiement : Stripe Checkout
- Média : `multer` en mémoire + S3 compatible Supabase Storage
- Emails : Nodemailer ou logs serveur si SMTP absent
- Jobs : `node-cron`
- Tests : Vitest + mocks métier
- Qualité : ESLint flat config

## Installation

Depuis la racine :

```bash
npm install
npm run prisma:generate --workspace back
```

Configurer `back/.env`, puis lancer :

```bash
npm run dev --workspace back
```

Build puis start :

```bash
npm run build --workspace back
npm run start --workspace back
```

## Variables d'environnement

Variables lues par `src/config.ts` et Prisma :

```env
PORT=1337
DATABASE_URL="postgresql://user:password@localhost:5432/legacygift"
SALT_ROUNDS=10
JWT_SECRET=change-me-before-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
APP_BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:1337/api
EMAIL_FROM="LegacyGift <no-reply@legacygift.local>"
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
STRIPE_SECRET_KEY=sk_test_xxx
SUPABASE_STORAGE_BUCKET=gift-media
SUPABASE_STORAGE_ENDPOINT=
SUPABASE_S3_REGION=eu-west-1
SUPABASE_S3_ACCESS_KEY_ID=
SUPABASE_S3_SECRET_ACCESS_KEY=
MEDIA_MAX_FILE_SIZE_BYTES=5242880
E2E_CLEANUP_ENABLED=false
```

Notes :

- `DATABASE_URL` doit cibler PostgreSQL, selon `prisma/schema.prisma`.
- sans `SMTP_HOST`, les emails sont loggés en console ;
- sans `STRIPE_SECRET_KEY`, les routes paiement retournent une erreur de config ;
- sans config Supabase/S3, upload et URLs signées médias ne peuvent pas fonctionner ;
- `E2E_CLEANUP_ENABLED=true` uniquement pour tests e2e.

## Scripts

```bash
npm run dev --workspace back
npm run build --workspace back
npm run lint --workspace back
npm run test:run --workspace back
npm run test:watch --workspace back
npm run prisma:generate --workspace back
npm run prisma:push --workspace back
npm run start --workspace back
```

## Structure

```txt
back/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── config.ts
│   ├── database.ts
│   ├── router/
│   ├── middlewares/
│   ├── helpers/
│   ├── jobs/
│   ├── services/
│   └── utils/
└── test/checkin-system/
```

Responsabilités :

- `app.ts` monte Express, CORS, JSON, routes `/api`.
- `index.ts` connecte DB, lance jobs, démarre serveur.
- `router/` contient routes HTTP.
- `jobs/` contient check-in et suppression brouillons expirés.
- `services/` isole email et stockage.
- `helpers/` contient validation et limites d'offres.

## Modèle de données

Entités principales :

- `User` : compte, email unique, gifts, médias.
- `Gift` : titre, message, statut, offre, étapes, dates métier.
- `MediaAsset` : fichier stocké, propriétaire, type, metadata.
- `GiftMedia` : lien gift/media réutilisable.
- `GiftRecipient` : destinataire final.
- `GiftTrustedThird` : tiers de confiance.
- `CheckInReminder` et `CheckInResponse` : cycle de confirmation de vie.
- `ThirdPartyValidation` : vote tiers en escalade.
- `GiftPaymentConfirmation` : trace paiement interne + PDF.
- `TokenBlacklist` : invalidation JWT après logout.

Relations critiques :

- `Gift.userId` obligatoire ;
- relations principales en `onDelete: Cascade` ;
- accès utilisateur filtré par `userId` ;
- validations tiers uniques par couple `giftId/trustedThirdId` ;
- média réutilisable via `MediaAsset` + table de liaison `GiftMedia`.

## Endpoints

Public :

```txt
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/check-ins/:token/confirm
GET  /api/third-party-validations/:token/confirm-death
GET  /api/third-party-validations/:token/confirm-alive
```

Protégé par `Authorization: Bearer <token>` :

```txt
POST /api/auth/logout
GET  /api/users/me
POST /api/users/change-password

POST  /api/gifts
GET   /api/gifts
GET   /api/gifts/:giftId
PATCH /api/gifts/:giftId

GET    /api/gifts/:giftId/media
GET    /api/gifts/:giftId/media/library
POST   /api/gifts/:giftId/media
POST   /api/gifts/:giftId/media/reuse
DELETE /api/gifts/:giftId/media/:mediaId
DELETE /api/gifts/:giftId/media/library/:mediaAssetId

GET    /api/gifts/:giftId/recipients
POST   /api/gifts/:giftId/recipients
DELETE /api/gifts/:giftId/recipients/:recipientId

GET    /api/gifts/:giftId/trusted-thirds
POST   /api/gifts/:giftId/trusted-thirds
POST   /api/gifts/:giftId/trusted-thirds/validate
DELETE /api/gifts/:giftId/trusted-thirds/:trustedThirdId

POST /api/gifts/:giftId/confirmations
POST /api/gifts/:giftId/checkout-session
POST /api/gifts/:giftId/payment-confirmation
GET  /api/gifts/payment-confirmations
GET  /api/gifts/:giftId/payment-confirmation/pdf
```

E2E uniquement :

```txt
DELETE /api/e2e/users
```

## Cycle métier gift

1. Création : `status=brouillon`, expiration brouillon à J+30.
2. Choix offre : `essentiel`, `standard`, `premium`.
3. Édition : mode `free`, titre, message sanitisé, médias selon offre.
4. Destinataires : limite selon offre.
5. Tiers : exactement 3 tiers requis.
6. Confirmations finales : verrou métier avant paiement.
7. Paiement Stripe : création session, validation session payée.
8. Activation : `status=active`, `paidAt`, `nextCheckInDue=J+30`.
9. Check-in : lien public de confirmation de vie.
10. Escalade : après relances sans réponse, tiers contactés.
11. Résolution : livraison si décès confirmé après délai, expiration si vivant confirmé ou aucune confirmation de décès.

## Règles métier importantes

Offres :

| Offre | Prix | Destinataires | Images | Vidéo |
| --- | ---: | ---: | ---: | --- |
| `essentiel` | 19 EUR | 1 | 0 | non |
| `standard` | 39 EUR | 5 | 10 | non |
| `premium` | 49 EUR | illimité | illimité | 1 |

Check-in :

- prochaine échéance : 30 jours après activation ou confirmation ;
- relance tous les 3 jours ;
- maximum : check-in initial + 3 relances ;
- escalade vers tiers après absence de réponse ;
- délai tiers : 7 jours.

Livraison :

- 2 confirmations `confirmed_alive` annulent le gift ;
- après délai tiers, au moins 1 confirmation `confirmed_death` livre le gift ;
- sans confirmation de décès, le gift expire.

## Conventions code

- TypeScript strict.
- Imports relatifs simples.
- Routes Express lisibles, validation proche de la route.
- Format erreur client : `{ "message": "Message clair" }`.
- Logs techniques côté serveur uniquement.
- Codes HTTP cohérents : `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `500`.
- Toutes routes utilisateur vérifient `req.authUser?.id`.
- Toutes données utilisateur sont filtrées par `userId`.
- Inputs texte normalisés via `normalizeTextInput` / `normalizeEmail`.
- Message gift HTML sanitisé avec `sanitize-html`.
- Secrets jamais hardcodés hors fallback local.
- Migration Prisma existante non modifiée après création.

## Tests

Tests back :

```bash
npm run test:run --workspace back
```

Suite principale :

```txt
back/test/checkin-system/
├── checkInJobs.test.ts
└── checkInRoutes.test.ts
```

Elle couvre détection check-in, relances, escalade, confirmation de vie, réponses tiers, livraison et expiration.

## Requêtes manuelles

`src/requests.http` contient scénarios HTTP manuels : auth, gifts, médias, paiement, check-in, validations tiers, cleanup e2e.
