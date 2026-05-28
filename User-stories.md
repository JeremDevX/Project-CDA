# Backlog User Stories — LegacyGift (avec charges)

## EPIC 1 — Découverte du produit

### US-01 — Accéder à la landing page

En tant que visiteur, je veux accéder à une landing page afin de découvrir le produit.  
**Charge (SP) : 2**

**Critères d’acceptation**

- La page est accessible sans authentification.
- La proposition de valeur du produit est visible dès l’arrivée sur la page.
- Un appel à l’action permet d’aller vers l’inscription ou la connexion.

---

### US-02 — Consulter les informations importantes

En tant que visiteur, je veux consulter les informations importantes du service afin de comprendre son fonctionnement et ses limites.  
**Charge (SP) : 1**

**Critères d’acceptation**

- Les informations essentielles sur le fonctionnement du service sont visibles.
- Les principales limites ou conditions d’usage sont présentées de manière compréhensible.
- Les informations sont accessibles avant inscription.

---

### US-03 — Consulter les offres tarifaires

En tant que visiteur, je veux consulter les différentes offres tarifaires afin de comprendre les possibilités associées à chaque formule.  
**Charge (SP) : 1**

**Critères d’acceptation**

- Les différentes offres sont affichées sur la landing page ou depuis celle-ci.
- Chaque offre présente ses principales fonctionnalités ou limitations.
- L’utilisateur peut identifier facilement l’offre correspondant à son besoin.

---

## EPIC 2 — Compte utilisateur et authentification

### US-04 — Créer un compte

En tant qu’utilisateur, je veux pouvoir créer un compte afin d’accéder à l’application.  
**Charge (SP) : 3**

**Critères d’acceptation**

- Un formulaire permet de renseigner les informations nécessaires à l’inscription.
- Le compte est créé si les données attendues sont valides.
- En cas d’erreur, un message explicite est affiché.

---

### US-05 — Se connecter

En tant qu’utilisateur, je veux pouvoir me connecter à mon compte afin d’accéder à mes gifts.  
**Charge (SP) : 2**

**Critères d’acceptation**

- Un formulaire permet de saisir les identifiants de connexion.
- L’utilisateur authentifié est redirigé vers son espace personnel.
- En cas d’identifiants invalides, un message d’erreur est affiché.

---

### US-06 — Se déconnecter

En tant qu’utilisateur, je veux pouvoir me déconnecter afin de sécuriser ma session.  
**Charge (SP) : 1**

**Critères d’acceptation**

- Une action de déconnexion est accessible depuis l’espace connecté.
- La session est fermée après déconnexion.
- L’utilisateur ne peut plus accéder aux pages protégées sans se reconnecter.

---

### US-07 — Consulter les informations du compte

En tant qu’utilisateur, je veux pouvoir accéder aux informations de mon compte afin de consulter mes données personnelles.  
**Charge (SP) : 1**

**Critères d’acceptation**

- Une page ou section compte est accessible depuis l’espace connecté.
- Les informations du compte y sont visibles.
- Les données affichées correspondent au compte connecté.

---

## EPIC 3 — Dashboard et gestion générale

### US-08 — Accéder au dashboard

En tant qu’utilisateur, je veux pouvoir accéder au dashboard de mes gifts afin de visualiser mes contenus.  
**Charge (SP) : 2**

**Critères d’acceptation**

- Le dashboard est accessible uniquement après authentification.
- Le dashboard présente les gifts liés au compte connecté.
- Depuis le dashboard, l’utilisateur peut lancer la création d’un nouveau gift.

---

### US-09 — Voir les gifts actifs et les brouillons

En tant qu’utilisateur, je veux pouvoir voir mes gifts actifs ainsi que mes brouillons afin de distinguer ce qui est finalisé de ce qui est encore en cours.  
**Charge (SP) : 3**

**Critères d’acceptation**

- Les gifts finalisés et les brouillons sont visibles dans le dashboard.
- La distinction entre brouillon et gift finalisé est compréhensible visuellement.
- Chaque élément affiché permet d’accéder à son détail ou à sa reprise.

---

### FIX 01 — Ajouter un reset CSS et lisser les styles existants

En tant qu’équipe produit, je veux ajouter un reset CSS global et harmoniser les règles CSS déjà présentes afin de réduire les doublons, normaliser les styles de base et faciliter la maintenance de l’interface.  
**Charge (SP) : 1**

**Critères d’acceptation**

- Un reset CSS global est ajouté et chargé dans l’application.
- Les règles CSS de type reset déjà dispersées dans les fichiers existants sont retirées lorsqu’elles font doublon avec le reset global.

---

## EPIC 4 — Création et configuration initiale

### US-10 — Créer un nouveau gift

En tant qu’utilisateur, je veux pouvoir créer un nouveau gift afin de préparer un contenu à transmettre.  
**Charge (SP) : 2**

**Critères d’acceptation**

- Depuis le dashboard, un point d’entrée permet de créer un gift.
- La création ouvre un parcours dédié.
- Un nouveau gift en cours est associé au compte connecté.

---

### US-11 — Voir et comparer les offres disponibles

En tant qu’utilisateur, je veux pouvoir voir les différentes offres disponibles et comprendre ce qu’elles incluent afin de choisir celle qui correspond à mon besoin.  
**Charge (SP) : 2**

**Critères d’acceptation**

- Les offres sont consultables pendant le parcours de création.
- Les fonctionnalités ou limites liées à chaque offre sont présentées clairement.
- L’utilisateur peut comparer les principales différences entre offres.
- L’utilisateur peut sélectionner une offre.
- Les restrictions fonctionnelles sont cohérentes avec l’offre sélectionnée.
- L’offre choisie est reprise dans le récapitulatif.

---

### US-12 — Fusionnée dans l’US-11

Cette user story est fusionnée avec l’US-11, car les offres disponibles et les possibilités incluses sont affichées et sélectionnées sur le même écran du parcours de création.  
**Charge (SP) : 0**

**Critères d’acceptation**

- Voir l’US-11.

---

### US-13 — Choisir le mode de création

En tant qu’utilisateur, je veux pouvoir choisir le mode de création de mon gift afin d’adapter le parcours à mon besoin.  
**Charge (SP) : 1**

**Critères d’acceptation**

- Les modes de création disponibles sont présentés clairement.
- L’utilisateur peut sélectionner un mode avant de poursuivre.
- Le parcours s’adapte au mode sélectionné.

---

### US-14 — Donner un titre au gift

En tant qu’utilisateur, je veux pouvoir donner un titre à mon gift afin de le personnaliser.  
**Charge (SP) : 1**

**Critères d’acceptation**

- Un champ permet de renseigner le titre du gift.
- Le titre est enregistré dans le gift.
- Le titre est repris dans le récapitulatif et/ou l’aperçu si prévu.

---

### US-15 — Rédiger le message principal

En tant qu’utilisateur, je veux pouvoir rédiger un message afin de composer le contenu principal de mon gift.  
**Charge (SP) : 2**

**Critères d’acceptation**

- Une zone de saisie permet de rédiger le message.
- Le contenu saisi est enregistré.
- Le message est repris dans l’aperçu et le récapitulatif.

---

### US-16 — Sauvegarde automatique

En tant qu’utilisateur, je veux que mon gift soit sauvegardé automatiquement pendant sa création afin de ne pas perdre ma progression.  
**Charge (SP) : 5**

**Critères d’acceptation**

- Les informations saisies sont enregistrées automatiquement au fil du parcours.
- En cas de retour ultérieur, les données déjà saisies sont retrouvées.
- Le gift en cours apparaît comme brouillon tant qu’il n’est pas finalisé.

---

### US-17 — Afficher la date de suppression automatique des brouillons

En tant qu’utilisateur, je veux voir la date de suppression automatique de mes brouillons afin de savoir jusqu’à quand je peux reprendre un gift non finalisé avant son nettoyage automatique.  
**Charge (SP) : 3**

**Critères d’acceptation**

- Chaque brouillon issu du parcours de création possède une date limite de conservation calculée à partir de sa date de création.
- Le dashboard ou le détail du brouillon affiche clairement la date limite ou le temps restant avant suppression.
- Un CRON identifie les brouillons expirés et déclenche leur suppression automatique.
- Les gifts finalisés ou activés ne sont pas concernés par la suppression automatique des brouillons.

---

## EPIC 5 — Médias et prévisualisation

### US-18 — Adapter automatiquement les emplacements disponibles

En tant qu’utilisateur, je veux que les emplacements disponibles s’adaptent automatiquement selon l’offre sélectionnée afin de ne pouvoir renseigner que les éléments autorisés.  
**Charge (SP) : 3**

**Critères d’acceptation**

- Le nombre de champs ou blocs disponibles dépend de l’offre sélectionnée.
- Si la limite est atteinte, aucun nouveau cadre ou emplacement n’est affiché.
- En cas de changement d’offre, l’interface se met à jour de façon cohérente.

---

### US-19 — Ajouter des images / vidéos selon l’offre

En tant qu’utilisateur, je veux pouvoir ajouter des images ou vidéos à mon gift si mon offre le permet afin d’enrichir son contenu.  
**Charge (SP) : 3**

**Critères d’acceptation**

- L’ajout d’images ou vidéos est disponible uniquement si l’offre le permet.
- L’utilisateur peut ajouter un ou plusieurs médias dans la limite autorisée.
- Si la limite est atteinte, aucun nouvel emplacement n’est proposé.

---

### US-20 — Prévisualiser le gift

En tant qu’utilisateur, je veux pouvoir prévisualiser mon gift afin de voir à quoi il ressemblera une fois reçu.  
**Charge (SP) : 3**

**Critères d’acceptation**

- Un aperçu du gift est accessible avant validation finale.
- L’aperçu reprend les éléments saisis par l’utilisateur.
- L’aperçu permet de vérifier le rendu global du gift.

---

## EPIC 6 — Destinataires et tiers de confiance

### US-21 — Définir les destinataires

En tant qu’utilisateur, je veux pouvoir définir les destinataires de mon gift afin de choisir à qui il sera transmis.  
**Charge (SP) : 3**

**Critères d’acceptation**

- L’utilisateur peut ajouter un ou plusieurs destinataires selon les limites prévues.
- Les informations attendues pour un destinataire peuvent être renseignées.
- Les destinataires ajoutés apparaissent dans le récapitulatif.

---

### US-22 — Définir les tiers de confiance

En tant qu’utilisateur, je veux pouvoir définir les tiers de confiance afin de participer au processus de validation du déclenchement.  
**Charge (SP) : 3**

**Mise à jour**

- US-22 fusionnée avec US-23 : la page de définition des tiers permet aussi de renseigner et valider leurs informations obligatoires.

**Critères d’acceptation**

- L’utilisateur peut ajouter les tiers de confiance prévus par le parcours.
- Les tiers ajoutés sont associés au gift en cours.
- Les tiers de confiance apparaissent dans le récapitulatif final.

---

### US-23 — Renseigner les informations nécessaires pour chaque tiers

En tant qu’utilisateur, je veux pouvoir renseigner les informations nécessaires pour chaque tiers de confiance afin de permettre leur prise en compte dans le dispositif.  
**Charge (SP) : 3**

**Mise à jour**

- US-23 couverte par l’implémentation de l’US-22.
- Pas d’écran séparé : les champs nécessaires sont directement intégrés à la page des tiers de confiance.

**Critères d’acceptation**

- Les champs nécessaires à la configuration d’un tiers sont disponibles.
- Les données saisies sont enregistrées dans le gift.
- Un tiers incomplet ne peut pas être validé si ses informations obligatoires manquent.

---

## EPIC 7 — Confirmations, paiement et activation

### US-24 — Valider les dernières confirmations

En tant qu’utilisateur, je veux confirmer les derniers points importants avant l’activation afin de valider que mon gift peut être finalisé.  
**Charge (SP) : 2**

**Critères d’acceptation**

- Les confirmations nécessaires avant activation sont présentées clairement.
- L’utilisateur doit valider les points requis avant de continuer.
- Les confirmations validées sont enregistrées avec le gift.

---

### US-25 — Consulter le récapitulatif

En tant qu’utilisateur, je veux pouvoir consulter un récapitulatif de mon gift afin de vérifier son contenu avant validation.  
**Charge (SP) : 2**

**Critères d’acceptation**

- Une étape ou section récapitulative est accessible avant paiement.
- Le récapitulatif affiche les informations déjà configurées.
- L’utilisateur peut revenir corriger un élément avant validation finale.

---

### US-26 — Naviguer entre les étapes et voir l’étape en cours

En tant qu’utilisateur, je veux pouvoir revenir aux différentes étapes de création depuis la fin du tunnel afin de corriger mon gift avant activation.  
**Charge (SP) : 3**

**Critères d’acceptation**

- L’utilisateur peut revenir aux étapes accessibles du parcours depuis le récapitulatif ou l’étape de confirmation avant paiement.
- Les données déjà saisies sont conservées lors de la navigation.
- L’étape courante et la progression dans le tunnel sont clairement visibles.
- Les étapes non accessibles selon le contexte ne sont pas proposées.

---

### US-27 — Payer le gift via Stripe

En tant qu’utilisateur, je veux pouvoir payer mon gift afin de valider sa mise en service.  
**Charge (SP) : 5**

**Critères d’acceptation**

- Une action permet de lancer le paiement Stripe depuis le parcours.
- En cas de paiement validé, le gift n’est plus considéré comme un brouillon.
- Une confirmation explicite est affichée à l’utilisateur après validation du paiement.

---

### US-28 — Accéder à une confirmation de paiement et voir l’écran de remerciement

En tant qu’utilisateur ayant payé mon gift, je veux voir une confirmation claire après activation et pouvoir conserver une preuve de transaction.  
**Charge (SP) : 3**

**Mise à jour**

- US-28 fusionnée avec l’ancienne US-29 : la confirmation de paiement et l’écran de remerciement sont affichés dans le même parcours après paiement validé.
- Le document généré est une confirmation de paiement interne, pas une facture fiscale.

**Critères d’acceptation**

- Après paiement, une preuve de transaction est disponible.
- La preuve est liée au bon gift.
- La preuve est liée au bon utilisateur.
- L’utilisateur peut consulter cette preuve depuis son compte.
- L’utilisateur peut télécharger cette preuve en PDF.
- Un écran de confirmation est affiché après activation réussie.
- L’utilisateur comprend que le gift est finalisé.
- Une action permet de revenir vers le dashboard ou l’espace de gestion des gifts.

---

## Décision de périmètre — Édition après validation

Les deux user stories liées à la modification d’un gift après activation sont retirées du périmètre CDA.

**Justification**

- La modification gratuite pendant 30 jours après activation n’apporte pas de démonstration technique significative supplémentaire pour le CDA.
- La réouverture payante de l’édition ajoute un second parcours de paiement et de gestion d’état sans valeur prioritaire pour le MVP.
- Le périmètre reste concentré sur les fonctionnalités centrales : création du gift, paiement, activation, suivi et déclenchement.
- Cette suppression réduit la complexité fonctionnelle et limite les risques de dette technique sur une fonctionnalité non essentielle.

---

### US-29 — Choisir une image déjà uploadée

En tant qu’utilisateur, je veux pouvoir sélectionner une image déjà uploadée lorsque j’ajoute un média à mon gift afin de réutiliser mes photos sans devoir les importer à nouveau.  
**Charge (SP) : 3**

**Critères d’acceptation**

- Lorsque l’utilisateur ajoute une image à un gift, il peut choisir entre importer une nouvelle image ou sélectionner une image déjà uploadée.
- Les images déjà uploadées par l’utilisateur sont visibles depuis le parcours de création d’un nouveau gift.
- Une même image uploadée peut être associée à plusieurs gifts.
- Une image sélectionnée est rattachée au gift en cours et apparaît dans l’aperçu.
- Les limites liées à l’offre sélectionnée restent appliquées au nombre de médias associés au gift.

---

## EPIC 8 — Déclenchement, check-in et escalade

### US-30 — Détecter un retard de check-in

En tant que système, je veux détecter qu’un utilisateur n’a pas effectué son check-in dans le délai prévu afin d’identifier les gifts à surveiller.
**Charge (SP) : 3**

**Critères d’acceptation**

- Le système identifie les utilisateurs dont le check-in attendu n’a pas été effectué dans le délai défini.
- Les gifts concernés passent dans un état cohérent avec la situation de retard.
- La détection ne concerne que les gifts activés.

---

### US-31 — Relancer l’utilisateur en cas de non-réponse

En tant que système, je veux relancer l’utilisateur lorsqu’un retard de check-in est détecté afin de lui laisser une possibilité de confirmer sa situation avant toute escalade.
**Charge (SP) : 3**

**Critères d’acceptation**

- Lorsqu’un retard est détecté, une relance utilisateur est déclenchée.
- La relance est enregistrée dans le suivi du gift ou du processus associé.
- Tant qu’aucune condition d’escalade n’est remplie, le gift n’est pas transmis aux destinataires.

---

### US-32 — Escalader vers les tiers de confiance et enregistrer leurs réponses

En tant que système, je veux notifier les tiers de confiance lorsque l’utilisateur ne répond pas après les relances prévues et enregistrer leurs réponses afin d’engager le processus de validation.
**Charge (SP) : 5**

**Critères d’acceptation**

- Si l’utilisateur ne répond pas dans les conditions prévues, les tiers de confiance sont notifiés.
- Les tiers contactés correspondent à ceux configurés pour le gift.
- Le statut du gift reflète clairement le passage en phase d’escalade.
- Chaque tiers peut répondre via un lien indiquant si l’utilisateur est décédé ou vivant.
- L’absence de réponse reste possible et ne déclenche pas automatiquement la transmission.
- La réponse de chaque tiers est enregistrée et rattachée au bon gift.
- L’état de validation est mis à jour après chaque réponse reçue.

---

### US-33 — Afficher une confirmation au tiers de confiance

En tant que tiers de confiance, je veux voir une confirmation claire après avoir répondu afin de savoir que mon action a bien été prise en compte.
**Charge (SP) : 2**

**Critères d’acceptation**

- Après validation d’un décès, une page confirme que l’information a été prise en compte.
- Après indication que l’utilisateur est vivant, une page confirme que l’information a été prise en compte.
- Le message affiché est humain, clair et rassurant.
- La page ne révèle aucun contenu personnel du gift.

---

### US-34 — Déclencher l’envoi du gift après validation

En tant que système, je veux déclencher l’envoi du gift lorsque les conditions de validation sont remplies afin de transmettre le contenu aux destinataires.
**Charge (SP) : 5**

**Critères d’acceptation**

- Lorsque les conditions de validation sont remplies, le gift est transmis aux destinataires configurés.
- Le changement d’état final du gift est visible dans l’application.
- L’envoi n’est déclenché qu’une seule fois pour le gift concerné.
