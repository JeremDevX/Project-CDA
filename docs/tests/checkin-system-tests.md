# Tests unitaires - Check-in system

## Objectif

Cette suite de tests valide les règles métier critiques du système de check-in LegacyGift.

Elle couvre :

- la détection des gifts dont l'échéance de check-in est dépassée ;
- l'envoi du check-in initial ;
- l'envoi des relances ;
- l'escalade vers les tiers de confiance ;
- l'enregistrement des réponses utilisateur et tiers ;
- la décision finale de livraison ou d'annulation du gift.

Les tests sont volontairement unitaires afin de valider la logique métier sans dépendance à une base PostgreSQL, un serveur SMTP ou un stockage média réel.

## Emplacement

```txt
back/test/checkin-system/
├── checkInJobs.test.ts
└── checkInRoutes.test.ts
```

Répartition :

- `checkInJobs.test.ts` : traitements automatiques exécutés par les jobs ;
- `checkInRoutes.test.ts` : actions déclenchées par les liens publics de confirmation.

## Commande

```bash
npm run test:run --workspace back
```

Résultat attendu :

```txt
2 fichiers de test exécutés
11 tests passés
```

## Approche technique

Les tests utilisent Vitest et isolent les dépendances externes par mocks.

Dépendances mockées :

- `prisma` : simulation des lectures et écritures en base ;
- `sendEmail` : vérification des emails sans envoi réel ;
- `createSignedStorageUrl` : simulation des liens médias signés.

Cette approche permet d'obtenir des tests :

- rapides ;
- déterministes ;
- indépendants de l'infrastructure ;
- centrés sur les règles métier.

## Code couvert

### Jobs

Fichier :

```txt
back/src/jobs/checkInReminders.ts
```

Fonctions testées :

- `detectOverdueCheckIns`
- `sendCheckInFollowUps`
- `escalateCheckInsToTrustedThirds`
- `resolveThirdPartyValidationResult`

### Routes publiques

Fichiers :

```txt
back/src/router/checkIns.ts
back/src/router/thirdPartyValidations.ts
```

Fonctions testées :

- `confirmCheckInByToken`
- `answerThirdPartyValidation`

Ces fonctions contiennent la logique appelée par les routes Express. Elles sont testées directement pour éviter l'ouverture d'un serveur HTTP pendant les tests unitaires.

## Scénarios couverts

| Règle vérifiée                                                              | Test                                                                       |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Un check-in est envoyé quand l'échéance J+30 est atteinte                   | `envoie le mail de check-in quand le delai J+30 est atteint`               |
| Une relance est envoyée si l'utilisateur ne répond pas                      | `envoie la relance suivante...`                                            |
| Les relances successives sont gérées                                        | test paramétré avec 1, 2 puis 3 rappels déjà envoyés                       |
| Aucune relance supplémentaire n'est envoyée après la limite prévue          | `n'envoie plus de relance apres les trois relances`                        |
| Les tiers de confiance sont contactés après les relances sans réponse       | `envoie les mails aux tiers de confiance apres les relances`               |
| Une confirmation de vie réactive le gift                                    | `enregistre la confirmation de vie et repart sur 30 jours`                 |
| La prochaine échéance est recalculée à 30 jours                             | `nextCheckInDue = now + 30 jours`                                          |
| La réponse d'un tiers est enregistrée                                       | `enregistre la reponse d'un tiers puis livre le gift apres le delai`       |
| Le gift est livré si un décès est confirmé après le délai tiers             | `envoie le gift si un tiers confirme le deces et que le delai est passe`   |
| Le gift n'est pas livré si deux tiers confirment que le créateur est vivant | `n'envoie pas le gift si deux tiers confirment que le createur est vivant` |
| Le gift n'est pas livré sans confirmation de décès                          | `n'envoie pas le gift sans confirmation de deces apres le delai tiers`     |

## Détail des tests

### Détection d'échéance J+30

Test :

```txt
envoie le mail de check-in quand le delai J+30 est atteint
```

État initial :

- le gift est actif ;
- `nextCheckInDue` est dépassé ;
- aucun rappel actif n'existe.

Résultat attendu :

- un rappel de check-in est créé ;
- un email est envoyé au créateur ;
- le rappel passe en `sent` ;
- le gift passe en `overdue`.

Assertions principales :

- destinataire de l'email ;
- sujet de l'email ;
- présence du lien de confirmation ;
- mise à jour du rappel ;
- mise à jour du statut du gift.

### Relances de check-in

Test :

```txt
envoie la relance suivante apres ...
```

État initial :

- le gift est en retard ;
- le dernier rappel envoyé date d'au moins 3 jours ;
- aucune réponse de check-in n'existe.

Résultat attendu :

- une nouvelle relance est créée ;
- un email de relance est envoyé.

Le test est paramétré avec :

```txt
1 rappel déjà envoyé
2 rappels déjà envoyés
3 rappels déjà envoyés
```

Cela valide la progression des relances sans dupliquer trois tests identiques.

### Limite des relances

Test :

```txt
n'envoie plus de relance apres les trois relances
```

État initial :

- le check-in initial et les trois relances ont déjà été envoyés ;
- l'utilisateur n'a pas répondu.

Résultat attendu :

- aucune nouvelle relance n'est envoyée.

Ce test sécurise la limite métier et évite une boucle de relances illimitée.

### Escalade vers les tiers de confiance

Test :

```txt
envoie les mails aux tiers de confiance apres les relances
```

État initial :

- le gift est en retard ;
- les relances prévues ont été envoyées ;
- aucun check-in n'a été confirmé ;
- des tiers de confiance sont renseignés.

Résultat attendu :

- une validation est créée pour chaque tiers ;
- chaque tiers reçoit un email avec lien sécurisé ;
- le gift passe en `in_escalation`.

Assertions principales :

- nombre de validations créées ;
- nombre d'emails envoyés ;
- destinataires des emails ;
- présence des liens de validation ;
- statut final du gift.

### Livraison après confirmation de décès

Test :

```txt
envoie le gift si un tiers confirme le deces et que le delai est passe
```

État initial :

- le gift est en escalade ;
- un tiers a confirmé le décès ;
- la fenêtre de validation de 7 jours est terminée ;
- le gift possède un destinataire et un média.

Résultat attendu :

- le gift est envoyé aux destinataires ;
- les liens médias sont générés ;
- le gift passe en `delivered`.

Assertions principales :

- email envoyé au destinataire ;
- contenu du gift présent dans l'email ;
- lien média signé présent ;
- statut final `delivered`.

### Annulation si le créateur est confirmé vivant

Test :

```txt
n'envoie pas le gift si deux tiers confirment que le createur est vivant
```

État initial :

- le gift est en escalade ;
- deux tiers indiquent que le créateur est vivant.

Résultat attendu :

- le gift n'est pas envoyé aux destinataires ;
- le créateur reçoit un email d'annulation ;
- le gift passe en `expired`.

Assertions principales :

- email envoyé au créateur ;
- absence d'email aux destinataires ;
- statut final `expired`.

### Annulation sans confirmation de décès

Test :

```txt
n'envoie pas le gift sans confirmation de deces apres le delai tiers
```

État initial :

- le gift est en escalade ;
- la fenêtre de validation de 7 jours est terminée ;
- aucun tiers n'a confirmé le décès.

Résultat attendu :

- les validations sans réponse passent en `silent` ;
- le gift n'est pas envoyé aux destinataires ;
- le gift est annulé.

Assertions principales :

- mise à jour des validations `pending` en `silent` ;
- absence d'email aux destinataires.

### Confirmation de vie par le créateur

Test :

```txt
enregistre la confirmation de vie et repart sur 30 jours
```

État initial :

- un rappel de check-in existe ;
- le token est valide ;
- le gift est `active` ou `overdue`.

Résultat attendu :

- une réponse de check-in est enregistrée ;
- le rappel passe en `responded` ;
- le gift repasse en `active` ;
- `lastCheckInAt` est mis à jour ;
- `nextCheckInDue` est recalculé à 30 jours.

Assertions principales :

- création d'une `CheckInResponse` ;
- statut du rappel ;
- statut du gift ;
- date de dernier check-in ;
- prochaine échéance.

### Réponse d'un tiers

Test :

```txt
enregistre la reponse d'un tiers puis livre le gift apres le delai
```

État initial :

- une validation tiers existe ;
- le token est valide ;
- le gift est en escalade.

Résultat attendu :

- la réponse du tiers est enregistrée ;
- la décision finale est réévaluée ;
- le gift est livré si les conditions métier sont remplies.

Assertions principales :

- statut de validation `confirmed_death` ;
- date de réponse ;
- email final aux destinataires ;
- statut final `delivered`.

## Règles métier validées

### Cycle check-in

```txt
Gift actif
-> échéance J+30 atteinte
-> email de check-in
-> confirmation utilisateur : gift actif + prochaine échéance à 30 jours
-> absence de confirmation : relances tous les 3 jours
-> absence persistante : escalade vers les tiers
```

### Cycle tiers de confiance

```txt
Escalade
-> notification des tiers
-> enregistrement des réponses
-> attente de la fenêtre de validation
-> décès confirmé : livraison du gift
-> créateur confirmé vivant : annulation du gift
-> aucune confirmation de décès : annulation du gift
```

## Justification du périmètre

Ces tests ne couvrent pas :

- le rendu frontend ;
- l'envoi réel d'emails ;
- une base PostgreSQL réelle ;
- la génération réelle de liens Supabase ;
- l'authentification utilisateur ;
- l'exécution réelle du cron quotidien.

Ces éléments relèvent de tests d'intégration ou de tests end-to-end.

Le périmètre actuel cible les règles métier du check-in et garantit que les décisions critiques restent stables lors des évolutions du code.

## Vérifications

Commandes exécutées :

```bash
npm run test:run --workspace back
npm run lint --workspace back
npm run build --workspace back
```
