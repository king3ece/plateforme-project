# Guide de Test - FDM et DEAC

## 🧪 Guide pour tester les nouvelles fonctionnalités

---

## I. TESTS BACKEND

### 🔍 1. Test des calculs automatiques FDM

**Endpoint:** `POST /api/fdms/add-fdm`

**Payload de test:**
```json
{
  "nomProjet": "Mission Test Automatique",
  "lieuMission": "Lomé",
  "dateDepart": "2025-12-01",
  "dateProbableRetour": "2025-12-05",
  "objectifMission": "Tester les calculs automatiques",
  "perdieme": 50000,
  "transport": 25000,
  "bonEssence": 15000,
  "peage": 5000,
  "laisserPasser": 3000,
  "hotel": 40000,
  "divers": 2000
}
```

**Résultat attendu:**
- ✅ `dureeMission` = 4 jours (calculé automatiquement)
- ✅ `totalEstimatif` = 140000 (somme incluant bonEssence)
- ✅ `validateurSuivant` assigné automatiquement
- ✅ Email envoyé au premier validateur

**Vérification:**
```bash
# Récupérer la FDM créée
GET /api/fdms/{reference}

# Vérifier que totalEstimatif = 140000
```

---

### 🔍 2. Test de l'auto-validation FDM

**Prérequis:**
- L'utilisateur connecté doit être configuré comme premier validateur pour FDM

**Endpoint:** `POST /api/fdms/add-fdm`

**Payload:** (même que ci-dessus)

**Résultat attendu:**
- ✅ Un `TraitementFicheDescriptiveMission` créé automatiquement
- ✅ `decision` = "VALIDER"
- ✅ `commentaire` = "Auto-validation (émetteur = premier validateur)"
- ✅ `validateurSuivant` = deuxième validateur (si existe)
- ✅ OU `traite` = true, `favorable` = true (si pas de validateur suivant)
- ✅ Email approprié envoyé

**Vérification:**
```bash
# Vérifier le traitement
GET /api/fdms/{reference}

# Vérifier traitementPrecedent
# Vérifier validateurSuivant ou statut traite
```

---

### 🔍 3. Test des calculs automatiques DEAC

**Endpoint:** `POST /api/ddas/add-dda`

**Payload de test:**
```json
{
  "destination": "Stock IDS",
  "fournisseur": "Fournisseur Test",
  "service": "IT",
  "client": "IDS Technologies",
  "montantProjet": 500000,
  "remise": 20000,
  "appliquerTva": true,
  "delaiLivraison": "2 semaines",
  "lieuLivraison": "Lomé, Togo",
  "conditionPaiement": "30 jours net",
  "commentaire": "Test calculs automatiques",
  "lignes": [
    {
      "designation": "Ordinateur portable",
      "ligneReference": "PC-001",
      "prixUnitaire": 350000,
      "quantite": 2
    },
    {
      "designation": "Écran 24 pouces",
      "ligneReference": "MON-001",
      "prixUnitaire": 80000,
      "quantite": 3
    }
  ]
}
```

**Calculs attendus:**
1. Ligne 1: `prixTotal` = 350000 × 2 = 700000
2. Ligne 2: `prixTotal` = 80000 × 3 = 240000
3. Demande: `prixTotal` = 700000 + 240000 = 940000
4. Demande: `prixTotalEffectif` = 940000 - 20000 = 920000
5. Demande: `tva` = 920000 × 0.18 = 165600
6. Demande: `ttc` = 920000 + 165600 = 1085600

**Vérification:**
```bash
GET /api/ddas/{reference}

# Vérifier tous les montants calculés
```

---

### 🔍 4. Test sans TVA DEAC

**Payload:** (même que ci-dessus mais avec `"appliquerTva": false`)

**Résultat attendu:**
- ✅ `tva` = 0
- ✅ `ttc` = `prixTotalEffectif` = 920000

---

### 🔍 5. Test génération bon de commande

**Prérequis:**
- Une demande d'achat doit être approuvée (`traite` = true, `favorable` = true)

**Endpoint:** `POST /api/ddas/{id}/generer-bon-commande`

**Résultat attendu:**
- ✅ `fichierBonCommande` renseigné avec un nom de fichier
- ✅ Status 200 OK
- ✅ Message: "Bon de commande généré avec succès"

**Vérification:**
```bash
GET /api/ddas/{reference}

# Vérifier que fichierBonCommande != null
```

---

### 🔍 6. Test confirmation commande

**Prérequis:**
- Une demande d'achat doit être approuvée

**Endpoint:** `POST /api/ddas/{id}/confirmer-commande`

**Payload:**
```json
{
  "commander": true
}
```

**Résultat attendu:**
- ✅ `commander` = true
- ✅ Status 200 OK

**Vérification:**
```bash
GET /api/ddas/{reference}

# Vérifier que commander = true
```

---

## II. TESTS FRONTEND

### 🎨 1. Test API Service FDM

**Fichier de test:** `frontend/src/api/__tests__/fdm.test.ts`

```typescript
import { FicheDescriptiveMissionAPI } from '../fdm';

describe('FicheDescriptiveMissionAPI', () => {
  test('Créer une FDM calcule automatiquement le total', async () => {
    const fdm = await FicheDescriptiveMissionAPI.create({
      nomProjet: "Test",
      lieuMission: "Lomé",
      dateDepart: "2025-12-01",
      dateProbableRetour: "2025-12-05",
      objectifMission: "Test",
      perdieme: 50000,
      transport: 25000,
      bonEssence: 15000,
      peage: 5000,
      laisserPasser: 3000,
      hotel: 40000,
      divers: 2000,
      dureeMission: 4
    });

    expect(fdm.totalEstimatif).toBe(140000);
    expect(fdm.dureeMission).toBe(4);
  });
});
```

---

### 🎨 2. Test API Service DEAC

**Créer:** `frontend/src/api/__tests__/demandeAchat.test.ts`

```typescript
import { DemandeAchatAPI } from '../demandeAchat';

describe('DemandeAchatAPI', () => {
  test('Créer une DEAC calcule automatiquement TVA et TTC', async () => {
    const deac = await DemandeAchatAPI.create({
      destination: "Stock",
      fournisseur: "Test",
      service: "IT",
      client: "IDS",
      remise: 20000,
      appliquerTva: true,
      lignes: [
        {
          designation: "PC",
          prixUnitaire: 350000,
          quantite: 2
        }
      ]
    });

    expect(deac.prixTotal).toBe(700000);
    expect(deac.prixTotalEffectif).toBe(680000);
    expect(deac.tva).toBe(122400);
    expect(deac.ttc).toBe(802400);
  });

  test('Générer bon de commande pour demande approuvée', async () => {
    await DemandeAchatAPI.genererBonCommande(1);
    const deac = await DemandeAchatAPI.getByRef("ref-123");

    expect(deac.fichierBonCommande).toBeTruthy();
  });
});
```

---

## III. SCÉNARIOS DE TEST COMPLETS

### 📋 Scénario 1: FDM avec auto-validation

1. **Créer un validateur:**
   - User ID: 1
   - Type processus: FDM
   - Ordre: 1

2. **Se connecter avec cet utilisateur**

3. **Créer une FDM:**
   ```bash
   POST /api/fdms/add-fdm
   ```

4. **Vérifier:**
   - Traitement auto-créé ✓
   - Validateur suivant assigné ✓
   - Statut approprié ✓

---

### 📋 Scénario 2: DEAC complète avec TVA

1. **Créer une DEAC:**
   ```bash
   POST /api/ddas/add-dda
   # Avec appliquerTva: true
   ```

2. **Vérifier les calculs:**
   - Prix total ligne ✓
   - Prix total demande ✓
   - Prix effectif ✓
   - TVA (18%) ✓
   - TTC ✓

3. **Faire valider la demande:**
   ```bash
   POST /api/ddas/{id}/traiter
   {
     "decision": "VALIDER",
     "commentaire": "OK"
   }
   ```

4. **Répéter jusqu'à approbation finale**

5. **Générer bon de commande:**
   ```bash
   POST /api/ddas/{id}/generer-bon-commande
   ```

6. **Confirmer la commande:**
   ```bash
   POST /api/ddas/{id}/confirmer-commande
   { "commander": true }
   ```

---

### 📋 Scénario 3: Modification FDM avec recalcul

1. **Créer une FDM**

2. **Modifier les montants:**
   ```bash
   PUT /api/fdms
   {
     "reference": "ref-fdm",
     "perdieme": 60000,  // Changé
     "transport": 30000  // Changé
   }
   ```

3. **Vérifier:**
   - totalEstimatif recalculé automatiquement ✓
   - Nouveau total = ancien total - anciens montants + nouveaux montants ✓

---

## IV. TESTS DE VALIDATION

### ❌ Tests d'erreur FDM

```bash
# Date retour avant date départ
POST /api/fdms/add-fdm
{
  "dateDepart": "2025-12-05",
  "dateProbableRetour": "2025-12-01"  // Erreur
}
# Attendu: HTTP 400 "Date erreur"

# Montant négatif
POST /api/fdms/add-fdm
{
  "perdieme": -1000  // Erreur
}
# Attendu: HTTP 400 "Perdieme Obligatoire"
```

---

### ❌ Tests d'erreur DEAC

```bash
# Aucune ligne d'achat
POST /api/ddas/add-dda
{
  "lignes": []  // Erreur
}
# Attendu: HTTP 400 "Au moins une ligne d'achat est obligatoire"

# Quantité invalide
POST /api/ddas/add-dda
{
  "lignes": [
    {
      "quantite": 0  // Erreur
    }
  ]
}
# Attendu: HTTP 400 "Quantité invalide"

# Générer bon de commande pour demande non approuvée
POST /api/ddas/1/generer-bon-commande
# Si demande non approuvée
# Attendu: HTTP 400 "La demande doit être approuvée"
```

---

## V. CHECKLIST DE TEST

### Backend FDM
- [ ] Calcul automatique totalEstimatif
- [ ] Inclusion de bonEssence dans le calcul
- [ ] Calcul automatique dureeMission
- [ ] Auto-validation si émetteur = premier validateur
- [ ] Traitement automatique créé
- [ ] Email envoyé au validateur suivant
- [ ] Mise à jour avec recalcul automatique
- [ ] Validation des dates (retour > départ)
- [ ] Validation des montants positifs

### Backend DEAC
- [ ] Calcul automatique prixTotal par ligne
- [ ] Calcul automatique prixTotal global
- [ ] Calcul automatique prixTotalEffectif (après remise)
- [ ] Calcul automatique TVA (18%)
- [ ] Calcul automatique TTC
- [ ] TVA = 0 si appliquerTva = false
- [ ] Auto-validation si émetteur = premier validateur
- [ ] Génération bon de commande (demande approuvée uniquement)
- [ ] Confirmation commande
- [ ] Au moins une ligne obligatoire
- [ ] Validation quantité > 0
- [ ] Validation prix unitaire >= 0

### Frontend
- [ ] API FDM - toutes les méthodes
- [ ] API DEAC - toutes les méthodes
- [ ] Types TypeScript à jour
- [ ] Pas d'erreur de compilation
- [ ] Tests unitaires API passent

---

## VI. OUTILS DE TEST

### Postman Collection

Créer une collection Postman avec les requêtes suivantes:

```
Plateforme IDS - Tests
│
├── FDM
│   ├── Créer FDM (calculs auto)
│   ├── Créer FDM (auto-validation)
│   ├── Modifier FDM
│   ├── Lister mes FDM
│   ├── Lister FDM à valider
│   ├── Traiter FDM
│   └── Supprimer FDM
│
└── DEAC
    ├── Créer DEAC (avec TVA)
    ├── Créer DEAC (sans TVA)
    ├── Modifier DEAC
    ├── Lister mes DEAC
    ├── Lister DEAC à valider
    ├── Traiter DEAC
    ├── Générer bon commande
    ├── Confirmer commande
    └── Supprimer DEAC
```

### Variables d'environnement Postman

```json
{
  "baseUrl": "http://localhost:8080/api",
  "token": "{{JWT_TOKEN}}",
  "fdmRef": "",
  "deacRef": "",
  "userId": ""
}
```

---

**Document généré le:** 2025-11-29
**Version:** 1.0
