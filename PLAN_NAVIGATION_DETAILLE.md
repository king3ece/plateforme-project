# PLAN DE NAVIGATION DÉTAILLÉ - PLATEFORME DE GESTION DE DEMANDES

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Navigation Administrateur](#navigation-administrateur)
3. [Navigation Utilisateur](#navigation-utilisateur)
4. [Workflows et Processus](#workflows-et-processus)
5. [Schémas de Navigation](#schémas-de-navigation)

---

## 🎯 VUE D'ENSEMBLE

### Connexion
**Route**: `/login`
**Fichier**: [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx)

**Fonctionnalités**:
- Formulaire de connexion (email + mot de passe)
- Authentification JWT
- Redirection automatique selon le rôle:
  - **ADMIN** → `/admin` (Tableau de bord admin)
  - **USER** → `/user` (Tableau de bord utilisateur)

---

## 👨‍💼 NAVIGATION ADMINISTRATEUR

### Structure du Menu Admin
```
┌─────────────────────────────────────┐
│  MENU SIDEBAR ADMINISTRATEUR        │
├─────────────────────────────────────┤
│  🏠 Tableau de bord                 │
│  ✅ Validation                       │
│  ⚙️  Gestion des processus          │
│  👥 Gestion des utilisateurs        │
│  🏢 Départements                     │
│  📊 Statistiques                     │
└─────────────────────────────────────┘
```

### 1. 🏠 Tableau de Bord Admin
**Route**: `/admin`
**Fichier**: [frontend/src/pages/admin/AdminDashboard.tsx](frontend/src/pages/admin/AdminDashboard.tsx)

**Fonctionnalités**:
- **Statistiques globales**:
  - Nombre total de demandes
  - Demandes en attente
  - Demandes validées
  - Demandes rejetées
  - Demandes à corriger

- **Filtres avancés**:
  - Par statut (En attente, Validée, Rejetée, À corriger)
  - Par type de demande (FDM, BONPOUR, RFDM, DDA)
  - Par priorité (Haute, Moyenne, Basse)
  - Par département/subdivision
  - Par période (dateDebut, dateFin)

- **Tableau des demandes**:
  - Référence
  - Type de demande
  - Émetteur
  - Date d'émission
  - Statut
  - Validateur suivant
  - Actions (Voir détails, Traiter)

- **Actions disponibles**:
  - 🔍 Voir les détails d'une demande
  - ✅ Traiter une demande (si validateur)
  - 📥 Exporter les données
  - 🔄 Rafraîchir les statistiques

---

### 2. ✅ Validation des Demandes
**Route**: `/admin/validations` (ou intégré dans le dashboard)
**Composant**: ValidationPage

**Fonctionnalités**:
- **Liste des demandes en attente de validation**:
  - Filtrées par validateur (uniquement celles assignées à l'admin)
  - Onglets par type: FDM, BONPOUR, RFDM, DDA

- **Détails de chaque demande**:
  - Informations complètes de la demande
  - Historique des validations précédentes
  - Commentaires des validateurs précédents
  - Pièces jointes

- **Actions de validation**:
  - ✅ **Valider**: Approuver et passer au validateur suivant
  - ❌ **Rejeter**: Refuser définitivement (commentaire obligatoire)
  - 🔄 **À corriger**: Demander des modifications à l'émetteur (commentaire obligatoire)

- **Formulaire de traitement**:
  ```
  ┌────────────────────────────────────────┐
  │  Décision: [Valider ▼]                │
  │                                        │
  │  Commentaire:                          │
  │  ┌──────────────────────────────────┐ │
  │  │                                  │ │
  │  │                                  │ │
  │  │                                  │ │
  │  └──────────────────────────────────┘ │
  │                                        │
  │  [Annuler]  [Soumettre]               │
  └────────────────────────────────────────┘
  ```

---

### 3. ⚙️ Gestion des Processus (Workflows)
**Route**: `/admin/workflows`
**Fichier**: [frontend/src/pages/admin/WorkflowsPage.tsx](frontend/src/pages/admin/WorkflowsPage.tsx)
**API**: `/api/validateurs`

**Fonctionnalités**:

#### 3.1 Vue d'ensemble des workflows
- **Liste des types de processus**:
  - FDM (Fiche Descriptive de Mission)
  - BONPOUR (Bon Pour)
  - RFDM (Rapport Financier De Mission)
  - DDA (Demande D'Achat)

#### 3.2 Configuration d'un workflow
**Pour chaque type de processus**:

```
┌─────────────────────────────────────────────────┐
│  Workflow: FICHE DESCRIPTIVE DE MISSION (FDM)  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Chaîne de validation:                          │
│                                                 │
│  1️⃣  Ordre 1: Chef de Service (Jean Dupont)    │
│     [Modifier] [Supprimer]                      │
│                                                 │
│  2️⃣  Ordre 2: Chef de Département (Marie L.)   │
│     [Modifier] [Supprimer]                      │
│                                                 │
│  3️⃣  Ordre 3: Directeur Général (Paul M.)      │
│     [Modifier] [Supprimer]                      │
│                                                 │
│  [+ Ajouter un validateur]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 3.3 Ajouter/Modifier un validateur
**Formulaire**:
```
┌──────────────────────────────────────┐
│  Type de processus: [FDM ▼]         │
│                                      │
│  Ordre: [1]                          │
│                                      │
│  Utilisateur validateur:             │
│  [Sélectionner un utilisateur ▼]    │
│  - Jean Dupont (Chef de Service)    │
│  - Marie Leblanc (Chef Dép.)        │
│  - Paul Martin (Directeur)          │
│                                      │
│  [Annuler]  [Enregistrer]           │
└──────────────────────────────────────┘
```

**Détails**:
- **Ordre**: Définit la séquence de validation (1 = premier validateur)
- **Utilisateur**: Choisir parmi tous les utilisateurs actifs
- **Validation**: Un utilisateur ne peut valider que les demandes où il est configuré comme validateur

---

### 4. 👥 Gestion des Utilisateurs
**Route**: `/admin/users`
**Fichier**: [frontend/src/pages/admin/UsersPage.tsx](frontend/src/pages/admin/UsersPage.tsx)
**API**: `/api/users`

**Fonctionnalités**:

#### 4.1 Liste des utilisateurs
**Tableau avec colonnes**:
- Nom complet (Prénom + Nom)
- Email
- Rôle (ADMIN / USER)
- Poste
- Subdivision
- Statut (Actif / Inactif)
- Actions

#### 4.2 Créer un utilisateur
**Formulaire**:
```
┌────────────────────────────────────────────┐
│  CRÉER UN NOUVEL UTILISATEUR               │
├────────────────────────────────────────────┤
│  Prénom: [________________]                │
│                                            │
│  Nom: [________________]                   │
│                                            │
│  Email: [________________@____________]    │
│                                            │
│  Mot de passe: [________________]          │
│                                            │
│  Rôle: [● USER  ○ ADMIN]                  │
│                                            │
│  Poste: [Sélectionner ▼]                  │
│  - Directeur                               │
│  - Chef de Service                         │
│  - Chef de Département                     │
│  - Employé                                 │
│                                            │
│  Subdivision: [Sélectionner ▼]            │
│  - Direction Générale                      │
│  - Service Informatique                    │
│  - Service Finance                         │
│  - Service RH                              │
│                                            │
│  [☑] Compte activé                         │
│                                            │
│  [Annuler]  [Créer l'utilisateur]         │
└────────────────────────────────────────────┘
```

#### 4.3 Modifier un utilisateur
- Mêmes champs que la création
- Possibilité de changer le mot de passe
- Activer/Désactiver le compte

#### 4.4 Supprimer un utilisateur
- Suppression logique (soft delete)
- Confirmation requise
- L'utilisateur n'est pas réellement supprimé de la base

**Actions en masse**:
- Activer plusieurs utilisateurs
- Désactiver plusieurs utilisateurs
- Exporter la liste

---

### 5. 🏢 Départements (Gestion Structurelle)

#### 5.1 Subdivisions
**Route**: `/admin/subdivisions`
**Fichier**: [frontend/src/pages/admin/SubdivisionsPage.tsx](frontend/src/pages/admin/SubdivisionsPage.tsx)
**API**: `/api/subdivisions`

**Fonctionnalités**:
- **Créer une subdivision**:
  ```
  Code: [DG_001]
  Libellé: [Direction Générale]
  Type: [Direction ▼]
  ```

- **Liste des subdivisions**:
  - Code
  - Libellé
  - Type de subdivision
  - Nombre d'utilisateurs
  - Actions (Modifier, Supprimer)

- **Exemples**:
  - Direction Générale
  - Service Informatique
  - Service Finance
  - Service Ressources Humaines
  - Département Commercial
  - Région Nord

#### 5.2 Types de Subdivisions
**Route**: `/admin/type-subdivisions`
**Fichier**: [frontend/src/pages/admin/TypeSubdivisionsPage.tsx](frontend/src/pages/admin/TypeSubdivisionsPage.tsx)
**API**: `/api/type-subdivisions`

**Fonctionnalités**:
- **Créer un type**:
  ```
  Code: [DIR]
  Libellé: [Direction]
  ```

- **Exemples de types**:
  - Direction
  - Service
  - Département
  - Région
  - Agence
  - Cellule

#### 5.3 Postes
**Route**: `/admin/postes`
**Fichier**: [frontend/src/pages/admin/PostesPage.tsx](frontend/src/pages/admin/PostesPage.tsx)
**API**: `/api/postes`

**Fonctionnalités**:
- **Créer un poste**:
  ```
  Code: [DIR_GEN]
  Libellé: [Directeur Général]
  Subdivision: [Direction Générale ▼]
  ```

- **Liste des postes**:
  - Code
  - Libellé
  - Subdivision
  - Nombre d'utilisateurs
  - Actions

- **Exemples**:
  - Directeur Général
  - Chef de Service
  - Chef de Département
  - Responsable
  - Employé
  - Stagiaire

---

### 6. 📊 Statistiques
**Route**: `/admin/statistiques` (ou intégré dans le dashboard)

**Fonctionnalités**:
- **Graphiques**:
  - Évolution des demandes par mois
  - Répartition par type de demande
  - Taux de validation par validateur
  - Délai moyen de traitement

- **Rapports**:
  - Nombre de demandes par département
  - Demandes en retard
  - Montants financiers (total, par type)
  - Taux de rejet

- **Exports**:
  - Export Excel
  - Export PDF
  - Export CSV

---

## 👤 NAVIGATION UTILISATEUR

### Structure du Menu Utilisateur
```
┌─────────────────────────────────────┐
│  MENU SIDEBAR UTILISATEUR           │
├─────────────────────────────────────┤
│  🏠 Tableau de bord                 │
│  ➕ Nouvelle demande                │
│  📋 Mes demandes                    │
│  ✅ À valider (si validateur)       │
└─────────────────────────────────────┘
```

### 1. 🏠 Tableau de Bord Utilisateur
**Route**: `/user`
**Fichier**: [frontend/src/pages/user/UserDashboard.tsx](frontend/src/pages/user/UserDashboard.tsx)

**Fonctionnalités**:
- **Statistiques personnelles**:
  ```
  ┌───────────────────────────────────────────┐
  │  MES STATISTIQUES                         │
  ├───────────────────────────────────────────┤
  │  📊 Total de mes demandes: 24             │
  │  ⏳ En attente: 5                         │
  │  ✅ Validées: 15                          │
  │  ❌ Rejetées: 2                           │
  │  🔄 À corriger: 2                         │
  └───────────────────────────────────────────┘
  ```

- **Demandes récentes**:
  - Liste des 5 dernières demandes créées
  - Statut en temps réel
  - Lien vers les détails

- **Actions rapides**:
  - ➕ Nouvelle demande
  - 📋 Voir toutes mes demandes
  - ✅ Demandes à valider (si validateur)

- **Notifications**:
  - Demandes validées
  - Demandes rejetées
  - Demandes à corriger
  - Demandes en attente de votre validation

---

### 2. ➕ Nouvelle Demande
**Route**: `/user/demandes/new`
**Fichier**: [frontend/src/pages/user/RequestPage.tsx](frontend/src/pages/user/RequestPage.tsx)

**Processus de création**:

#### Étape 1: Choix du type de demande
```
┌─────────────────────────────────────────────────┐
│  SÉLECTIONNEZ LE TYPE DE DEMANDE                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────┐  ┌───────────────┐         │
│  │  📋 FDM       │  │  💰 BONPOUR   │         │
│  │               │  │               │         │
│  │  Fiche        │  │  Bon Pour     │         │
│  │  Descriptive  │  │               │         │
│  │  de Mission   │  │               │         │
│  └───────────────┘  └───────────────┘         │
│                                                 │
│  ┌───────────────┐  ┌───────────────┐         │
│  │  📊 RFDM      │  │  🛒 DDA       │         │
│  │               │  │               │         │
│  │  Rapport      │  │  Demande      │         │
│  │  Financier    │  │  d'Achat      │         │
│  │  de Mission   │  │               │         │
│  └───────────────┘  └───────────────┘         │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Étape 2: Formulaire selon le type

---

#### 📋 FICHE DESCRIPTIVE DE MISSION (FDM)
**Composant**: [frontend/src/components/requests/FicheDescirptiveDeMissionForm.tsx](frontend/src/components/requests/FicheDescirptiveDeMissionForm.tsx)

**Formulaire**:
```
┌──────────────────────────────────────────────────┐
│  FICHE DESCRIPTIVE DE MISSION                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 INFORMATIONS GÉNÉRALES                       │
│  ────────────────────────────────                │
│  Nom du projet: [_______________________]        │
│                                                  │
│  Lieu de la mission: [_______________________]   │
│                                                  │
│  Date de départ: [__/__/____]                    │
│                                                  │
│  Date probable de retour: [__/__/____]           │
│                                                  │
│  Durée de la mission (jours): [___]              │
│                                                  │
│  Objectif de la mission:                         │
│  ┌────────────────────────────────────────┐     │
│  │                                        │     │
│  │                                        │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  💰 BUDGET ESTIMATIF                             │
│  ────────────────────────────────                │
│  Per diem: [________] FCFA                       │
│  Transport: [________] FCFA                      │
│  Bon essence: [________] FCFA                    │
│  Péage: [________] FCFA                          │
│  Laisser-passer: [________] FCFA                 │
│  Hôtel: [________] FCFA                          │
│  Divers: [________] FCFA                         │
│                                                  │
│  ➡️ Total estimatif: 0 FCFA (calculé auto)      │
│                                                  │
│  📎 PIÈCES JOINTES                               │
│  ────────────────────────────────                │
│  [Ajouter des fichiers...]                       │
│  (Max 5 fichiers, 10 MB chacun)                  │
│  Formats: PDF, DOCX, JPG, PNG                    │
│                                                  │
│  [Annuler]  [Enregistrer brouillon]  [Soumettre]│
│                                                  │
└──────────────────────────────────────────────────┘
```

**Calcul automatique**:
- `totalEstimatif` = perdieme + transport + bonEssence + peage + laisserPasser + hotel + divers

**Après soumission**:
- La demande est créée avec le statut "En attente"
- Envoyée au premier validateur configuré dans le workflow FDM
- L'utilisateur reçoit une confirmation

---

#### 💰 BON POUR
**Fichier**: [frontend/src/components/requests/BonPour.tsx](frontend/src/components/requests/BonPour.tsx)

**Formulaire**:
```
┌──────────────────────────────────────────────────┐
│  BON POUR                                        │
├──────────────────────────────────────────────────┤
│                                                  │
│  Bénéficiaire: [_______________________]         │
│                                                  │
│  Motif:                                          │
│  ┌────────────────────────────────────────┐     │
│  │                                        │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  📋 LIGNES DU BON POUR                           │
│  ────────────────────────────────────            │
│                                                  │
│  Ligne 1:                                        │
│    Libellé: [_______________________]            │
│    Montant: [________] FCFA                      │
│    [➖ Supprimer]                                │
│                                                  │
│  Ligne 2:                                        │
│    Libellé: [_______________________]            │
│    Montant: [________] FCFA                      │
│    [➖ Supprimer]                                │
│                                                  │
│  [➕ Ajouter une ligne]                          │
│                                                  │
│  ➡️ Montant total: 0 FCFA (calculé auto)        │
│                                                  │
│  📎 PIÈCES JOINTES                               │
│  [Ajouter des fichiers...]                       │
│                                                  │
│  [Annuler]  [Enregistrer brouillon]  [Soumettre]│
│                                                  │
└──────────────────────────────────────────────────┘
```

**Calcul automatique**:
- `montantTotal` = somme de tous les montants des lignes

---

#### 📊 RAPPORT FINANCIER DE MISSION (RFDM)
**Fichier**: [frontend/src/components/requests/RapportFinancierDeMission.tsx](frontend/src/components/requests/RapportFinancierDeMission.tsx)

**Formulaire**:
```
┌──────────────────────────────────────────────────┐
│  RAPPORT FINANCIER DE MISSION                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 INFORMATIONS DE LA MISSION                   │
│  ────────────────────────────────────            │
│  Objet: [_______________________]                │
│                                                  │
│  Date de début: [__/__/____]                     │
│                                                  │
│  Date de fin: [__/__/____]                       │
│                                                  │
│  💰 DÉPENSES EFFECTUÉES                          │
│  ────────────────────────────────────            │
│  Hôtel + Déjeuner: [________] FCFA               │
│  Téléphone: [________] FCFA                      │
│  Transport: [________] FCFA                      │
│  Indemnités: [________] FCFA                     │
│  Laisser-passer: [________] FCFA                 │
│  Coûts divers: [________] FCFA                   │
│                                                  │
│  ➡️ Total dépenses: 0 FCFA (calculé auto)       │
│                                                  │
│  💵 RÉCAPITULATIF FINANCIER                      │
│  ────────────────────────────────────            │
│  Montant reçu: [________] FCFA                   │
│  Montant dépensé: [________] FCFA (auto)         │
│  ➡️ Solde: 0 FCFA (calculé auto)                │
│                                                  │
│  💬 Commentaire:                                 │
│  ┌────────────────────────────────────────┐     │
│  │                                        │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  📎 PIÈCES JOINTES (factures, reçus)             │
│  [Ajouter des fichiers...]                       │
│                                                  │
│  [Annuler]  [Enregistrer brouillon]  [Soumettre]│
│                                                  │
└──────────────────────────────────────────────────┘
```

**Calculs automatiques**:
- `totalDepenses` = hotelDejeuner + telephone + transport + indemnites + laisserPasser + coutDivers
- `solde` = montantRecu - montantDepense

---

#### 🛒 DEMANDE D'ACHAT (DDA)
**Fichier**: [frontend/src/components/requests/DemandeAchat.tsx](frontend/src/components/requests/DemandeAchat.tsx)

**Formulaire**:
```
┌──────────────────────────────────────────────────┐
│  DEMANDE D'ACHAT                                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 INFORMATIONS GÉNÉRALES                       │
│  ────────────────────────────────────            │
│  Destination: [_______________________]          │
│                                                  │
│  Fournisseur: [_______________________]          │
│                                                  │
│  Service: [_______________________]              │
│                                                  │
│  Client: [_______________________]               │
│                                                  │
│  Montant du projet: [________] FCFA              │
│                                                  │
│  🛍️ ARTICLES À ACHETER                           │
│  ────────────────────────────────────            │
│                                                  │
│  Article 1:                                      │
│    Désignation: [_______________________]        │
│    Prix unitaire: [________] FCFA                │
│    Quantité: [___]                               │
│    Prix total: 0 FCFA (auto)                     │
│    [➖ Supprimer]                                │
│                                                  │
│  Article 2:                                      │
│    Désignation: [_______________________]        │
│    Prix unitaire: [________] FCFA                │
│    Quantité: [___]                               │
│    Prix total: 0 FCFA (auto)                     │
│    [➖ Supprimer]                                │
│                                                  │
│  [➕ Ajouter un article]                         │
│                                                  │
│  💰 CALCUL FINANCIER                             │
│  ────────────────────────────────────            │
│  Prix total: 0 FCFA (calculé auto)               │
│  Remise: [________] FCFA                         │
│  ➡️ Prix total effectif: 0 FCFA (auto)          │
│                                                  │
│  [☑] Appliquer TVA (18%)                         │
│  TVA: 0 FCFA (auto)                              │
│  ➡️ TTC: 0 FCFA (auto)                           │
│                                                  │
│  📦 LIVRAISON                                    │
│  ────────────────────────────────────            │
│  Délai de livraison: [___] jours                 │
│  Lieu de livraison: [_______________________]    │
│  Condition de paiement: [_______________________]│
│                                                  │
│  💬 Commentaire:                                 │
│  ┌────────────────────────────────────────┐     │
│  │                                        │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  📎 PIÈCES JOINTES                               │
│  ────────────────────────────────────            │
│  Proforma: [Choisir fichier...]                  │
│  Bon de commande: [Choisir fichier...]           │
│  Autres documents: [Ajouter...]                  │
│                                                  │
│  [Annuler]  [Enregistrer brouillon]  [Soumettre]│
│                                                  │
└──────────────────────────────────────────────────┘
```

**Calculs automatiques**:
```javascript
prixTotal = somme(lignes[].prixUnitaire × quantite)
prixTotalEffectif = prixTotal - remise
tva = prixTotalEffectif × 0.18 (si appliquerTva est coché)
ttc = prixTotalEffectif + tva
```

**Workflow spécifique DDA**:
1. Création de la demande
2. Validation par les validateurs configurés
3. Une fois validée:
   - Générer le bon de commande
   - Confirmer la commande
   - Marquer comme réglée

---

### 3. 📋 Mes Demandes
**Route**: `/user/demandes`
**Fichier**: [frontend/src/pages/user/DemandesPage.tsx](frontend/src/pages/user/DemandesPage.tsx)

**Interface avec onglets**:
```
┌──────────────────────────────────────────────────┐
│  MES DEMANDES                                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  [📋 FDM] [💰 BONPOUR] [📊 RFDM] [🛒 DDA]      │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  LISTE DES DEMANDES (Type sélectionné)    │ │
│  ├────────────────────────────────────────────┤ │
│  │                                            │ │
│  │  Référence: FDM-2024-001                   │ │
│  │  Date: 15/12/2024                          │ │
│  │  Statut: ⏳ En attente                     │ │
│  │  Validateur actuel: Jean Dupont            │ │
│  │  [Voir détails]                            │ │
│  │  ─────────────────────────────────────     │ │
│  │                                            │ │
│  │  Référence: FDM-2024-002                   │ │
│  │  Date: 10/12/2024                          │ │
│  │  Statut: ✅ Validée                        │ │
│  │  [Voir détails]                            │ │
│  │  ─────────────────────────────────────     │ │
│  │                                            │ │
│  │  Référence: FDM-2024-003                   │ │
│  │  Date: 05/12/2024                          │ │
│  │  Statut: 🔄 À corriger                     │ │
│  │  Commentaire: Veuillez préciser...         │ │
│  │  [Modifier] [Voir détails]                 │ │
│  │  ─────────────────────────────────────     │ │
│  │                                            │ │
│  │  Référence: FDM-2024-004                   │ │
│  │  Date: 01/12/2024                          │ │
│  │  Statut: ❌ Rejetée                        │ │
│  │  Commentaire: Budget non disponible        │ │
│  │  [Voir détails]                            │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [📥 Exporter]  [🔄 Rafraîchir]                │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Fonctionnalités**:

#### 3.1 Filtres
- Par statut: En attente, Validée, Rejetée, À corriger
- Par période: Dernière semaine, Dernier mois, Période personnalisée
- Par montant (pour DDA, BONPOUR)
- Par état de règlement: Réglé / Non réglé

#### 3.2 Actions selon le statut

**En attente**:
- 👁️ Voir les détails
- ❌ Annuler la demande (avant validation)

**À corriger**:
- ✏️ Modifier la demande
- 👁️ Voir les commentaires du validateur
- 📤 Resoumettre après correction

**Validée**:
- 👁️ Voir les détails
- 📄 Télécharger le PDF
- 📊 Voir l'historique de validation

**Rejetée**:
- 👁️ Voir les détails
- 💬 Voir la raison du rejet
- 🔄 Créer une nouvelle demande similaire

#### 3.3 Détails d'une demande
**Modal/Page de détails**:
```
┌──────────────────────────────────────────────────┐
│  DÉTAILS DE LA DEMANDE                           │
│  Référence: FDM-2024-001                         │
├──────────────────────────────────────────────────┤
│                                                  │
│  📌 INFORMATIONS                                 │
│  ────────────────────────────────────            │
│  Type: Fiche Descriptive de Mission             │
│  Date d'émission: 15/12/2024                     │
│  Émis par: Marie Leblanc                         │
│  Statut: ⏳ En attente de validation             │
│  Validateur actuel: Jean Dupont (Chef Service)  │
│                                                  │
│  📝 CONTENU                                      │
│  ────────────────────────────────────            │
│  [Affichage de tous les champs de la demande]   │
│                                                  │
│  ✅ HISTORIQUE DE VALIDATION                     │
│  ────────────────────────────────────            │
│  ✓ Créée le 15/12/2024 par Marie Leblanc        │
│  → En attente de Jean Dupont (Ordre 1)          │
│                                                  │
│  📎 PIÈCES JOINTES                               │
│  ────────────────────────────────────            │
│  📄 document1.pdf (2.3 MB)  [Télécharger]       │
│  📄 facture.pdf (1.1 MB)    [Télécharger]       │
│                                                  │
│  [Fermer]                                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### 4. ✅ À Valider (Si Validateur)
**Route**: `/user/validations`
**Fichier**: [frontend/src/pages/user/ValidationPage.tsx](frontend/src/pages/user/ValidationPage.tsx)

**Condition d'accès**:
- L'utilisateur doit être configuré comme validateur dans au moins un workflow
- N'apparaît dans le menu que si l'utilisateur est validateur

**Interface**:
```
┌──────────────────────────────────────────────────┐
│  DEMANDES À VALIDER                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Toutes] [📋 FDM] [💰 BONPOUR] [📊 RFDM] [🛒 DDA]│
│                                                  │
│  🔔 Vous avez 3 demandes en attente              │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Référence: FDM-2024-005                   │ │
│  │  Type: Fiche Descriptive de Mission        │ │
│  │  Émis par: Paul Martin                     │ │
│  │  Date: 16/12/2024                          │ │
│  │  Montant: 250,000 FCFA                     │ │
│  │  Ordre de validation: 2/3                  │ │
│  │  [Traiter]                                 │ │
│  │  ─────────────────────────────────────     │ │
│  │                                            │ │
│  │  Référence: DDA-2024-012                   │ │
│  │  Type: Demande d'Achat                     │ │
│  │  Émis par: Sophie Bernard                  │ │
│  │  Date: 15/12/2024                          │ │
│  │  Montant: 1,500,000 FCFA                   │ │
│  │  Ordre de validation: 1/3                  │ │
│  │  [Traiter]                                 │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Process de validation**:
1. Cliquer sur [Traiter]
2. Modal de détails s'ouvre avec toutes les informations
3. Prendre une décision:
   - ✅ Valider
   - ❌ Rejeter
   - 🔄 Demander correction
4. Ajouter un commentaire (obligatoire si rejet/correction)
5. Soumettre

**Après validation**:
- Si **Validée**: passe au validateur suivant (ordre+1) ou statut final "Validée"
- Si **Rejetée**: statut "Rejetée", retourne à l'émetteur
- Si **À corriger**: retourne à l'émetteur pour modifications

---

## ⚙️ WORKFLOWS ET PROCESSUS

### Cycle de Vie d'une Demande

```
┌────────────────────────────────────────────────────────┐
│  CYCLE DE VIE D'UNE DEMANDE                            │
└────────────────────────────────────────────────────────┘

1️⃣  CRÉATION
    │
    │  Utilisateur crée une demande (FDM, BONPOUR, etc.)
    │  Statut: "En attente"
    │  Assignée au Validateur 1 (ordre 1)
    │
    ▼

2️⃣  VALIDATION NIVEAU 1
    │
    │  Validateur 1 examine la demande
    │
    ├─── ✅ VALIDE ──────────────────────────┐
    │                                        │
    ├─── ❌ REJETTE ────► FIN (Rejetée) ────┘
    │
    ├─── 🔄 À CORRIGER ──► Retour Émetteur
    │                          │
    │                          │ Corrections
    │                          │
    │                          ▼
    │                      Resoumission
    │                          │
    │◄─────────────────────────┘
    │
    ▼

3️⃣  VALIDATION NIVEAU 2
    │
    │  Validateur 2 examine la demande
    │
    ├─── ✅ VALIDE ──────────────────────────┐
    │                                        │
    ├─── ❌ REJETTE ────► FIN (Rejetée) ────┘
    │
    ├─── 🔄 À CORRIGER ──► Retour Émetteur
    │
    ▼

4️⃣  VALIDATION NIVEAU 3 (Si configuré)
    │
    │  Validateur 3 (final) examine
    │
    ├─── ✅ VALIDE ──────────────────────────┐
    │                                        │
    ├─── ❌ REJETTE ────► FIN (Rejetée) ────┘
    │                                        │
    │                                        │
    ▼                                        │
                                            │
5️⃣  VALIDÉE (FINALE)                        │
    │                                        │
    │  Statut: "Validée"                    │
    │  Tous les validateurs ont approuvé    │
    │                                        │
    ▼                                        │
                                            │
6️⃣  POST-VALIDATION (selon le type)         │
    │                                        │
    ├─ FDM: Missions réalisées              │
    │  └─ Règlement financier               │
    │                                        │
    ├─ DDA: Génération bon de commande      │
    │  ├─ Confirmation commande             │
    │  └─ Règlement fournisseur             │
    │                                        │
    ├─ BONPOUR: Règlement                   │
    │                                        │
    └─ RFDM: Archivage                      │
                                            │
                                            ▼

7️⃣  CLÔTURÉE
```

### Exemple Concret: Workflow FDM

**Configuration du workflow FDM**:
```
Type: Fiche Descriptive de Mission
Validateur 1 (ordre 1): Chef de Service
Validateur 2 (ordre 2): Chef de Département
Validateur 3 (ordre 3): Directeur Général
```

**Scénario**:

**Jour 1 - 10h00**: Marie (Employée) crée une FDM
- Projet: Mission à Lomé
- Durée: 3 jours
- Budget: 250,000 FCFA
- Statut: En attente
- Assignée à: Jean Dupont (Chef de Service)

**Jour 1 - 14h00**: Jean Dupont valide
- Décision: ✅ Valider
- Commentaire: "Budget acceptable"
- Nouvelle assignation: Sophie Bernard (Chef de Département)

**Jour 2 - 9h00**: Sophie Bernard demande correction
- Décision: 🔄 À corriger
- Commentaire: "Veuillez détailler les frais de transport"
- Retour à: Marie (Émettrice)

**Jour 2 - 11h00**: Marie corrige et resoumet
- Ajout de détails sur le transport
- Statut: En attente
- Assignée à: Sophie Bernard (reprise validation niveau 2)

**Jour 2 - 15h00**: Sophie Bernard valide
- Décision: ✅ Valider
- Commentaire: "Détails suffisants"
- Nouvelle assignation: Paul Martin (Directeur Général)

**Jour 3 - 10h00**: Paul Martin valide
- Décision: ✅ Valider
- Commentaire: "Approuvé"
- Statut final: **VALIDÉE**

**Résultat**:
- Marie reçoit une notification: "Votre FDM-2024-001 a été validée"
- La mission peut être planifiée
- Après la mission, Marie soumettra un RFDM

---

## 📊 SCHÉMAS DE NAVIGATION

### Carte de Navigation Complète

```
┌──────────────────────────────────────────────────────┐
│                    PLATEFORME                        │
└──────────────────────────────────────────────────────┘
                        │
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   ┌─────────┐                   ┌──────────┐
   │  ADMIN  │                   │   USER   │
   └─────────┘                   └──────────┘
        │                               │
        │                               │
        ├─ Dashboard                    ├─ Dashboard
        │  └─ Statistiques              │  └─ Mes stats
        │                               │
        ├─ Validation                   ├─ Nouvelle Demande
        │  ├─ FDM                       │  ├─ FDM
        │  ├─ BONPOUR                   │  ├─ BONPOUR
        │  ├─ RFDM                      │  ├─ RFDM
        │  └─ DDA                       │  └─ DDA
        │                               │
        ├─ Workflows                    ├─ Mes Demandes
        │  ├─ Créer workflow            │  ├─ FDM
        │  ├─ Configurer validateurs    │  ├─ BONPOUR
        │  └─ Gérer processus           │  ├─ RFDM
        │                               │  └─ DDA
        ├─ Utilisateurs                 │
        │  ├─ Liste                     └─ À Valider (si validateur)
        │  ├─ Créer                        ├─ FDM
        │  ├─ Modifier                     ├─ BONPOUR
        │  └─ Désactiver                   ├─ RFDM
        │                                  └─ DDA
        ├─ Départements
        │  ├─ Subdivisions
        │  │  ├─ Liste
        │  │  ├─ Créer
        │  │  └─ Modifier
        │  │
        │  ├─ Types Subdivision
        │  │  ├─ Liste
        │  │  ├─ Créer
        │  │  └─ Modifier
        │  │
        │  └─ Postes
        │     ├─ Liste
        │     ├─ Créer
        │     └─ Modifier
        │
        └─ Statistiques
           ├─ Graphiques
           ├─ Rapports
           └─ Exports
```

---

### Matrice des Permissions

```
┌────────────────────────────────────────────────────────────┐
│  FONCTIONNALITÉ              │  ADMIN  │  USER  │  VALIDATEUR│
├────────────────────────────────────────────────────────────┤
│  Voir tableau de bord        │   ✅    │   ✅   │     ✅     │
│  Créer une demande           │   ✅    │   ✅   │     ✅     │
│  Voir ses propres demandes   │   ✅    │   ✅   │     ✅     │
│  Voir toutes les demandes    │   ✅    │   ❌   │     ❌     │
│  Modifier une demande        │   ✅    │   ✅*  │     ❌     │
│  Supprimer une demande       │   ✅    │   ✅*  │     ❌     │
│  Valider une demande         │   ✅    │   ❌   │     ✅**   │
│  Créer un utilisateur        │   ✅    │   ❌   │     ❌     │
│  Modifier un utilisateur     │   ✅    │   ❌   │     ❌     │
│  Créer un workflow           │   ✅    │   ❌   │     ❌     │
│  Configurer validateurs      │   ✅    │   ❌   │     ❌     │
│  Gérer subdivisions          │   ✅    │   ❌   │     ❌     │
│  Gérer postes                │   ✅    │   ❌   │     ❌     │
│  Voir statistiques globales  │   ✅    │   ❌   │     ❌     │
│  Exporter données            │   ✅    │   ✅*  │     ✅*    │
└────────────────────────────────────────────────────────────┘

* Uniquement ses propres données
** Uniquement les demandes où il est configuré comme validateur
```

---

## 🔑 POINTS CLÉS

### Pour les Administrateurs
1. **Configuration initiale obligatoire**:
   - Créer les types de subdivisions
   - Créer les subdivisions
   - Créer les postes
   - Créer les utilisateurs
   - Configurer les workflows pour chaque type de demande

2. **Gestion continue**:
   - Validation des demandes (si configuré comme validateur)
   - Ajout/modification d'utilisateurs
   - Ajustement des workflows selon les besoins
   - Consultation des statistiques
   - Gestion des structures organisationnelles

### Pour les Utilisateurs
1. **Workflow simple**:
   - Se connecter
   - Créer une demande
   - Suivre le statut
   - Corriger si nécessaire
   - Consulter l'historique

2. **Si validateur**:
   - Recevoir les notifications
   - Examiner les demandes assignées
   - Prendre des décisions rapides
   - Ajouter des commentaires pertinents

---

## 📱 NAVIGATION MOBILE (Responsive)

Le design est responsive et s'adapte aux écrans mobiles:

```
Mobile (< 768px):
┌───────────────────┐
│ ☰  PLATEFORME   👤│
├───────────────────┤
│                   │
│  [Contenu]        │
│                   │
│                   │
└───────────────────┘

Menu hamburger (☰) ouvre la sidebar
```

---

## 🎨 CODES COULEURS ET STATUTS

### Statuts des Demandes
- 🟡 **En attente**: Jaune - Demande créée, en cours de validation
- 🟢 **Validée**: Vert - Tous les validateurs ont approuvé
- 🔴 **Rejetée**: Rouge - Demande refusée
- 🔵 **À corriger**: Bleu - Modifications demandées

### État Financier
- 💚 **Réglé**: Paiement effectué
- 🔶 **Non réglé**: En attente de paiement

---

## 📞 SUPPORT ET AIDE

### Aide Contextuelle
Chaque page dispose d'une aide contextuelle (icône ? ou "Aide"):
- Explications des champs
- Exemples de saisie
- FAQ

### Documentation
- Guide utilisateur (USER)
- Guide administrateur (ADMIN)
- Guide de configuration des workflows

---

## 🚀 RACCOURCIS CLAVIER (À implémenter)

### Globaux
- `Ctrl + N`: Nouvelle demande
- `Ctrl + D`: Dashboard
- `Ctrl + M`: Mes demandes
- `Ctrl + V`: Validations (si validateur)

### Admin
- `Ctrl + U`: Utilisateurs
- `Ctrl + W`: Workflows
- `Ctrl + S`: Statistiques

---

## 📋 RÉSUMÉ DES ROUTES

### Routes Admin
```
/admin                      → Dashboard Admin
/admin/validations          → Validation des demandes
/admin/workflows            → Configuration workflows
/admin/users                → Gestion utilisateurs
/admin/subdivisions         → Gestion subdivisions
/admin/type-subdivisions    → Types de subdivisions
/admin/postes               → Gestion postes
/admin/statistiques         → Statistiques globales
```

### Routes User
```
/user                       → Dashboard Utilisateur
/user/demandes              → Mes demandes (tous types)
/user/demandes/new          → Nouvelle demande
/user/validations           → Demandes à valider
```

### Routes Demandes (API)
```
/api/fdms                   → Fiches Descriptives Mission
/api/bonPours               → Bons Pour
/api/rapportFinanciers      → Rapports Financiers
/api/ddas                   → Demandes d'Achat
/api/validateurs            → Configuration validateurs
```

---

## 🎯 BONNES PRATIQUES

### Pour les Administrateurs
1. Configurer tous les workflows avant la mise en production
2. Tester chaque workflow avec des données fictives
3. Former les validateurs à leurs responsabilités
4. Réviser régulièrement les permissions
5. Surveiller les demandes en retard

### Pour les Utilisateurs
1. Remplir tous les champs obligatoires
2. Joindre les pièces justificatives
3. Vérifier les montants avant soumission
4. Corriger rapidement les demandes retournées
5. Consulter régulièrement le statut

### Pour les Validateurs
1. Traiter les demandes dans les 48h
2. Fournir des commentaires constructifs
3. Vérifier la cohérence des montants
4. S'assurer de la disponibilité budgétaire
5. Maintenir la traçabilité

---

## 📚 FICHIERS DE RÉFÉRENCE

### Frontend
- **Layouts**: [frontend/src/components/layout/](frontend/src/components/layout/)
- **Pages Admin**: [frontend/src/pages/admin/](frontend/src/pages/admin/)
- **Pages User**: [frontend/src/pages/user/](frontend/src/pages/user/)
- **Types**: [frontend/src/types/](frontend/src/types/)
- **API**: [frontend/src/api/](frontend/src/api/)

### Backend
- **Controllers**: [backend/src/main/java/tg/idstechnologie/plateforme/controller/](backend/src/main/java/tg/idstechnologie/plateforme/controller/)
- **Models**: [backend/src/main/java/tg/idstechnologie/plateforme/models/](backend/src/main/java/tg/idstechnologie/plateforme/models/)
- **Services**: [backend/src/main/java/tg/idstechnologie/plateforme/services/](backend/src/main/java/tg/idstechnologie/plateforme/services/)
- **Security**: [backend/src/main/java/tg/idstechnologie/plateforme/secu/](backend/src/main/java/tg/idstechnologie/plateforme/secu/)

---

**Document créé le**: 2024-12-04
**Version**: 1.0
**Plateforme**: Système de Gestion de Demandes - IDS Technologies
