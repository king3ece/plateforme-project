# TODO - Prochaines Étapes

## 📝 Fonctionnalités restantes à implémenter

---

## 🔴 PRIORITÉ HAUTE (Critiques)

### 1. Gestion des Pièces Jointes

#### Backend
- [ ] **Créer entité PieceJointe**
  ```java
  @Entity
  public class PieceJointe {
      @Id
      private Long id;
      private String nomFichier;
      private String cheminFichier;
      private String typeFichier;
      private Long tailleFichier;
      private LocalDateTime dateUpload;

      @ManyToOne
      private FicheDescriptiveMission fdm;

      @ManyToOne
      private DemandeDachat deac;
  }
  ```

- [ ] **Endpoints upload/download**
  ```java
  POST /api/fdms/{id}/pieces-jointes
  GET /api/fdms/{id}/pieces-jointes
  GET /api/fdms/{id}/pieces-jointes/{fichier}/download
  DELETE /api/fdms/{id}/pieces-jointes/{fichier}

  POST /api/ddas/{id}/pieces-jointes
  GET /api/ddas/{id}/pieces-jointes
  GET /api/ddas/{id}/pieces-jointes/{fichier}/download
  DELETE /api/ddas/{id}/pieces-jointes/{fichier}
  ```

- [ ] **Validation fichiers**
  - Types autorisés: PDF, JPG, PNG, DOCX
  - Taille maximale: 5 MB
  - Scan antivirus (optionnel)

#### Frontend
- [ ] **Composant FileUpload**
  - Drag & drop
  - Preview des fichiers
  - Barre de progression
  - Liste des fichiers uploadés
  - Bouton suppression

- [ ] **Intégration dans formulaires**
  - FdmForm: section pièces jointes
  - DeacForm: section pièces jointes

---

### 2. Génération PDF

#### Backend - Bibliothèque iText

- [ ] **Service PdfService**
  ```java
  public interface PdfService {
      byte[] genererPdfFDM(Long fdmId);
      byte[] genererPdfDEAC(Long deacId);
      byte[] genererBonCommande(Long deacId);
  }
  ```

- [ ] **Template PDF FDM**
  - Logo IDS en en-tête
  - Informations mission
  - Tableau des frais
  - Total estimatif
  - Signatures des validateurs
  - Footer avec date génération

- [ ] **Template PDF DEAC**
  - Logo IDS
  - Informations fournisseur/client
  - Tableau des lignes d'achat
  - Calculs (Total, Remise, TVA, TTC)
  - Conditions de paiement
  - Signatures

- [ ] **Template Bon de Commande**
  - Même structure que DEAC
  - Numéro de bon de commande unique
  - Date de livraison souhaitée
  - Lieu de livraison

#### Endpoints
```java
GET /api/fdms/{id}/pdf
GET /api/ddas/{id}/pdf
GET /api/ddas/{id}/bon-commande/pdf
```

#### Frontend
- [ ] **Bouton "Télécharger PDF"**
  - Dans FdmDetail
  - Dans DeacDetail
  - Génération et téléchargement automatique

---

### 3. Notifications Email Améliorées

- [ ] **Templates HTML Email**
  ```html
  <!-- Email nouvelle FDM -->
  <template name="nouvelle-fdm">
    <h2>Nouvelle Fiche Descriptive de Mission</h2>
    <p>Bonjour {{validateur}},</p>
    <p>Une nouvelle FDM nécessite votre validation :</p>
    <ul>
      <li>Projet: {{nomProjet}}</li>
      <li>Émetteur: {{emetteur}}</li>
      <li>Lieu: {{lieu}}</li>
      <li>Dates: {{dates}}</li>
    </ul>
    <a href="{{lien}}">Voir la demande</a>
  </template>
  ```

- [ ] **Emails à créer:**
  - Email nouvelle FDM/DEAC
  - Email validation approuvée
  - Email validation rejetée
  - Email demande à corriger
  - Email demande finalisée

- [ ] **Configuration SMTP**
  - Vérifier `application.properties`
  - Tester envoi emails
  - Gestion erreurs SMTP

---

## 🟡 PRIORITÉ MOYENNE (Importantes)

### 4. Interface Utilisateur Frontend

#### Composants FDM

- [ ] **FdmForm.tsx**
  ```tsx
  Features:
  - React Hook Form + Zod validation
  - Calcul temps réel totalEstimatif
  - Sélection dates avec date picker
  - Validation date retour > date départ
  - Upload pièces jointes
  - Bouton "Soumettre"
  ```

- [ ] **FdmList.tsx**
  ```tsx
  Features:
  - Tableau avec pagination
  - Filtres (statut, date, émetteur)
  - Recherche par projet/lieu
  - Actions (voir, modifier, supprimer)
  - Badge statut (en cours, validée, rejetée)
  ```

- [ ] **FdmDetail.tsx**
  ```tsx
  Features:
  - Affichage complet de la FDM
  - Timeline des validations
  - Commentaires des validateurs
  - Pièces jointes
  - Bouton "Télécharger PDF"
  - Actions selon le rôle
  ```

- [ ] **FdmTraitement.tsx**
  ```tsx
  Features:
  - Radio buttons (Valider/Rejeter/Corriger)
  - Champ commentaire obligatoire si rejet/correction
  - Confirmation avant envoi
  - Toast de succès/erreur
  ```

#### Composants DEAC

- [ ] **DeacForm.tsx**
  ```tsx
  Features:
  - Gestion dynamique lignes d'achat
  - Boutons +/- pour ajouter/supprimer lignes
  - Calcul automatique prixTotal par ligne
  - Calcul temps réel prixTotal global
  - Checkbox "Appliquer TVA"
  - Affichage TVA et TTC
  - Champ remise avec recalcul
  - Upload fichier proforma
  ```

- [ ] **DeacList.tsx**
  ```tsx
  Features:
  - Tableau avec lignes expandables
  - Voir détails lignes d'achat
  - Filtres et recherche
  - Badge statut commande
  - Actions contextuelles
  ```

- [ ] **DeacDetail.tsx**
  ```tsx
  Features:
  - Informations générales
  - Tableau des lignes
  - Calculs détaillés (Total, Remise, TVA, TTC)
  - Timeline validations
  - Bouton "Générer bon de commande"
  - Bouton "Confirmer commande"
  ```

- [ ] **BonCommandeGeneration.tsx**
  ```tsx
  Features:
  - Recap de la demande
  - Bouton génération PDF
  - Téléchargement automatique
  - Historique bons de commande
  ```

#### Pages

- [ ] **FdmListPage.tsx** - Route: `/fdm`
- [ ] **FdmCreatePage.tsx** - Route: `/fdm/nouveau`
- [ ] **FdmDetailPage.tsx** - Route: `/fdm/:ref`
- [ ] **FdmEditPage.tsx** - Route: `/fdm/:ref/modifier`
- [ ] **DeacListPage.tsx** - Route: `/deac`
- [ ] **DeacCreatePage.tsx** - Route: `/deac/nouveau`
- [ ] **DeacDetailPage.tsx** - Route: `/deac/:ref`
- [ ] **DeacEditPage.tsx** - Route: `/deac/:ref/modifier`

---

### 5. Tableau de Bord & Statistiques

- [ ] **Backend - StatistiquesService**
  ```java
  public class StatistiquesDTO {
      private long nombreFdmEnCours;
      private long nombreFdmValidees;
      private long nombreFdmRejetees;
      private long nombreDeacEnCours;
      private long nombreDeacValidees;
      private double montantTotalDeac;
      private List<StatParMois> fdmParMois;
      private List<StatParMois> deacParMois;
  }
  ```

- [ ] **Endpoints**
  ```
  GET /api/stats/dashboard
  GET /api/stats/fdm-par-periode?debut={date}&fin={date}
  GET /api/stats/deac-par-periode?debut={date}&fin={date}
  GET /api/stats/delais-traitement
  ```

- [ ] **Frontend - DashboardPage**
  - Cards avec KPIs
  - Graphiques (Chart.js ou Recharts)
  - Demandes récentes
  - Alertes validations en attente

---

### 6. Module Comptabilité

- [ ] **Backend - ComptabiliteController**
  ```java
  GET /api/comptabilite/demandes-a-regler
  POST /api/comptabilite/fdm/{id}/regler
  POST /api/comptabilite/deac/{id}/regler
  ```

- [ ] **Frontend - ComptabilitePage**
  - Liste demandes validées non réglées
  - Montants à régler
  - Bouton "Marquer comme réglé"
  - Date de règlement
  - Historique règlements

---

## 🟢 PRIORITÉ BASSE (Nice to have)

### 7. Fonctionnalités Avancées

- [ ] **Recherche globale**
  - Recherche full-text dans toutes les demandes
  - Filtres avancés
  - Sauvegarde des filtres

- [ ] **Export Excel**
  - Export liste FDM
  - Export liste DEAC
  - Rapport mensuel/annuel

- [ ] **Notifications in-app**
  - Badge nombre notifications
  - Liste notifications
  - Marquage lu/non lu

- [ ] **Historique modifications**
  - Audit trail complet
  - Qui a modifié quoi et quand

- [ ] **Commentaires**
  - Thread de discussion par demande
  - Mentions @utilisateur
  - Pièces jointes aux commentaires

- [ ] **Dashboard validateur**
  - Vue globale demandes à valider
  - Validation rapide (modal)
  - Statistiques personnelles

---

## 🧪 Tests

### Tests Backend
- [ ] Tests unitaires Services
- [ ] Tests d'intégration Repositories
- [ ] Tests d'intégration Controllers
- [ ] Tests de validation métier
- [ ] Tests de calculs automatiques

### Tests Frontend
- [ ] Tests composants (React Testing Library)
- [ ] Tests hooks personnalisés
- [ ] Tests services API (mocked)
- [ ] Tests e2e (Cypress/Playwright)

---

## 📚 Documentation

- [ ] **Documentation API (Swagger)**
  - Annotations @ApiOperation
  - Schémas de requêtes/réponses
  - Exemples de payloads

- [ ] **README.md**
  - Installation
  - Configuration
  - Démarrage
  - Architecture

- [ ] **Guide utilisateur**
  - Comment créer une FDM
  - Comment créer une DEAC
  - Comment valider une demande
  - FAQ

- [ ] **Guide administrateur**
  - Configuration validateurs
  - Configuration emails
  - Gestion utilisateurs

---

## 🚀 Déploiement

- [ ] **Configuration Production**
  - Variables d'environnement
  - Base de données production
  - Stockage fichiers (cloud ou local)

- [ ] **CI/CD**
  - Pipeline GitHub Actions/GitLab CI
  - Tests automatiques
  - Build et déploiement automatique

- [ ] **Monitoring**
  - Logs applicatifs
  - Métriques (Prometheus/Grafana)
  - Alertes

---

## 📊 Estimation Temps

| Catégorie | Tâches | Estimation |
|-----------|--------|------------|
| Pièces jointes | Backend + Frontend | 2-3 jours |
| Génération PDF | Templates + Backend | 3-4 jours |
| Emails | Templates HTML | 1 jour |
| UI FDM | Composants complets | 3-4 jours |
| UI DEAC | Composants complets | 4-5 jours |
| Statistiques | Backend + Frontend | 2-3 jours |
| Comptabilité | Backend + Frontend | 2 jours |
| Tests | Tests complets | 3-4 jours |
| Documentation | Tous docs | 2 jours |
| **TOTAL** | | **~22-30 jours** |

---

## 🎯 Plan d'Action Recommandé

### Sprint 1 (1 semaine)
1. Gestion pièces jointes (Backend + Frontend)
2. Génération PDF basique
3. Tests de base

### Sprint 2 (1 semaine)
1. Interface FDM complète
2. Emails HTML
3. Tests FDM

### Sprint 3 (1 semaine)
1. Interface DEAC complète
2. Bon de commande
3. Tests DEAC

### Sprint 4 (1 semaine)
1. Tableau de bord
2. Module comptabilité
3. Documentation

### Sprint 5 (optionnel)
1. Fonctionnalités avancées
2. Optimisations
3. Déploiement production

---

**Document généré le:** 2025-11-29
**Version:** 1.0
