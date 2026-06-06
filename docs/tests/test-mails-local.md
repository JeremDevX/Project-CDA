# Procédure de test local des emails LegacyGift

Objectif : valider localement la génération, le déclenchement et le transport des emails applicatifs, sans envoyer de messages vers de vrais destinataires.

Périmètre validé :

- destinataire ;
- expéditeur ;
- objet ;
- contenu texte ;
- liens applicatifs ;
- liens médias signés ;
- déclenchement métier ;
- configuration SMTP locale.

Périmètre non validé :

- délivrabilité réelle chez Gmail, Outlook ou autre fournisseur ;
- classement anti-spam ;
- réputation de domaine ;
- authentification DNS SPF, DKIM, DMARC ;
- rendu exact dans tous les clients mail.

## 1. Architecture actuelle

Fichiers concernés :

- `back/src/services/email.ts`
- `back/src/jobs/checkInReminders.ts`
- `back/test/checkin-system/checkInJobs.test.ts`
- `back/test/checkin-system/checkInRoutes.test.ts`

Le service d'envoi est centralisé dans `sendEmail`.

Comportement :

- si `SMTP_HOST` est défini, l'application envoie via Nodemailer ;
- si `SMTP_HOST` est vide, l'application affiche l'email en console ;
- les tests automatisés mockent `sendEmail` pour valider la logique métier sans dépendance réseau.

Ce découpage permet de tester séparément :

- la logique métier ;
- la génération du contenu ;
- le transport SMTP.

## 2. Stratégie de test recommandée

Utiliser trois niveaux complémentaires.

### Niveau 1 - Tests automatisés

But : valider les règles métier.

À vérifier :

- l'email est déclenché au bon moment ;
- le destinataire est correct ;
- l'objet est correct ;
- le contenu contient les informations attendues ;
- aucun email n'est envoyé quand les conditions métier ne sont pas réunies.

Commande :

```bash
npm run test --workspace back
```

Commande ciblée :

```bash
npm run test --workspace back -- checkin-system
```

Résultat attendu :

- tests Vitest en succès ;
- assertions sur `sendEmail` validées.

### Niveau 2 - Test local sans SMTP

But : vérifier visuellement les emails générés dans les logs backend.

Avantage :

- aucun service à installer ;
- aucun risque d'envoi réel ;
- utile pour inspection rapide.

Limite :

- ne teste pas le dialogue SMTP.

### Niveau 3 - Test SMTP local capturé

But : tester un vrai envoi SMTP local sans sortie Internet.

Outil recommandé :

- Mailpit.

Mailpit expose :

- SMTP local : `localhost:1025` ;
- interface web : `http://localhost:8025`.

Avantage :

- l'application utilise Nodemailer comme en environnement réel ;
- les emails sont capturés localement ;
- aucun email n'est envoyé au destinataire final.

## 3. Test automatisé de la logique d'envoi

### Étape 1 - Lancer les tests backend

Depuis la racine du projet :

```bash
npm run test --workspace back
```

### Étape 2 - Lancer uniquement les tests email/check-in

```bash
npm run test --workspace back -- checkin-system
```

### Étape 3 - Contrôler les cas couverts

Fichier principal :

```txt
back/test/checkin-system/checkInJobs.test.ts
```

Cas couverts :

- envoi du mail de check-in ;
- envoi des relances ;
- arrêt après le nombre maximal de relances ;
- envoi des demandes de validation aux tiers de confiance ;
- livraison du gift au destinataire après confirmation ;
- annulation si le créateur est confirmé vivant ;
- absence de livraison sans confirmation valide.

Exemple d'assertion :

```ts
expect(mocks.sendEmail).toHaveBeenCalledWith(
  expect.objectContaining({
    to: "proche@example.com",
    subject: 'Votre gift "Gift test" est disponible',
    text: expect.stringContaining("https://signed.example/media"),
  }),
);
```

Cette assertion vérifie :

- destinataire ;
- objet ;
- présence du lien média ;
- déclenchement du mail de livraison.

## 4. Test local sans serveur SMTP

### Étape 1 - Configurer l'environnement

Dans `back/.env`, laisser `SMTP_HOST` vide :

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="LegacyGift <no-reply@legacygift.local>"
APP_BASE_URL=http://localhost:5173
```

Point important :

- `SMTP_HOST` vide désactive l'envoi SMTP ;
- `sendEmail` écrit l'email dans la console.

### Étape 2 - Lancer le backend

```bash
npm run dev --workspace back
```

### Étape 3 - Déclencher un scénario email

Méthodes possibles :

- exécuter un scénario applicatif complet ;
- utiliser un scénario de test existant ;
- appeler une route de confirmation avec un token de test ;
- déclencher un job métier localement.

### Étape 4 - Lire les logs backend

Sortie attendue :

```txt
Email envoye {
  from: "LegacyGift <no-reply@legacygift.local>",
  to: "...",
  subject: "...",
  text: "..."
}
```

Contrôles à faire :

- `from` correspond à `EMAIL_FROM` ;
- `to` correspond au destinataire attendu ;
- `subject` correspond au scénario ;
- `text` contient les bonnes informations ;
- les liens utilisent `APP_BASE_URL` ;
- les tiers de confiance ne reçoivent pas le contenu privé du gift.

## 5. Test SMTP local avec Mailpit

### Étape 1 - Lancer Mailpit avec Docker

```bash
docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Services disponibles :

```txt
SMTP : localhost:1025
Web  : http://localhost:8025
```

### Étape 2 - Alternative sans Docker

Installer Mailpit :

```bash
brew install mailpit
```

Lancer Mailpit :

```bash
mailpit
```

### Étape 3 - Configurer le backend

Dans `back/.env` :

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="LegacyGift <no-reply@legacygift.local>"
APP_BASE_URL=http://localhost:5173
```

Notes :

- Mailpit n'a pas besoin d'identifiants ;
- `SMTP_USER` et `SMTP_PASSWORD` restent vides ;
- port `1025` = port SMTP local Mailpit ;
- port `8025` = interface web Mailpit.

### Étape 4 - Lancer le backend

```bash
npm run dev --workspace back
```

### Étape 5 - Lancer le frontend si scénario manuel

```bash
npm run dev --workspace front
```

URLs :

```txt
Application : http://localhost:5173
Mailpit     : http://localhost:8025
```

### Étape 6 - Déclencher un envoi SMTP local capturé par Mailpit

Point d'attention :

- les tests unitaires mockent `sendEmail` ;
- ils ne remplissent donc pas Mailpit ;
- pour tester Mailpit, il faut déclencher l'application en local.

Scénario manuel recommandé :

1. démarrer Mailpit ;
2. démarrer backend ;
3. démarrer frontend ;
4. créer ou utiliser un compte de test ;
5. créer un gift ;
6. renseigner le message ;
7. ajouter un destinataire ;
8. ajouter un tiers de confiance ;
9. activer le gift ;
10. déclencher le scénario check-in ou validation ;
11. ouvrir `http://localhost:8025` ;
12. inspecter l'email capturé.

### Étape 7 - Vérifier l'email dans Mailpit

Contrôles :

- email présent dans l'inbox ;
- `From` correct ;
- `To` correct ;
- `Subject` correct ;
- contenu lisible ;
- liens applicatifs corrects ;
- liens médias présents si livraison du gift ;
- absence de contenu privé dans les mails envoyés aux tiers.

## 6. Matrice de validation

| Élément              | Test automatisé | Console locale | Mailpit |
| -------------------- | --------------- | -------------- | ------- |
| Déclenchement métier | Oui             | Oui            | Oui     |
| Destinataire         | Oui             | Oui            | Oui     |
| Objet                | Oui             | Oui            | Oui     |
| Contenu texte        | Oui             | Oui            | Oui     |
| Liens applicatifs    | Oui             | Oui            | Oui     |
| Liens médias signés  | Oui             | Oui            | Oui     |
| Dialogue SMTP        | Non             | Non            | Oui     |
| Affichage inbox      | Non             | Non            | Oui     |
| Délivrabilité réelle | Non             | Non            | Non     |

## 7. Procédure de recette complète

### Pré-requis

- dépendances installées ;
- base locale fonctionnelle ;
- backend compilable ;
- frontend lançable ;
- Mailpit disponible.

### Terminal 1 - Mailpit

```bash
docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit
```

### Terminal 2 - Backend

```bash
npm run dev --workspace back
```

### Terminal 3 - Frontend

```bash
npm run dev --workspace front
```

### Navigateur

Ouvrir :

```txt
http://localhost:5173
http://localhost:8025
```

### Actions

1. créer un utilisateur de test ;
2. créer un gift ;
3. compléter le message ;
4. ajouter un destinataire de test ;
5. ajouter un tiers de confiance de test ;
6. activer le gift ;
7. déclencher le scénario d'envoi ;
8. consulter Mailpit ;
9. contrôler le détail du message ;
10. archiver les preuves de recette.

### Résultat attendu

Mailpit doit afficher un ou plusieurs emails LegacyGift.

Chaque email doit contenir :

- expéditeur configuré ;
- destinataire attendu ;
- objet cohérent ;
- contenu correspondant au scénario ;
- liens pointant vers l'environnement local ;
- aucune donnée privée envoyée au mauvais rôle.

## 8. Preuves à conserver

Preuves techniques recommandées :

- sortie de tests backend ;
- capture de l'inbox Mailpit ;
- capture du détail d'un email ;
- extrait de `back/src/services/email.ts` ;
- extrait de `back/test/checkin-system/checkInJobs.test.ts` ;
- configuration `.env` locale sans secrets.

Commande de preuve :

```bash
npm run test --workspace back -- checkin-system
```

Captures utiles :

```txt
Mailpit - Inbox
Mailpit - Détail email
Terminal - Tests backend OK
```

## 9. Formulation professionnelle

Version complète :

```txt
Les emails sont testés localement sur deux axes. La logique métier est validée par des tests automatisés qui vérifient les destinataires, les objets, les contenus et les conditions de déclenchement. Le transport SMTP est validé avec Mailpit, un serveur SMTP local qui capture les messages sans les envoyer à de vrais destinataires. Cette approche permet de tester le comportement applicatif sans risque d'envoi externe. La délivrabilité réelle reste dépendante du fournisseur SMTP et de la configuration DNS de production.
```

Version courte :

```txt
Les envois sont validés par tests automatisés pour la logique métier et par Mailpit pour le transport SMTP local. Aucun email réel n'est envoyé en développement. La délivrabilité finale relève de la configuration SMTP/DNS de production.
```

Version rapport technique :

```txt
Le service d'email est isolé derrière une fonction dédiée. En environnement de test, cette fonction est mockée afin de vérifier les appels attendus sans dépendance externe. En environnement local, Mailpit permet de valider le transport SMTP et d'inspecter les messages générés. Cette séparation limite les risques, facilite les tests automatisés et évite les envois accidentels vers des utilisateurs réels.
```

## 10. Limites connues

Limites acceptées :

- Mailpit ne garantit pas la délivrabilité réelle ;
- les tests unitaires ne testent pas Nodemailer ;
- la console locale ne teste pas SMTP ;
- le rendu peut varier selon client mail ;
- SPF, DKIM et DMARC ne sont pas testés localement.

Impact :

- faible pour validation fonctionnelle ;
- important avant mise en production.

Action avant production :

- configurer fournisseur SMTP réel ;
- configurer SPF ;
- configurer DKIM ;
- configurer DMARC ;
- tester vers Gmail, Outlook et domaine professionnel ;
- vérifier logs fournisseur ;
- vérifier classement spam.

## 11. Checklist opérationnelle

Avant validation locale :

- `SMTP_HOST` vide testé en mode console ;
- `SMTP_HOST=localhost` testé avec Mailpit ;
- `npm run test --workspace back -- checkin-system` en succès ;
- email visible dans Mailpit ;
- destinataire vérifié ;
- objet vérifié ;
- contenu vérifié ;
- liens vérifiés ;
- absence d'envoi externe confirmée.

Avant production :

- SMTP fournisseur configuré ;
- secrets stockés hors dépôt ;
- SPF configuré ;
- DKIM configuré ;
- DMARC configuré ;
- test réel vers boîtes externes ;
- monitoring ou logs SMTP disponibles.

## 12. Synthèse

Approche retenue :

- tests automatisés pour sécuriser la logique ;
- console locale pour inspection rapide ;
- Mailpit pour valider le transport SMTP local ;
- fournisseur SMTP réel uniquement pour validation préproduction/production.

Conclusion :

```txt
Le projet peut être testé localement sans serveur SMTP externe. Les emails sont soit affichés en console, soit capturés par Mailpit. Cette méthode permet de vérifier le comportement applicatif sans risque d'envoi réel, tout en gardant une séparation claire entre logique métier, génération de message et transport SMTP.
```
