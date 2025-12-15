# 🔧 Fonctionnalités de Modification et Suppression des Demandes

## 📅 Date d'implémentation : 15 décembre 2025

---

## 🎯 Objectif

Permettre aux utilisateurs de **modifier** ou **supprimer** leurs demandes, et aux validateurs de **demander des corrections** pendant le processus de validation.

---

## ✅ Fonctionnalités Implémentées

### 1. **Pour l'Émetteur (Utilisateur qui crée la demande)**

#### 📝 **Modification de Demande**

**Conditions** :
- ✅ La demande n'est **pas encore traitée** (en attente de validation)
- ✅ OU la demande a le statut **"À corriger"** (retour du validateur)

**Fonctionnement** :
1. L'utilisateur va sur **"Mes Demandes"**
2. Bouton **"Modifier" (✏️ bleu)** visible sur les demandes modifiables
3. Clic sur le bouton → Modal de modification s'ouvre
4. L'utilisateur modifie les champs nécessaires
5. Sauvegarde → La demande est mise à jour
6. Toast de confirmation

**Formulaire de modification** :
- Pré-rempli avec les données actuelles
- Calculs automatiques (durée, total) maintenus
- Validation des champs identique à la création

**Types supportés** :
- ✅ **FDM** (Fiche Descriptive de Mission) - Implémenté
- ⏳ **BonPour** - À implémenter
- ⏳ **RFDM** - À implémenter
- ⏳ **DDA** - À implémenter

---

#### 🗑️ **Suppression de Demande**

**Conditions** :
- ✅ La demande n'est **pas encore traitée**
- ✅ OU la demande a le statut **"À corriger"**

**Fonctionnement** :
1. Bouton **"Supprimer" (🗑️ rouge)** visible
2. Clic → Modal de confirmation
3. Confirmation → Suppression (soft delete)
4. Toast de succès

**Types supportés** :
- ✅ **FDM** - Implémenté
- ✅ **BonPour** - Implémenté
- ⏳ **RFDM** - Non implémenté (API manquante)
- ✅ **DDA** - Implémenté

**Sécurité** :
- ✅ Suppression logique (soft delete) → Données conservées
- ✅ Modal de confirmation obligatoire
- ✅ Impossible de supprimer une demande validée

---

### 2. **Pour le Validateur**

#### 🔄 **Demande de Correction**

**Fonctionnement** :
1. Le validateur va sur **"À Valider"**
2. Pour chaque demande, bouton **"À corriger" (🔄 orange)** disponible
3. Clic → Modal "Demander une correction"
4. **Commentaire obligatoire** : Le validateur explique les modifications nécessaires
5. Confirmation → Demande renvoyée

**Comportement backend** :
- ✅ Demande marquée comme `traite=false` (remise en cours)
- ✅ Si **premier validateur** : retour à l'**émetteur**
- ✅ Si **pas premier** : retour au **validateur précédent**
- ✅ Email de notification avec commentaire
- ✅ L'émetteur peut alors modifier et resoumettre

**Différence avec "Rejeter"** :
- **À corriger** : La demande peut être modifiée et resoumise
- **Rejeter** : La demande est définitivement rejetée (il faut en créer une nouvelle)

---

## 🎨 Interface Utilisateur

### **Page "Mes Demandes" (Émetteur)**

```
┌─────────────────────────────────────────────────────────────────┐
│  Mes Demandes                        [+ Nouvelle Demande]       │
├─────────────────────────────────────────────────────────────────┤
│  ℹ️ Vous pouvez modifier ou supprimer vos demandes tant         │
│     qu'elles ne sont pas validées ou si une correction est      │
│     demandée.                                                    │
├─────────────────────────────────────────────────────────────────┤
│  [FDM] [Bon pour] [Rapports] [Demandes d'achat]                │
├─────────────────────────────────────────────────────────────────┤
│  Projet    │ Lieu  │ Dates  │ Total │ Statut      │ Actions   │
│  ──────────────────────────────────────────────────────────────│
│  Audit     │ Lomé  │ 3j     │ 50k   │ En attente  │ 👁️ ✏️ 🗑️   │
│  Formation │ Kara  │ 5j     │ 120k  │ À corriger  │ 👁️ ✏️ 🗑️   │
│  Mission   │ Dakar │ 2j     │ 80k   │ Validée     │ 👁️        │
└─────────────────────────────────────────────────────────────────┘
```

**Légende des boutons** :
- 👁️ **Voir détails** - Toujours disponible
- ✏️ **Modifier** - Seulement si modifiable (en attente ou à corriger)
- 🗑️ **Supprimer** - Seulement si modifiable

---

### **Page "À Valider" (Validateur)**

```
┌─────────────────────────────────────────────────────────────────┐
│  Demandes à valider                      [En attente: 12]       │
├─────────────────────────────────────────────────────────────────┤
│  ℹ️ Actions disponibles : Valider, demander une Correction      │
│     (retour à l'émetteur), ou Rejeter définitivement.           │
├─────────────────────────────────────────────────────────────────┤
│  [FDM 5] [Bon pour 3] [Rapports 2] [Demandes d'achat 2]        │
├─────────────────────────────────────────────────────────────────┤
│  Projet    │ Émetteur │ Lieu  │ Total │ Actions                │
│  ──────────────────────────────────────────────────────────────│
│  Audit     │ J. Doe   │ Lomé  │ 50k   │ 👁️ ✅ 🔄 ❌             │
│  Formation │ J. Smith │ Kara  │ 120k  │ 👁️ ✅ 🔄 ❌             │
└─────────────────────────────────────────────────────────────────┘
```

**Légende des boutons** :
- 👁️ **Voir détails**
- ✅ **Valider** (vert)
- 🔄 **À corriger** (orange) - Demande une modification
- ❌ **Rejeter** (rouge)

---

## 🔄 Flux de Modification

### **Scénario 1 : Émetteur modifie avant validation**

```
1. Émetteur crée FDM
   ↓
2. FDM en attente de validation
   ↓
3. Émetteur remarque une erreur
   ↓
4. Clic sur "Modifier"
   ↓
5. Modification dans le modal
   ↓
6. Sauvegarde
   ↓
7. FDM mise à jour, toujours en attente
```

---

### **Scénario 2 : Validateur demande correction**

```
1. Émetteur crée FDM
   ↓
2. Validateur reçoit la demande
   ↓
3. Validateur remarque un problème
   ↓
4. Clic sur "À corriger"
   ↓
5. Saisie commentaire : "Précisez le véhicule utilisé"
   ↓
6. Confirmation
   ↓
7. FDM retourne à l'émetteur (statut "À corriger")
   ↓
8. Email envoyé à l'émetteur avec commentaire
   ↓
9. Émetteur modifie la FDM
   ↓
10. FDM repart dans le circuit de validation
```

---

### **Scénario 3 : Suppression de demande**

```
1. Émetteur crée FDM par erreur
   ↓
2. Clic sur "Supprimer"
   ↓
3. Modal : "Êtes-vous sûr de vouloir supprimer ?"
   ↓
4. Confirmation
   ↓
5. FDM supprimée (soft delete)
   ↓
6. Toast : "Demande supprimée avec succès"
```

---

## 🔒 Règles de Sécurité

### **Modification** ✏️
| Statut Demande | Peut Modifier ? | Raison |
|----------------|-----------------|--------|
| En attente | ✅ OUI | Pas encore validée |
| À corriger | ✅ OUI | Validateur a demandé des modifs |
| Validée | ❌ NON | Processus terminé |
| Rejetée | ❌ NON | Processus terminé |

### **Suppression** 🗑️
| Statut Demande | Peut Supprimer ? | Raison |
|----------------|------------------|--------|
| En attente | ✅ OUI | Pas encore validée |
| À corriger | ✅ OUI | Validateur a demandé des modifs |
| Validée | ❌ NON | Processus terminé |
| Rejetée | ❌ NON | Processus terminé |

### **Demande de correction par validateur** 🔄
- ✅ Toujours disponible tant que la demande est en attente
- ✅ Commentaire **obligatoire**
- ✅ Retour automatique selon la position dans le workflow

---

## 📋 APIs Utilisées

### **Modification FDM**
```http
PUT /api/fdms
Content-Type: application/json

{
  "id": 123,
  "nomProjet": "Projet modifié",
  "lieuMission": "Lomé",
  "dateDepart": "2025-12-20",
  "dateProbableRetour": "2025-12-23",
  "dureeMission": 3,
  "objectifMission": "Objectif modifié",
  "perdieme": 30000,
  "transport": 20000,
  "bonEssence": 15000,
  "peage": 5000,
  "laisserPasser": 10000,
  "hotel": 40000,
  "divers": 5000
}
```

### **Suppression**
```http
DELETE /api/fdms/{reference}
DELETE /api/bonpours/{reference}
DELETE /api/ddas/{reference}
```

### **Demande de correction (Validateur)**
```http
POST /api/fdms/{id}/traiter
Content-Type: application/json

{
  "decision": "A_CORRIGER",
  "commentaire": "Veuillez préciser le véhicule utilisé et ajouter les détails du trajet"
}
```

---

## 📁 Fichiers Modifiés

### **Frontend**
1. ✅ `frontend/src/pages/user/DemandesPage.tsx`
   - Ajout boutons Modifier/Supprimer
   - Modal de modification FDM
   - Modal de confirmation suppression
   - Logique `canModifyOrDelete()`

2. ✅ `frontend/src/pages/user/ValidationPage.tsx`
   - Ajout alerte informative
   - Bouton "À corriger" déjà existant

3. ✅ `frontend/src/components/requests/TraitementDialog.tsx`
   - Déjà implémenté avec 3 décisions

### **Backend (déjà existant)**
- ✅ `FicheDescriptiveMissionService.java` - Méthode `update()`
- ✅ `FicheDescriptiveMissionController.java` - Endpoint PUT
- ✅ `FicheDescriptiveMissionService.java` - Méthode `traiterFDM()` avec A_CORRIGER

---

## 🧪 Tests à Effectuer

### **Test 1 : Modification par émetteur**
```
1. Créer une FDM
2. Vérifier que le bouton "Modifier" apparaît
3. Cliquer sur "Modifier"
4. Modal s'ouvre avec données pré-remplies
5. Modifier le nom du projet
6. Sauvegarder
7. Vérifier le toast de succès
8. Vérifier que la FDM est mise à jour dans le tableau
```

### **Test 2 : Suppression**
```
1. Créer une FDM
2. Cliquer sur "Supprimer"
3. Modal de confirmation s'ouvre
4. Confirmer
5. Toast : "Demande supprimée avec succès"
6. La FDM disparaît du tableau
```

### **Test 3 : Demande de correction par validateur**
```
1. Créer une FDM
2. Se connecter en tant que validateur
3. Aller sur "À Valider"
4. Cliquer sur "À corriger"
5. Essayer de confirmer sans commentaire → Erreur
6. Saisir : "Précisez le véhicule"
7. Confirmer
8. Toast de succès
9. Se reconnecter en tant qu'émetteur
10. La FDM affiche "À corriger"
11. Email reçu avec commentaire du validateur
12. Modifier la FDM
13. La FDM repart en validation
```

### **Test 4 : Impossibilité de modifier FDM validée**
```
1. Créer une FDM
2. Faire valider complètement
3. Se connecter en tant qu'émetteur
4. Vérifier que les boutons "Modifier" et "Supprimer" n'apparaissent PAS
5. Seul le bouton "Voir détails" est visible
```

---

## ✅ Checklist de Vérification

### Émetteur
- [x] Bouton "Modifier" visible sur demandes modifiables
- [x] Bouton "Supprimer" visible sur demandes modifiables
- [x] Boutons masqués pour demandes validées/rejetées
- [x] Modal de modification pré-rempli
- [x] Calculs automatiques dans le formulaire
- [x] Toast de succès après modification
- [x] Toast de succès après suppression
- [x] Modal de confirmation pour suppression
- [x] Alerte informative en haut de page

### Validateur
- [x] Bouton "À corriger" visible
- [x] Commentaire obligatoire
- [x] Modal avec message explicatif
- [x] Toast de succès
- [x] Demande retourne à l'émetteur
- [x] Email envoyé avec commentaire
- [x] Alerte informative sur actions disponibles

---

## 📊 Matrice de Fonctionnalités

| Type Demande | Modification | Suppression | Correction Validateur |
|--------------|--------------|-------------|----------------------|
| **FDM** | ✅ Implémenté | ✅ Implémenté | ✅ Implémenté |
| **BonPour** | ⏳ À faire | ✅ Implémenté | ✅ Implémenté |
| **RFDM** | ⏳ À faire | ❌ API manquante | ✅ Implémenté |
| **DDA** | ⏳ À faire | ✅ Implémenté | ✅ Implémenté |

---

## 🚀 Prochaines Étapes (Optionnel)

### Court terme
1. Implémenter modification pour BonPour, RFDM, DDA
2. Ajouter API de suppression pour RFDM
3. Ajouter historique des modifications dans les détails

### Moyen terme
4. Notification in-app quand correction demandée
5. Comparaison avant/après modification
6. Validation des champs modifiés côté backend

### Long terme
7. Audit trail complet des modifications
8. Limitation du nombre de modifications
9. Approbation des modifications majeures

---

## 💡 Notes Importantes

### **Pour l'Émetteur**
- ⚠️ **Une fois validée**, une demande ne peut plus être modifiée
- ✅ Si le validateur demande une correction, vous recevrez un email
- ✅ Vous pouvez modifier autant de fois que nécessaire avant validation
- ⚠️ La suppression est **définitive** (soft delete)

### **Pour le Validateur**
- ✅ **"À corriger"** permet à l'émetteur de modifier
- ✅ **"Rejeter"** est définitif, il faudra créer une nouvelle demande
- ✅ Toujours **expliquer** dans le commentaire ce qui doit être modifié
- ⚠️ Soyez précis dans vos commentaires pour faciliter la correction

---

## 📞 Support

En cas de problème :
- **Email** : support@ids.tg
- **Documentation** : Voir `IMPLEMENTATION_VALIDATION.md`
- **Guide de test** : Voir `GUIDE_TEST_VALIDATION.md`

---

**Date de mise à jour** : 15 décembre 2025
**Version** : 2.0.0
**Statut** : ✅ IMPLÉMENTÉ (FDM), ⏳ EN COURS (autres types)
