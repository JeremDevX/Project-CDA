# UML - Check-in Retard (US-30) - Version Simple

## Contexte

Une fois qu'un gift est activé (paiement validé), l'utilisateur doit faire un check-in tous les 30 jours pour confirmer qu'il est toujours en vie.

En cas de retard prolongé, les 3 tiers ont 7 jours pour valider ou invalider. La majorité l'emporte : le gift est annulé si au moins 2 tiers nient, sinon il est livré si au moins 1 tiers confirme.

---

## Diagramme de Séquences Principal

```mermaid
sequenceDiagram
    participant Cron
    participant System
    participant DB
    participant Email
    participant User
    participant Tiers

    Note over Cron,DB: Tous les jours à 02h00
    Cron->>System: Vérifier gifts à rappeler
    System->>DB: gifts où nextCheckInDue <= now
    DB-->>System: Liste des gifts

    loop Pour chaque gift
        System->>DB: Créer CheckInReminder
        System->>Email: Envoyer email avec lien
        Email->>User: Email de check-in
    end

    alt User répond au check-in dans les 3 jours
        User->>Front: Clique sur lien public (avec token)
        Front->>System: Confirme le check-in via API
        System->>DB: Vérifier token valide
        System->>DB: Enregistrer réponse
        System->>DB: Mettre à jour gift.nextCheckInDue = now + 30j
        Front-->>User: Page de confirmation + prochaine échéance
    else Aucun check-in dans les 3 jours
        loop Tous les 3 jours, jusqu'à 3 rappels
            System->>DB: Créer CheckInReminder de rappel
            System->>Email: Envoyer email de rappel
            Email->>User: Email de rappel check-in
        end

        System->>DB: Passer le gift en in_escalation
        System->>Email: Demander validation aux tiers
        Email->>Tiers: Email de validation
        Tiers->>System: Réponses des tiers pendant 7 jours
        System->>DB: Enregistrer validations tiers

        alt Au moins 2 tiers nient
            System->>DB: Passer le gift en expired
            System->>Email: Envoyer annulation avec tiers ayant nié
            Email->>User: Gift annulé pour retard de check-in
        else Au moins 1 tiers confirme
            System->>DB: Passer le gift en delivered
        else Aucune réponse après 7 jours
            System->>DB: Passer le gift en expired
            System->>Email: Envoyer annulation pour absence de validation tiers
            Email->>User: Gift annulé pour retard de check-in
        end
    end
```

---

## Diagramme d'États du Gift

```mermaid
stateDiagram-v2
    state "Brouillon" as brouillon
    state "Actif" as active
    state "Check-in en attente" as check_in_attente
    state "Rappel 1" as rappel_1
    state "Rappel 2" as rappel_2
    state "Rappel 3" as rappel_3
    state "Escalade" as escalade
    state "Tiers notifiés" as tiers_notifies
    state "Analyse des réponses" as analyse_reponses
    state "Livré" as delivered
    state "Expiré" as expired

    [*] --> brouillon
    brouillon --> active: Paiement validé
    active --> check_in_attente: nextCheckInDue atteint

    check_in_attente --> active: Utilisateur confirme
    check_in_attente --> rappel_1: +3 jours sans réponse
    rappel_1 --> active: Utilisateur confirme
    rappel_1 --> rappel_2: +6 jours sans réponse
    rappel_2 --> active: Utilisateur confirme
    rappel_2 --> rappel_3: +9 jours sans réponse
    rappel_3 --> active: Utilisateur confirme
    rappel_3 --> escalade: +12 jours sans réponse

    escalade --> tiers_notifies: Notifier les 3 tiers
    tiers_notifies --> analyse_reponses: Attendre jusqu'à 7 jours
    analyse_reponses --> delivered: Au moins 1 confirme et majorité ne nie pas
    analyse_reponses --> expired: Majorité nie
    analyse_reponses --> expired: Aucune réponse après 7 jours
    expired --> [*]: Email annulation au user
```

---

## Diagramme de Classes (Entités Principales)

```mermaid
classDiagram
    class Gift {
        +GiftStatus status
        +DateTime nextCheckInDue
        +DateTime lastCheckInAt
    }

    class CheckInReminder {
        +Int giftId
        +DateTime dueDate
        +String token
        +ReminderStatus status
    }

    class CheckInResponse {
        +Int reminderId
        +DateTime respondedAt
        +Boolean isConfirmedAlive
    }

    class ThirdPartyValidation {
        +Int giftId
        +Int trustedPartyId
        +DateTime respondedAt
        +ThirdPartyValidationStatus status
    }

    class GiftStatus {
        <<enumeration>>
        active
        overdue
        in_escalation
        delivered
        expired
    }

    class ReminderStatus {
        <<enumeration>>
        pending
        sent
        responded
        expired
    }

    class ThirdPartyValidationStatus {
        <<enumeration>>
        pending
        confirmed
        denied
        silent
    }

    Gift "1" --> "*" CheckInReminder : reminders
    CheckInReminder "1" --> "0..1" CheckInResponse : response
    Gift "1" --> "3" ThirdPartyValidation : tierValidations
```

---

## Timeline

```
T = 0 jour   : Gift activé
T + 30 jours : Email de check-in mensuel
T + 33 jours : 1er rappel
T + 36 jours : 2ème rappel
T + 39 jours : 3ème rappel
T + 42 jours : Escalade vers tiers de confiance
T + 49 jours : Livraison si au moins 1 tiers confirme et majorité ne nie pas
T + 49 jours : Expiration si majorité nie ou si aucun tiers ne répond
```
