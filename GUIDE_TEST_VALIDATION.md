# 🧪 Guide de Test - Système de Validation Frontend

## 📋 Prérequis

Avant de commencer les tests, assurez-vous que :
- ✅ Le backend est démarré (`./mvnw spring-boot:run`)
- ✅ Le frontend est démarré (`npm run dev`)
- ✅ Vous avez accès à la base de données
- ✅ La configuration email est fonctionnelle

---

## 🎯 Scénarios de Test

### 🟢 TEST 1 : Validation Simple (Cas Nominal)

**Objectif** : Tester le flux de validation complet avec succès

#### Données de test
- **Émetteur** : user1@ids.tg (mot de passe : test123)
- **Validateur** : user2@ids.tg (mot de passe : test123)
- **Type** : Fiche Descriptive de Mission (FDM)

#### Étapes

1. **Créer la demande**
   ```
   ✅ Se connecter en tant que user1@ids.tg
   ✅ Aller sur "Mes Demandes"
   ✅ Cliquer sur "Nouvelle Demande"
   ✅ Sélectionner "Fiche descriptive de mission"
   ✅ Remplir le formulaire :
      - Nom du projet : "Audit Technique Lomé"
      - Lieu : "Lomé, Togo"
      - Date départ : Demain
      - Date retour : Dans 3 jours
      - Objectif : "Réaliser l'audit technique du système"
      - Montants : 30000 (perdiem), 20000 (transport)
   ✅ Cliquer sur "Soumettre"
   ```

2. **Vérifier la notification**
   ```
   ✅ Toast de succès : "Fiche descriptive de mission créée avec succès"
   ✅ Redirection vers /user/demandes
   ✅ La FDM apparaît dans le tableau avec statut "En attente"
   ```

3. **Se connecter en tant que validateur**
   ```
   ✅ Se déconnecter
   ✅ Se connecter en tant que user2@ids.tg
   ✅ Aller sur "À Valider" (menu de gauche)
   ```

4. **Vérifier l'affichage**
   ```
   ✅ La page affiche "Demandes à valider"
   ✅ Card récapitulative affiche "1" en attente
   ✅ Onglet FDM affiche badge "1"
   ✅ Le tableau affiche la demande "Audit Technique Lomé"
   ✅ Informations visibles :
      - Émetteur : user1@ids.tg
      - Lieu : Lomé, Togo
      - Période : [dates sélectionnées]
      - Total estimatif : 50 000 CFA
   ```

5. **Voir les détails**
   ```
   ✅ Cliquer sur l'icône "👁️" (œil)
   ✅ Modal s'ouvre avec "Détails de la demande"
   ✅ Vérifier toutes les informations :
      - Projet, Lieu, Période
      - Objectif complet
      - Tous les montants détaillés
      - Total estimatif
   ✅ Fermer le modal
   ```

6. **Valider la demande**
   ```
   ✅ Cliquer sur le bouton vert "✅" (Valider)
   ✅ Modal "Valider la demande" s'ouvre
   ✅ Vérifier le message :
      "Cette demande sera approuvée et passera au validateur suivant..."
   ✅ Saisir un commentaire (optionnel) : "Approuvé pour mission"
   ✅ Cliquer sur "Valider"
   ```

7. **Vérifier le résultat**
   ```
   ✅ Toast de succès : "Demande validée avec succès"
   ✅ La demande disparaît du tableau
   ✅ Compteur "En attente" passe à 0
   ✅ Badge sur onglet FDM disparaît
   ```

8. **Vérifier l'email**
   ```
   ✅ Ouvrir la boîte mail du prochain validateur (ou émetteur si dernier)
   ✅ Email reçu avec sujet contenant "FDM"
   ✅ Corps de l'email contient les détails de la mission
   ```

**✅ TEST RÉUSSI si toutes les étapes passent**

---

### 🔴 TEST 2 : Rejet avec Commentaire Obligatoire

**Objectif** : Tester le rejet d'une demande avec validation du commentaire

#### Étapes

1. **Créer une nouvelle FDM** (suivre TEST 1, étapes 1-3)

2. **Tenter de rejeter sans commentaire**
   ```
   ✅ Cliquer sur le bouton rouge "❌" (Rejeter)
   ✅ Modal "Rejeter la demande" s'ouvre
   ✅ Vérifier l'alerte rouge :
      "ATTENTION : Le rejet est définitif..."
   ✅ NE PAS saisir de commentaire
   ✅ Cliquer sur "Rejeter"
   ✅ ATTENDU : Message d'erreur "Un commentaire est obligatoire..."
   ```

3. **Rejeter avec commentaire**
   ```
   ✅ Saisir un commentaire : "Budget insuffisant pour cette mission"
   ✅ Cliquer sur "Rejeter"
   ✅ Toast de succès : "Demande rejetée avec succès"
   ✅ La demande disparaît du tableau
   ```

4. **Vérifier en tant qu'émetteur**
   ```
   ✅ Se connecter en tant que user1@ids.tg
   ✅ Aller sur "Mes Demandes"
   ✅ La FDM affiche badge rouge "Rejetée"
   ✅ Cliquer sur "Voir détails"
   ✅ Vérifier que le statut est "Rejetée"
   ```

5. **Vérifier l'email de rejet**
   ```
   ✅ Ouvrir la boîte mail de user1@ids.tg
   ✅ Email reçu avec sujet "FDM Rejetée"
   ✅ Corps contient :
      - Raison du rejet : "Budget insuffisant..."
      - Nom du rejeteur
      - Date de rejet
   ```

**✅ TEST RÉUSSI si toutes les étapes passent**

---

### 🟠 TEST 3 : Demande de Correction

**Objectif** : Tester le retour en arrière pour correction

#### Étapes

1. **Créer une nouvelle FDM** (suivre TEST 1, étapes 1-3)

2. **Demander une correction**
   ```
   ✅ Cliquer sur le bouton orange "🔄" (À corriger)
   ✅ Modal "Demander une correction" s'ouvre
   ✅ Vérifier le message :
      "La demande sera renvoyée au validateur précédent..."
   ✅ Saisir un commentaire :
      "Merci de préciser le véhicule utilisé pour le transport"
   ✅ Cliquer sur "Demander correction"
   ```

3. **Vérifier le résultat**
   ```
   ✅ Toast de succès : "Demande marquée pour correction avec succès"
   ✅ La demande disparaît du tableau validateur
   ```

4. **Vérifier en tant qu'émetteur**
   ```
   ✅ Se connecter en tant que user1@ids.tg
   ✅ La FDM affiche badge jaune/orange "À corriger"
   ✅ Un message indique : "Corrections demandées"
   ✅ Le commentaire du validateur est visible
   ```

5. **Vérifier l'email**
   ```
   ✅ Email reçu avec sujet "Correction nécessaire"
   ✅ Corps contient le commentaire du validateur
   ```

6. **Corriger et resoumettre**
   ```
   ✅ Modifier la demande (ajouter précisions)
   ✅ Sauvegarder
   ✅ La demande retourne dans la file du validateur
   ```

**✅ TEST RÉUSSI si toutes les étapes passent**

---

### 🔵 TEST 4 : Workflow Multi-Validateurs

**Objectif** : Tester le passage entre plusieurs validateurs

#### Configuration préalable
```sql
-- Configurer 3 validateurs dans la chaîne FDM
INSERT INTO validateur (ordre, type_processus_id, user_id) VALUES
  (1, [ID_TYPE_FDM], [ID_USER_2]),
  (2, [ID_TYPE_FDM], [ID_USER_3]),
  (3, [ID_TYPE_FDM], [ID_USER_4]);
```

#### Étapes

1. **Créer la demande** (user1)
2. **Validateur 1 valide**
   ```
   ✅ Se connecter en tant que user2
   ✅ Valider la demande avec commentaire : "Étape 1 OK"
   ✅ Vérifier que la demande disparaît de sa liste
   ```

3. **Validateur 2 reçoit la demande**
   ```
   ✅ Se connecter en tant que user3
   ✅ Aller sur "À Valider"
   ✅ La demande apparaît dans son tableau
   ✅ Valider avec commentaire : "Étape 2 OK"
   ```

4. **Validateur 3 finalise**
   ```
   ✅ Se connecter en tant que user4
   ✅ La demande apparaît dans son tableau
   ✅ Valider avec commentaire : "Approbation finale"
   ✅ Toast : "Demande validée avec succès"
   ```

5. **Vérifier la finalisation**
   ```
   ✅ Se connecter en tant que user1
   ✅ La FDM affiche badge vert "Validée"
   ✅ Email reçu : "Votre FDM a été approuvée"
   ```

6. **Vérifier les comptables**
   ```
   ✅ Tous les utilisateurs avec poste "COMPTABLE" reçoivent un email
   ✅ Email contient les détails de la FDM approuvée
   ```

**✅ TEST RÉUSSI si toutes les étapes passent**

---

### 🟣 TEST 5 : Test des 4 Types de Demandes

**Objectif** : Vérifier que tous les types fonctionnent

#### Test FDM
```
✅ Déjà testé ci-dessus
```

#### Test BonPour
```
1. Créer un BonPour avec 3 lignes
2. Vérifier l'affichage dans l'onglet "Bon pour"
3. Valider le BonPour
4. Vérifier le calcul automatique du montant total
```

#### Test RFDM
```
1. Créer un Rapport Financier de Mission
2. Vérifier l'affichage dans l'onglet "Rapports"
3. Valider le RFDM
4. Vérifier les totaux calculés
```

#### Test DDA
```
1. Créer une Demande d'Achat avec lignes
2. Vérifier l'affichage dans l'onglet "Demandes d'achat"
3. Valider la DDA
4. Vérifier le calcul TTC avec TVA
```

**✅ TEST RÉUSSI si les 4 types s'affichent et se traitent correctement**

---

### 🔶 TEST 6 : Gestion des Erreurs

**Objectif** : Tester la robustesse du système

#### Test 1 : Backend indisponible
```
1. Arrêter le backend
2. Essayer de valider une demande
3. ATTENDU : Toast d'erreur "Erreur lors du traitement..."
4. La demande reste visible dans le tableau
5. Redémarrer le backend
6. Réessayer → succès
```

#### Test 2 : Utilisateur non autorisé
```
1. Créer une FDM pour validateur A
2. Se connecter en tant que validateur B (non autorisé)
3. Essayer de valider via API directe
4. ATTENDU : Erreur 403 "Vous n'êtes pas autorisé..."
```

#### Test 3 : Demande déjà traitée
```
1. Valider une FDM
2. Essayer de la valider à nouveau (via API)
3. ATTENDU : Erreur "FDM déjà traitée"
```

**✅ TEST RÉUSSI si toutes les erreurs sont bien gérées**

---

## 📊 Checklist Globale de Test

### Fonctionnalités de Base
- [ ] Page /user/validations accessible
- [ ] Affichage correct des 4 onglets
- [ ] Compteurs corrects sur chaque onglet
- [ ] Card récapitulative avec total
- [ ] Bouton "Voir détails" fonctionne
- [ ] Modal de détails affiche toutes les infos

### Actions de Validation
- [ ] Bouton "Valider" fonctionne
- [ ] Commentaire optionnel pour validation
- [ ] Toast de succès après validation
- [ ] Rechargement auto du tableau
- [ ] Email envoyé au suivant/émetteur

### Actions de Rejet
- [ ] Bouton "Rejeter" fonctionne
- [ ] Commentaire obligatoire (validation)
- [ ] Erreur si commentaire vide
- [ ] Toast de succès après rejet
- [ ] Email de rejet envoyé
- [ ] Badge "Rejetée" sur la demande

### Actions de Correction
- [ ] Bouton "À corriger" fonctionne
- [ ] Commentaire obligatoire (validation)
- [ ] Toast de succès après correction
- [ ] Demande retourne au précédent
- [ ] Email de correction envoyé

### Workflow Multi-Validateurs
- [ ] Passage au validateur suivant
- [ ] Email à chaque validateur
- [ ] Dernier validateur finalise
- [ ] Email aux comptables (FDM)
- [ ] Badge "Validée" final

### Types de Demandes
- [ ] FDM fonctionne
- [ ] BonPour fonctionne
- [ ] RFDM fonctionne
- [ ] DDA fonctionne

### Gestion des Erreurs
- [ ] Backend down → erreur claire
- [ ] Utilisateur non autorisé → erreur 403
- [ ] Demande déjà traitée → erreur
- [ ] Réseau lent → loading visible

---

## 🐛 Bugs Connus à Signaler

Si vous rencontrez des problèmes, notez-les ici avec :
- Date/Heure
- Description du bug
- Étapes pour reproduire
- Erreur console (F12)
- Logs backend

**Format** :
```
[2025-12-15 14:30]
BUG: Le compteur ne se met pas à jour après validation
REPRO:
  1. Valider une FDM
  2. Regarder le compteur
  3. Le compteur affiche toujours l'ancien nombre
ERREUR CONSOLE: Aucune
LOGS BACKEND: [copier les logs]
```

---

## ✅ Validation Finale

Une fois tous les tests passés, remplir cette checklist :

- [ ] **TEST 1** : Validation simple ✅
- [ ] **TEST 2** : Rejet avec commentaire ✅
- [ ] **TEST 3** : Demande de correction ✅
- [ ] **TEST 4** : Multi-validateurs ✅
- [ ] **TEST 5** : 4 types de demandes ✅
- [ ] **TEST 6** : Gestion des erreurs ✅

**Signature testeur** : _________________
**Date** : _________________
**Verdict** : ✅ VALIDÉ / ❌ À CORRIGER

---

## 📞 Contact Support

En cas de problème :
- **Email** : support@ids.tg
- **Slack** : #dev-plateforme
- **Documentation** : Voir `IMPLEMENTATION_VALIDATION.md`

---

**Bonne chance pour les tests ! 🚀**
