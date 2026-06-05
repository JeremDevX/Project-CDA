# LegacyGift

Monorepo LegacyGift pour projet CDA. Application web de création de gifts numériques transmis aux proches selon un cycle de paiement, check-in et validation par tiers de confiance.

## Produit

LegacyGift permet à un utilisateur de :

- créer un gift ;
- choisir une offre ;
- rédiger un message ;
- ajouter des médias ;
- définir destinataires et tiers de confiance ;
- confirmer puis payer ;
- maintenir le gift actif via check-in ;
- déclencher une validation par tiers si absence de réponse ;
- livrer le contenu ou expirer le gift selon les validations.

## Stack

```txt
front/  React 19 + Vite + TypeScript + React Router + Zustand
back/   Express 5 + TypeScript + Prisma + PostgreSQL
```

Services externes :

- Stripe Checkout pour paiement ;
- Supabase Storage compatible S3 pour médias ;
- SMTP via Nodemailer pour emails ;
- Playwright pour e2e.

## Structure

```txt
.
├── back/
├── front/
├── docs/
│   ├── tests/
│   └── uml/
├── _gantt-version/
├── scripts/
└── package.json
```

Docs spécifiques :

- `back/README.md`
- `front/README.md`
- `docs/tests/front-e2e-tests.md`
- `docs/tests/checkin-system-tests.md`
- `docs/uml/`

## Installation

Prérequis :

- Node.js ;
- npm ;
- PostgreSQL ;
- compte Stripe test si paiement testé ;
- bucket Supabase Storage si médias testés.

Depuis la racine :

```bash
npm install
npm run prisma:generate --workspace back
```

Variables minimales :

```env
# back/.env
PORT=1337
DATABASE_URL="postgresql://user:password@localhost:5432/legacygift"
JWT_SECRET=change-me-before-production
APP_BASE_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxx

# front/.env
VITE_API_BASE_URL=http://localhost:1337/api
```

## Lancement local

Terminal back :

```bash
npm run dev --workspace back
```

Terminal front :

```bash
npm run dev --workspace front
```

URLs :

```txt
Front : http://localhost:5173
API   : http://localhost:1337/api
Health: http://localhost:1337/api/health
```

## Scripts racine

```bash
npm run build
npm run lint
npm run test
npm run test:run
npm run test:e2e
npm run check
```

Détails :

- `build` : build workspaces.
- `lint` : lint workspaces.
- `test:run` : tests unitaires front + back.
- `test:e2e` : Playwright front.
- `check` : lint + tests unitaires.

## Scripts workspaces

Back :

```bash
npm run build --workspace back
npm run lint --workspace back
npm run test:run --workspace back
npm run prisma:generate --workspace back
npm run start --workspace back
```

Front :

```bash
npm run build --workspace front
npm run lint --workspace front
npm run test:run --workspace front
npm run test:e2e --workspace front
```

## Parcours métier

```txt
inscription/connexion
-> dashboard
-> création gift brouillon
-> offre
-> mode création
-> composition message
-> médias
-> preview
-> destinataires
-> 3 tiers de confiance
-> confirmations finales
-> récapitulatif
-> paiement Stripe
-> activation
-> check-in J+30
-> relances
-> escalade tiers
-> livraison ou expiration
```

Statuts gift principaux :

- `brouillon`
- `active`
- `overdue`
- `in_escalation`
- `delivered`
- `expired`

## Règles importantes

- Un gift appartient toujours à un `User`.
- Toutes les routes privées filtrent par `userId`.
- Erreurs API au format `{ "message": "..." }`.
- Brouillons expirent après 30 jours.
- Activation après paiement valide.
- Check-in tous les 30 jours.
- Relances tous les 3 jours.
- Escalade après maximum de relances sans réponse.
- Exactement 3 tiers de confiance requis.
- Livraison seulement après validation tiers conforme.

Offres :

| Offre | Prix | Destinataires | Images | Vidéo |
| --- | ---: | ---: | ---: | --- |
| `essentiel` | 19 EUR | 1 | 0 | non |
| `standard` | 39 EUR | 5 | 10 | non |
| `premium` | 49 EUR | illimité | illimité | 1 |

## Conventions globales

- Monorepo npm workspaces.
- Code TypeScript strict.
- Changements simples, lisibles, défendables.
- Front : pages dans `front/src/*Page.tsx`.
- Front : appels HTTP dans `front/src/api/`.
- Front : Zustand seulement pour auth globale.
- Front : CSS par composant + variables globales.
- Back : app Express dans `back/src/app.ts`.
- Back : routes dans `back/src/router/`.
- Back : jobs dans `back/src/jobs/`.
- Back : services externes dans `back/src/services/`.
- Back : schéma Prisma dans `back/prisma/schema.prisma`.
- Tests e2e avec `data-testid` pour actions stables.
- Pas de secret committé.

## Qualité

Commandes recommandées avant livraison :

```bash
npm run lint
npm run test:run
npm run build
```

Pour validation complète :

```bash
npm run check
```

E2E :

```bash
npm run test:e2e --workspace front
```

## Notes projet

- `back/.env.example` est minimal ; `back/src/config.ts` reste la source des variables prises en charge.
- Les migrations Prisma existantes documentent l'évolution du modèle.
- `_gantt-version/` contient versions planning.
- `User-stories.md` contient le cadrage fonctionnel.
