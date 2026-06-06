# LegacyGift Front

Frontend LegacyGift en `React 19`, `Vite`, `TypeScript`, `React Router` et `Zustand`.

## Rôle

Le front fournit l'expérience utilisateur :

- landing page publique ;
- inscription, connexion, déconnexion ;
- dashboard des gifts ;
- tunnel complet de création ;
- édition du message ;
- upload et réutilisation de médias ;
- destinataires et tiers de confiance ;
- validations finales ;
- paiement hébergé Stripe ;
- page d'activation et téléchargement PDF ;
- pages publiques check-in et validation tiers.

## Stack

- Framework : React 19
- Build : Vite 7
- Langage : TypeScript
- Routing : React Router 7
- État global : Zustand pour auth
- Éditeur : Tiptap
- Icônes : lucide-react
- Tests unitaires : Vitest + jsdom
- Tests e2e : Playwright Chromium
- Qualité : ESLint flat config

## Installation

Depuis la racine :

```bash
npm install
```

Configurer `front/.env` :

```env
VITE_API_BASE_URL=http://localhost:1337/api
```

Ou copier l'exemple :

```bash
cp front/.env.example front/.env
```

Le front ne doit contenir aucun secret. Toute variable `VITE_*` est exposée au navigateur.

Lancer en dev :

```bash
npm run dev --workspace front
```

URL locale par défaut : `http://localhost:5173`.

## Scripts

```bash
npm run dev --workspace front
npm run build --workspace front
npm run preview --workspace front
npm run lint --workspace front
npm run test:run --workspace front
npm run test:watch --workspace front
npm run test:e2e --workspace front
npm run test:e2e:list --workspace front
```

## Structure

```txt
front/src/
├── api/
├── components/
├── data/
├── helpers/
├── router/
├── store/
├── test/
├── *Page.tsx
├── App.tsx
├── main.tsx
├── index.css
└── reset.css
```

Responsabilités :

- `api/` : appels HTTP typés vers le back.
- `components/` : composants réutilisables.
- `data/` : offres et modes de création.
- `helpers/` : messages d'erreur, progression, limites.
- `router/` : routes publiques/protégées.
- `store/useAppStore.ts` : token et utilisateur courant.
- `*Page.tsx` : pages métier.

## Routes

Publiques :

```txt
/
/login
/register
/check-ins/:token/confirm
/third-party-validations/:token/:answer
```

Protégées par `RequireAuth` :

```txt
/dashboard
/account
/gifts/:giftId/pricing
/gifts/:giftId/creation-mode
/gifts/:giftId/composition
/gifts/:giftId/images
/gifts/:giftId/preview
/gifts/:giftId/recipients
/gifts/:giftId/trusted-thirds
/gifts/:giftId/confirmations
/gifts/:giftId/summary
/gifts/:giftId/activated
```

## Flux utilisateur

1. Landing page : présentation LegacyGift, fonctionnement, offres.
2. Auth : inscription ou connexion.
3. Dashboard : liste gifts, création nouveau gift.
4. Pricing : choix offre.
5. Mode création : mode `free` actif, guide d'inspiration indiqué WIP.
6. Composition : titre + message riche via Tiptap.
7. Images : upload ou réutilisation bibliothèque.
8. Preview : rendu final avant destinataires.
9. Recipients : ajout destinataires selon limite offre.
10. Trusted thirds : ajout obligatoire de 3 tiers.
11. Confirmations : acceptation conditions finales.
12. Summary : récapitulatif + paiement Stripe.
13. Activated : validation paiement, confirmation, PDF.

## API client

Fichiers :

```txt
src/api/auth.ts
src/api/gifts.ts
src/api/giftMedia.ts
src/api/giftRecipients.ts
src/api/giftTrustedThirds.ts
src/api/checkIns.ts
src/api/thirdPartyValidations.ts
```

Conventions :

- base URL via `import.meta.env.VITE_API_BASE_URL` ;
- payloads et réponses typés ;
- token passé avec `Authorization: Bearer <token>` ;
- erreurs API converties avec `getApiErrorMessage` ;
- pas d'URL API dupliquée dans les pages.

## État auth

`useUserState` stocke :

- `token` ;
- `user` ;
- `setAuthData()` ;
- `clearAuthData()`.

Persistance :

- `auth_token` dans `localStorage` ;
- `auth_user` dans `localStorage`.

`RequireAuth` redirige vers `/login` si aucun token.

## UI et composants

Composants clés :

- `Header` / `Footer`
- `Button`
- `InfoCard`
- `PricingSection`
- `OfferSelection`
- `CreationModeSelection`
- `GiftStepNav`
- `GiftTitleForm`
- `GiftMessageEditor`
- `GiftMediaLibrary`
- `GiftPreviewPlayer`
- `PublicActionConfirmation`

Conventions UI :

- styles par fichier `.css` adjacent ;
- variables globales dans `src/index.css` ;
- largeur max app : `1440px` ;
- responsive des `320px` ;
- focus visible ;
- composants simples ;
- handlers nommés ;
- lucide-react pour icônes ;
- `data-testid` réservé aux parcours e2e stables.

## Données front

Offres dans `src/data/offerPlans.ts` :

| Offre | Prix | Destinataires | Images | Vidéo |
| --- | ---: | ---: | ---: | --- |
| `essentiel` | 19 EUR | 1 | 0 | non |
| `standard` | 39 EUR | 5 | 10 | non |
| `premium` | 49 EUR | illimité | illimité | oui |

Modes dans `src/data/creationModes.ts` :

- `free` : disponible ;
- `inspiration-guide` : WIP, non sélectionnable.

Étapes dans `src/helpers/giftProgress.ts` :

```txt
creation-mode -> composition -> images -> preview -> recipients -> trusted-thirds -> confirmations -> summary
```

## Conventions code

- Pages dans `src/*Page.tsx`.
- API dans `src/api/*`.
- État global seulement pour auth.
- État local pour chargement, erreurs, formulaires.
- Logique métier hors JSX quand elle grossit.
- `useMemo` / `useCallback` seulement si utile.
- Erreurs affichées avec messages utilisateur courts.
- Pas de styles inline sauf besoin ponctuel.
- CSS avec variables `--bg`, `--surface`, `--accent`, `--space-*`, `--radius-*`.
- Tests e2e avec sélecteurs visibles ou `data-testid`.

## Tests

Unitaires front :

```bash
npm run test:run --workspace front
```

E2E :

```bash
npm run test:e2e --workspace front
```

Playwright démarre :

- back sur `http://localhost:1338` ;
- front sur `http://localhost:5174` ;
- `VITE_API_BASE_URL=http://localhost:1338/api` ;
- cleanup e2e via `E2E_CLEANUP_ENABLED=true`.

Scénarios e2e :

- landing ;
- auth ;
- tunnel gift complet jusqu’à activation et PDF.

Docs tests :

- `docs/tests/front-e2e-tests.md`
- `docs/tests/checkin-system-tests.md`
