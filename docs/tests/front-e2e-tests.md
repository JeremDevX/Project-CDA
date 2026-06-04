# Tests e2e - Front LegacyGift

## Objectif

Cette suite de tests valide les parcours front critiques de LegacyGift dans un navigateur réel.

Elle couvre :

- l'affichage de la landing page publique ;
- l'interaction principale de la landing page ;
- l'accès aux formulaires d'authentification ;
- la création complète d'un gift ;
- l'ajout d'un message, d'un média, d'un destinataire et de trois tiers de confiance ;
- la validation des confirmations obligatoires ;
- le paiement hébergé de test ;
- l'accès à la page d'activation et au justificatif PDF.

Ces tests sont volontairement e2e afin de vérifier l'intégration entre React, React Router, les appels API, le backend Express et les écrans réellement manipulés par l'utilisateur.

## Emplacement

```txt
front/tests/e2e/
├── auth.spec.ts
├── gift-creation-to-validation.spec.ts
└── landing.spec.ts
```

Répartition :

- `landing.spec.ts` : page publique et interaction marketing ;
- `auth.spec.ts` : accès aux onglets et champs d'authentification ;
- `gift-creation-to-validation.spec.ts` : tunnel complet de création et validation d'un gift.

## Commande

```bash
npm run test:e2e --workspace front
```

Commande de listing rapide :

```bash
npm run test:e2e:list --workspace front
```

Résultat attendu du listing :

```txt
4 tests dans 3 fichiers
```

## Approche technique

Les tests utilisent Playwright avec le projet Chromium.

La configuration démarre automatiquement :

- le backend sur `http://localhost:1338` ;
- le front Vite sur `http://localhost:5174` ;
- l'API front avec `VITE_API_BASE_URL=http://localhost:1338/api`.
- le cleanup e2e avec `E2E_CLEANUP_ENABLED=true`.

Le parcours gift s'appuie sur :

- des `data-testid` pour les actions stables du tunnel ;
- des emails uniques à chaque exécution ;
- un nettoyage automatique de l'utilisateur e2e en fin de test ;
- une image PNG minimale embarquée en base64 ;
- une carte de test du paiement hébergé ;
- un contrôle final du téléchargement du justificatif.

Cette approche permet d'obtenir des tests :

- représentatifs du parcours utilisateur réel ;
- centrés sur les écrans et transitions critiques ;
- moins fragiles que des sélecteurs CSS ;
- compatibles avec une exécution CI.

## Analyse d'utilité

Aucun test e2e front n'a été supprimé.

Justification :

- `landing.spec.ts` couvre une surface publique non authentifiée que le tunnel gift ne traverse pas ;
- `auth.spec.ts` vérifie l'état initial des onglets et du formulaire d'inscription sans dépendre d'un parcours long ;
- `gift-creation-to-validation.spec.ts` sécurise le flux métier principal de bout en bout.

Les tests sont complémentaires. Le seul test long est conservé car il couvre une chaîne métier à fort risque de régression.

## Nettoyage des données

Le test complet crée un utilisateur réel en base avec un email au format :

```txt
legacygift.e2e.<runId>@example.test
```

En fin de test, Playwright appelle :

```txt
DELETE /api/e2e/users
```

L'endpoint est monté uniquement si `E2E_CLEANUP_ENABLED=true`.

Il refuse les emails hors préfixe `legacygift.e2e.` et domaine `@example.test`.

Le cleanup supprime aussi les objets Supabase Storage liés aux `MediaAsset` de l'utilisateur. Ensuite, la suppression de l'utilisateur déclenche les suppressions en cascade Prisma sur ses gifts, médias, destinataires, tiers de confiance, validations et confirmations de paiement.

## Code couvert

### Landing

Fichier :

```txt
front/src/LandingPage.tsx
```

Scénarios testés :

- affichage du titre principal ;
- présence du lien de création ;
- présence de la section tarifaire ;
- mise à jour de la prévisualisation lors du choix d'une étape.

### Authentification

Fichiers :

```txt
front/src/LoginPage.tsx
front/src/components/AuthPage/AuthForm.tsx
```

Scénarios testés :

- affichage des onglets `Connexion` et `Inscription` ;
- bascule vers le formulaire d'inscription ;
- présence des champs obligatoires.

### Tunnel gift

Fichiers principaux :

```txt
front/src/DashboardPage.tsx
front/src/GiftPricingPage.tsx
front/src/GiftCreationModePage.tsx
front/src/GiftCompositionPage.tsx
front/src/GiftMediaPage.tsx
front/src/GiftPreviewPage.tsx
front/src/GiftRecipientsPage.tsx
front/src/GiftTrustedThirdsPage.tsx
front/src/GiftConfirmationsPage.tsx
front/src/GiftSummaryPage.tsx
front/src/GiftActivatedPage.tsx
```

Scénarios testés :

- inscription utilisateur ;
- création d'un gift ;
- choix de l'offre standard ;
- choix du mode de rédaction libre ;
- saisie du titre et du message ;
- upload d'un média ;
- prévisualisation du gift ;
- ajout d'un destinataire ;
- ajout de trois tiers de confiance ;
- validation des confirmations obligatoires ;
- affichage du récapitulatif ;
- paiement hébergé de test ;
- activation du gift ;
- téléchargement du justificatif PDF.

## Scénarios couverts

| Règle vérifiée | Test |
| --- | --- |
| La landing expose les contenus publics essentiels | `displays the main content` |
| La prévisualisation marketing réagit au choix d'une étape | `updates the preview when a step is selected` |
| La page auth permet d'accéder au formulaire d'inscription | `displays the auth tabs and register form` |
| Un utilisateur peut créer et activer un gift complet | `creates an account, a gift, then validates it` |
| Le tunnel impose les étapes clés avant activation | `creates an account, a gift, then validates it` |
| Le justificatif de paiement est téléchargeable après activation | `creates an account, a gift, then validates it` |

## Limites connues

Ces tests ne remplacent pas les tests unitaires.

Ils ne couvrent pas :

- les erreurs de formulaire champ par champ ;
- les cas d'échec API ;
- les variantes de paiement refusé ;
- les parcours mobiles ;
- les parcours publics de check-in et validation tiers.

Ces cas doivent rester couverts par des tests unitaires, d'intégration ou par de nouveaux scénarios e2e ciblés si le risque métier augmente.
