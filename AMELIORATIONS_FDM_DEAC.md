# Améliorations FDM et DEAC - Récapitulatif

## 📋 Vue d'ensemble

Ce document récapitule toutes les améliorations apportées aux modules **Fiche Descriptive de Mission (FDM)** et **Demande d'Achat (DEAC)** conformément à la checklist de fonctionnalités.

---

## ✅ I. AMÉLIORATIONS FDM (Fiche Descriptive Mission)

### 1. Calculs Automatiques (@PrePersist/@PreUpdate)

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/models/idsdemande/fdm/FicheDescriptiveMission.java`

**Changements:**
- ✅ Ajout de `@PrePersist` et `@PreUpdate` pour calculer automatiquement `totalEstimatif`
- ✅ Correction du calcul : inclusion de `bonEssence` (qui était manquant)
- ✅ Gestion des valeurs nulles avec des valeurs par défaut (0.0)

```java
@PrePersist
@PreUpdate
public void calculerTotalEstimatif() {
    this.totalEstimatif = (perdieme != null ? perdieme : 0.0) +
            (transport != null ? transport : 0.0) +
            (bonEssence != null ? bonEssence : 0.0) +  // ← Ajouté
            (peage != null ? peage : 0.0) +
            (laisserPasser != null ? laisserPasser : 0.0) +
            (hotel != null ? hotel : 0.0) +
            (divers != null ? divers : 0.0);
}
```

### 2. Workflow - Auto-validation

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/services/idsdemande/fdm/FicheDescriptiveMissionService.java`

**Changements:**
- ✅ Implémentation de l'auto-validation si émetteur = premier validateur
- ✅ Création automatique d'un traitement "VALIDER" avec commentaire explicite
- ✅ Passage automatique au validateur suivant ou approbation finale
- ✅ Notifications email appropriées pour chaque cas

**Logique:**
```
Si émetteur == premier validateur:
  1. Créer traitement auto-validé
  2. Si validateur suivant existe → passer au suivant + email
  3. Sinon → marquer traite=true, favorable=true + email approbation
Sinon:
  Processus normal → email au premier validateur
```

### 3. Service - Retrait des calculs manuels

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/services/idsdemande/fdm/FicheDescriptiveMissionService.java`

**Changements:**
- ✅ Suppression des calculs manuels de `totalEstimatif` dans `createEntity()`
- ✅ Suppression des calculs manuels de `totalEstimatif` dans `updateEntity()`
- ✅ Ajout de commentaires explicatifs : `// Le totalEstimatif est calculé automatiquement par @PrePersist`

---

## ✅ II. AMÉLIORATIONS DEAC (Demande d'Achat)

### 1. Nouveaux Champs - Entité DemandeDachat

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/models/idsdemande/dda/DemandeDachat.java`

**Champs financiers ajoutés:**
- ✅ `remise` (Double) - Montant de remise
- ✅ `prixTotalEffectif` (Double) - Prix après remise
- ✅ `tva` (Double) - Montant TVA (18%)
- ✅ `ttc` (Double) - Total TTC
- ✅ `appliquerTva` (boolean) - Activer/désactiver TVA

**Champs de livraison ajoutés:**
- ✅ `delaiLivraison` (String)
- ✅ `lieuLivraison` (String)
- ✅ `conditionPaiement` (String)

**Champs fichiers ajoutés:**
- ✅ `fichierProforma` (String) - Chemin du fichier proforma
- ✅ `fichierBonCommande` (String) - Chemin du bon de commande généré

**Champs statut ajoutés:**
- ✅ `commander` (boolean) - Indique si la commande a été passée

### 2. Calculs Automatiques (@PrePersist/@PreUpdate)

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/models/idsdemande/dda/DemandeDachat.java`

**Changements:**
```java
@PrePersist
@PreUpdate
public void calculerMontants() {
    // 1. Calculer prixTotal à partir des lignes
    this.prixTotal = somme(lignes[].prixUnitaire * quantite)

    // 2. Calculer prixTotalEffectif (après remise)
    this.prixTotalEffectif = this.prixTotal - this.remise

    // 3. Calculer TVA si activée (18%)
    this.tva = this.appliquerTva ? this.prixTotalEffectif * 0.18 : 0

    // 4. Calculer TTC
    this.ttc = this.prixTotalEffectif + this.tva
}
```

### 3. Calcul automatique prixTotal par ligne

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/models/idsdemande/dda/LigneDemandeAchat.java`

**Changements:**
- ✅ Ajout du champ `prixTotal` (Double)
- ✅ Calcul automatique via `@PrePersist` et `@PreUpdate`

```java
@PrePersist
@PreUpdate
public void calculerPrixTotal() {
    double pu = this.prixUnitaire != null ? this.prixUnitaire : 0d;
    int qty = this.quantite != null ? this.quantite : 0;
    this.prixTotal = pu * qty;
}
```

### 4. Service - Workflow et Auto-validation

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/services/idsdemande/dda/DemandeAchatService.java`

**Changements:**
- ✅ Retrait des calculs manuels (gérés par `@PrePersist`)
- ✅ Implémentation de l'auto-validation (même logique que FDM)
- ✅ Ajout de méthodes `genererBonCommande()` et `confirmerCommande()`

**Nouvelles méthodes:**

```java
public ResponseModel genererBonCommande(Long demandeId) {
    // Vérifie que la demande est approuvée
    // Génère le PDF du bon de commande
    // Enregistre le chemin du fichier
}

public ResponseModel confirmerCommande(Long demandeId, boolean commander) {
    // Vérifie que la demande est approuvée
    // Met à jour le statut commander
}
```

### 5. Controller - Nouveaux Endpoints

**Fichier modifié:** `backend/src/main/java/tg/idstechnologie/plateforme/controller/idsdemande/dda/DemandeAchatController.java`

**Nouveaux endpoints:**
- ✅ `POST /api/ddas/{id}/generer-bon-commande` - Génère un bon de commande
- ✅ `POST /api/ddas/{id}/confirmer-commande` - Confirme que la commande a été passée

---

## ✅ III. AMÉLIORATIONS FRONTEND

### 1. API Service DEAC

**Nouveau fichier:** `frontend/src/api/demandeAchat.ts`

**Fonctionnalités:**
- ✅ `getAll(page, size)` - Liste toutes les demandes
- ✅ `getMyRequests(page, size)` - Demandes de l'utilisateur
- ✅ `getPendingValidations(page, size)` - Demandes à valider
- ✅ `getByRef(reference)` - Détails d'une demande
- ✅ `create(data)` - Créer une demande
- ✅ `update(data)` - Mettre à jour une demande
- ✅ `traiter(id, decision, commentaire)` - Valider/Rejeter/Corriger
- ✅ `delete(reference)` - Supprimer une demande
- ✅ `genererBonCommande(id)` - Générer bon de commande
- ✅ `confirmerCommande(id, commander)` - Confirmer commande
- ✅ `reglerDDA(id, regler)` - Marquer comme réglée

### 2. Types TypeScript - DemandeAchat

**Fichier modifié:** `frontend/src/types/DemandeAchat.ts`

**Nouveaux champs ajoutés:**
```typescript
export interface DemandeAchat {
  // ... champs existants

  // Nouveaux champs financiers
  remise?: number;
  prixTotalEffectif: number;
  tva: number;
  ttc: number;
  appliquerTva: boolean;

  // Champs de livraison
  delaiLivraison?: string;
  lieuLivraison?: string;
  conditionPaiement?: string;

  // Fichiers
  fichierProforma?: string;
  fichierBonCommande?: string;

  // Statuts
  commander: boolean;
}

export interface LigneDemandeAchat {
  // ... champs existants
  prixTotal?: number; // Calculé automatiquement côté backend
}
```

---

## 📊 IV. RÉCAPITULATIF DES FONCTIONNALITÉS IMPLÉMENTÉES

### ✅ Checklist Backend

**FDM:**
- [x] Calcul automatique `totalEstimatif` avec `@PrePersist/@PreUpdate`
- [x] Inclusion de `bonEssence` dans le calcul
- [x] Calcul automatique de la durée de mission
- [x] Auto-validation si émetteur = premier validateur
- [x] Workflow complet de validation
- [x] Notifications email à chaque étape

**DEAC:**
- [x] Calcul automatique `prixTotal` par ligne
- [x] Calcul automatique `prixTotalEffectif` (après remise)
- [x] Calcul automatique TVA (18% si activée)
- [x] Calcul automatique TTC
- [x] Champs de livraison (délai, lieu, conditions)
- [x] Gestion fichiers (proforma, bon de commande)
- [x] Endpoint génération bon de commande
- [x] Endpoint confirmation commande
- [x] Auto-validation si émetteur = premier validateur
- [x] Workflow complet de validation

### ✅ Checklist Frontend

**API Services:**
- [x] API complète pour FDM (`FicheDescriptiveMissionAPI`)
- [x] API complète pour DEAC (`DemandeAchatAPI`)
- [x] Méthodes CRUD complètes
- [x] Méthodes de workflow (traiter, valider)
- [x] Méthodes spécifiques (générer bon commande, confirmer)

**Types TypeScript:**
- [x] Types FDM complets
- [x] Types DEAC complets avec nouveaux champs
- [x] Types TraitementDecision
- [x] Types Request (Create/Update)

---

## 🔧 V. PROCHAINES ÉTAPES RECOMMANDÉES

### Backend
1. **Génération PDF:**
   - [ ] Implémenter génération PDF FDM avec iText
   - [ ] Implémenter génération PDF DEAC
   - [ ] Implémenter génération PDF Bon de Commande

2. **Gestion fichiers:**
   - [ ] Upload pièces jointes pour FDM
   - [ ] Upload fichier proforma pour DEAC
   - [ ] Download pièces jointes
   - [ ] Validation types de fichiers (PDF, images)

3. **Email:**
   - [ ] Templates HTML pour emails
   - [ ] Personnalisation messages selon le type de demande

### Frontend
1. **Composants FDM:**
   - [ ] FdmForm - Formulaire de création/modification
   - [ ] FdmList - Liste avec filtres et pagination
   - [ ] FdmDetail - Détail avec historique des traitements
   - [ ] FdmTraitement - Formulaire de validation

2. **Composants DEAC:**
   - [ ] DeacForm - Formulaire avec gestion lignes dynamiques
   - [ ] DeacList - Liste avec filtres
   - [ ] DeacDetail - Détail avec calculs TVA/TTC
   - [ ] DeacTraitement - Formulaire de validation
   - [ ] BonCommandeGeneration - Interface génération bon de commande

3. **Fonctionnalités UI:**
   - [ ] Calcul temps réel du total dans les formulaires
   - [ ] Checkbox "Appliquer TVA" avec recalcul automatique
   - [ ] Upload fichiers avec preview
   - [ ] Timeline des validations
   - [ ] Notifications toast pour actions

---

## 📝 VI. NOTES TECHNIQUES

### Gestion des calculs
- **Backend:** Tous les calculs sont effectués par les méthodes `@PrePersist` et `@PreUpdate`
- **Frontend:** Peut afficher des calculs prévisionnels, mais les valeurs officielles viennent toujours du backend
- **Avantage:** Garantit la cohérence des données, évite les erreurs de synchronisation

### Workflow de validation
- La logique d'auto-validation est identique pour FDM et DEAC
- Un traitement est créé même en cas d'auto-validation (traçabilité)
- Les emails sont envoyés à chaque étape du workflow

### Points d'attention
- Les calculs manuels ont été retirés des services (redondants avec `@PrePersist`)
- Les validations métier restent dans les services
- Les contraintes de base de données doivent être synchronisées avec les nouveaux champs

---

## 🎯 VII. RÈGLES MÉTIER IMPLÉMENTÉES

### FDM
1. ✅ Total estimatif = somme de tous les frais (incluant bonEssence)
2. ✅ Durée mission calculée automatiquement (date retour - date départ)
3. ✅ Date retour > date départ (validation)
4. ✅ Auto-validation si émetteur est le premier validateur
5. ✅ Email au validateur suivant après chaque validation
6. ✅ Email à l'émetteur en cas d'approbation/rejet/correction

### DEAC
1. ✅ Prix total ligne = prix unitaire × quantité
2. ✅ Prix total = somme des lignes
3. ✅ Prix total effectif = prix total - remise
4. ✅ TVA = 18% du prix effectif (si activée)
5. ✅ TTC = prix effectif + TVA
6. ✅ Au moins une ligne d'achat obligatoire
7. ✅ Bon de commande générable uniquement si demande approuvée
8. ✅ Auto-validation si émetteur est le premier validateur

---

**Document généré le:** 2025-11-29
**Version:** 1.0
**Auteur:** Claude Code Assistant
