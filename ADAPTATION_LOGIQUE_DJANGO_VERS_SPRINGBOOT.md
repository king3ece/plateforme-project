# 📋 ADAPTATION DE LA LOGIQUE DJANGO VERS SPRING BOOT - UTILISATION DU "POSTE"

## 🎯 OBJECTIF

Adapter la logique de validation des demandes (FDM, BonPour, DemandeAchat) du projet Django vers le projet Spring Boot existant en utilisant le concept de **"poste"** (position organisationnelle) au lieu de **"rôle"** (role).

---

## ✅ ÉTAT ACTUEL DU PROJET

### Architecture Existante

Votre projet Spring Boot **utilise déjà le système de "poste"** :

```java
@Entity
@Table(name = "_users")
public class User extends BaseEntity implements UserDetails {
    // ...

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "poste_id")
    private Poste poste;  // ✅ Position/Rôle dans l'organisation

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subdivision_id")
    private Subdivision subdivision;  // Département/Division

    private String sexe;  // "M" ou "F" pour Monsieur/Madame
}
```

### Méthode Repository Existante

```java
// UserRepository.java - ligne 60-69
@Query(value = """
    SELECT u.* FROM _users u
    INNER JOIN postes p ON u.poste_id = p.id
    WHERE u.is_delete = false
    AND u.is_enable = true
    AND p.code = :posteCode
    """,
    nativeQuery = true
)
List<User> findByPosteCode(@Param("posteCode") String posteCode);
```

---

## 🔧 MODIFICATIONS APPORTÉES

### 1. ✅ **FicheDescriptiveMissionService** (Déjà implémenté)

**Fichier :** [FicheDescriptiveMissionService.java](backend/src/main/java/tg/idstechnologie/plateforme/services/idsdemande/fdm/FicheDescriptiveMissionService.java:405)

**Logique existante :**

```java
// Ligne 404-416
// Notifier tous les comptables (utilisateurs avec poste "COMPTABLE")
List<User> comptables = userRepository.findByPosteCode("COMPTABLE");
for (User comptable : comptables) {
    String titreComptable = getTitre(comptable.getSexe());
    emailService.sendFdmToComptableNotification(
            comptable.getEmail(),
            titreComptable,
            comptable.getLastName(),
            comptable.getName(),
            fdm.getId(),
            fdm.getTypeProcessus().getCode()
    );
}
```

**Correspondance Django :**
```python
# Trouver les utilisateurs avec le rôle de comptable
comptables = Personnel.objects.filter(is_role_comptable=True)
```

**Adaptation Spring Boot :**
```java
// ✅ Utilise findByPosteCode("COMPTABLE") au lieu de is_role_comptable
List<User> comptables = userRepository.findByPosteCode("COMPTABLE");
```

---

### 2. ✅ **BonPourService** (Modifié)

**Fichier :** [BonPourService.java](backend/src/main/java/tg/idstechnologie/plateforme/services/idsdemande/bonpour/BonPourService.java:415)

**Modifications apportées à la ligne 400-436 :**

#### Avant :
```java
} else {
    // Dernier validateur : bon pour validé
    bonPour.setTraite(true);
    bonPour.setFavorable(true);
    bonPour.setValidateurSuivant(null);
    emailService.sendMailNewFdm(
            bonPour.getEmetteur().getEmail(),
            bonPour.getId().toString(),
            "Votre bon pour a été approuvé par tous les validateurs"
    );
}
```

#### Après :
```java
} else {
    // Dernier validateur : bon pour validé
    bonPour.setTraite(true);
    bonPour.setFavorable(true);
    bonPour.setValidateurSuivant(null);

    // Notifier l'émetteur
    User emetteur = bonPour.getEmetteur();
    emailService.sendMailNewFdm(
            emetteur.getEmail(),
            bonPour.getId().toString(),
            "Votre bon pour a été approuvé par tous les validateurs"
    );

    // Notifier tous les comptables (utilisateurs avec poste "COMPTABLE")
    List<User> comptables = userRepository.findByPosteCode("COMPTABLE");
    for (User comptable : comptables) {
        String titreComptable = comptable.getSexe() != null && comptable.getSexe().equals("M") ? "Monsieur" : "Madame";
        String message = String.format(
                "%s %s %s,\n\n" +
                "Un nouveau Bon Pour vient d'être validé.\n\n" +
                "REFERENCE DE LA DEMANDE : %s%s\n\n" +
                "Veuillez procéder au règlement dans l'espace 'Règlements en attente' de l'application IDS DEMANDE.\n\n" +
                "Cordialement, l'équipe IDS DEMANDE",
                titreComptable,
                comptable.getLastName(),
                comptable.getName(),
                bonPour.getId(),
                bonPour.getTypeProcessus().getCode()
        );
        emailService.sendMailNewFdm(
                comptable.getEmail(),
                bonPour.getId().toString(),
                message
        );
    }
}
```

**Correspondance Django (lignes 80-95 du code BonPour) :**
```python
# Trouver les utilisateurs avec le rôle de comptable
comptables = Personnel.objects.filter(is_role_comptable=True)
if comptables.exists():
    for comptable in comptables:
        titre_comptable = "Monsieur" if comptable.sexe == "M" else "Madame"
        message_comptable = (
            f"{titre_comptable} {comptable.nom} {comptable.prenom}, \n\n"
            f"Un nouveau Bon Pour vient d'être validé. \n\n"
            f"REFERENCE DE LA DEMANDE : {bon_pour.id}{bon_pour.type_processus} \n\n"
            "Veuillez procéder au règlement dans l'espace 'Règlements en attente' de l'application IDS DEMANDE.\n\n"
            "Cordialement, l'équipe IDS DEMANDE"
        )
        sujet_comptable = 'NOUVEAU BON POUR VALIDE'
        destinataires_comptable = [comptable.email]
        send_mail(sujet_comptable, message_comptable, None, destinataires_comptable)
```

---

### 3. ✅ **DemandeAchatService** (Modifié)

**Fichier :** [DemandeAchatService.java](backend/src/main/java/tg/idstechnologie/plateforme/services/idsdemande/dda/DemandeAchatService.java:313)

**Modifications apportées à la ligne 297-334 :**

#### Avant :
```java
} else {
    // Dernier validateur : demande validée
    demande.setTraite(true);
    demande.setFavorable(true);
    demande.setValidateurSuivant(null);
    emailService.sendMailNewFdm(
            demande.getEmetteur().getEmail(),
            demande.getId().toString(),
            "Votre demande d'achat a été approuvée"
    );
}
```

#### Après :
```java
} else {
    // Dernier validateur : demande validée
    demande.setTraite(true);
    demande.setFavorable(true);
    demande.setValidateurSuivant(null);

    // Notifier l'émetteur
    User emetteur = demande.getEmetteur();
    emailService.sendMailNewFdm(
            emetteur.getEmail(),
            demande.getId().toString(),
            "Votre demande d'achat a été approuvée"
    );

    // Notifier tous les comptables (utilisateurs avec poste "COMPTABLE")
    // pour qu'ils procèdent à l'élaboration du bon de commande
    List<User> comptables = userRepository.findByPosteCode("COMPTABLE");
    for (User comptable : comptables) {
        String titreComptable = comptable.getSexe() != null && comptable.getSexe().equals("M") ? "Monsieur" : "Madame";
        String message = String.format(
                "%s %s %s,\n\n" +
                "Une nouvelle demande d'achat vient d'être validée.\n\n" +
                "REFERENCE DE LA DEMANDE : %s%s\n\n" +
                "Veuillez procéder à l'élaboration du bon de commande dans l'espace 'Bon de commande en attente' de l'application IDS DEMANDE.\n\n" +
                "Cordialement, l'équipe IDS DEMANDE",
                titreComptable,
                comptable.getLastName(),
                comptable.getName(),
                demande.getId(),
                demande.getTypeProcessus().getCode()
        );
        emailService.sendMailNewFdm(
                comptable.getEmail(),
                demande.getId().toString(),
                message
        );
    }
}
```

**Correspondance Django (lignes 80-100 du code DemandeAchat) :**
```python
# Trouver les utilisateurs avec le rôle de gestionnaires de comptables
comptables = Personnel.objects.filter(is_role_comptable=True)
if comptables.exists():
    for comptable in comptables:
        titre_comptable = "Monsieur" if comptable.sexe == "M" else "Madame"
        message_comptable = (
            f"{titre_comptable} {comptable.nom} {comptable.prenom}, \n\n"
            f"Une nouvelle demande d'achat vient d'être validée. \n\n"
            f"REFERENCE DE LA DEMANDE : {demande_achat.id}{demande_achat.type_processus} \n\n"
            "Veuillez procéder à l'élaboration du bon de commande dans l'espace 'Bon de commande en attente' de l'application IDS DEMANDE.\n\n"
            "Cordialement, l'équipe IDS DEMANDE"
        )
        sujet_comptable = 'NOUVELLE DEMANDE D\'ACHAT VALIDEE'
        destinataires_comptable = [comptable.email]
        send_mail(sujet_comptable, message_comptable, None, destinataires_comptable)
```

---

## 📊 TABLEAU COMPARATIF DJANGO vs SPRING BOOT

| Aspect | Code Django | Code Spring Boot Adapté |
|--------|-------------|--------------------------|
| **Filtre Comptables** | `Personnel.objects.filter(is_role_comptable=True)` | `userRepository.findByPosteCode("COMPTABLE")` |
| **Détermination Titre** | `"Monsieur" if sexe == "M" else "Madame"` | `sexe != null && sexe.equals("M") ? "Monsieur" : "Madame"` |
| **Nom/Prénom** | `comptable.nom` / `comptable.prenom` | `comptable.getLastName()` / `comptable.getName()` |
| **Email** | `comptable.email` | `comptable.getEmail()` |
| **ID Demande** | `{demande.id}{demande.type_processus}` | `demande.getId() + demande.getTypeProcessus().getCode()` |
| **Envoi Email** | `send_mail(sujet, message, None, [email])` | `emailService.sendMailNewFdm(email, id, message)` |

---

## 🔍 LOGIQUE DE VALIDATION COMMUNE

### Workflow Complet (identique Django et Spring Boot)

```
1. Création de la demande
   └─> Déterminer premier validateur non-émetteur
       ├─> Si aucun validateur non-émetteur : Auto-validation
       └─> Sinon : Envoyer au premier validateur

2. Validation par validateur actuel
   └─> Decision = VALIDER
       ├─> Chercher prochain validateur non-émetteur
       │   ├─> Si trouvé : Passer au suivant
       │   └─> Si non trouvé (dernier validateur) :
       │       ├─> Marquer traite=true, favorable=true
       │       ├─> Notifier émetteur
       │       └─> Notifier tous les COMPTABLES 🎯

3. Decision = REJETER
   └─> Marquer traite=true, favorable=false
       ├─> Notifier émetteur avec raison
       └─> Notifier tous les validateurs précédents

4. Decision = A_CORRIGER
   └─> Retourner au validateur précédent ou émetteur
       └─> Notifier avec raison de correction
```

---

## 🎯 POINTS CLÉS DE L'ADAPTATION

### 1. **Utilisation du Poste au lieu du Rôle**

**Django :**
```python
Personnel.objects.filter(is_role_comptable=True)
```

**Spring Boot :**
```java
userRepository.findByPosteCode("COMPTABLE")
```

### 2. **Requête SQL Utilisée**

```sql
SELECT u.* FROM _users u
INNER JOIN postes p ON u.poste_id = p.id
WHERE u.is_delete = false
  AND u.is_enable = true
  AND p.code = 'COMPTABLE'
```

### 3. **Personnalisation des Messages Email**

- **Titre :** Monsieur/Madame selon le sexe
- **Nom complet :** lastName + name
- **Référence demande :** ID + code du type de processus
- **Message personnalisé** selon le type de demande :
  - **BonPour :** "Règlement en attente"
  - **DemandeAchat :** "Bon de commande en attente"

---

## 📦 TYPES DE DEMANDES ET CODES

| Type de Demande | Code Processus | Notification Comptables | Action Comptable |
|-----------------|----------------|-------------------------|------------------|
| Fiche Descriptive Mission | **FDM** | ✅ Oui | Règlement/Paiement |
| Bon Pour | **BONPOUR** | ✅ Oui | Règlement |
| Demande d'Achat | **DDA** | ✅ Oui | Élaboration Bon de Commande |
| Rapport Financier Mission | **RFDM** | ❌ Non | - |

---

## 🏗️ STRUCTURE DU MODÈLE "POSTE"

```java
@Entity
@Table(name = "postes")
public class Poste extends BaseEntity {
    private Long id;
    private String code;       // ex: "COMPTABLE", "DIRECTEUR", "VALIDATEUR"
    private String libelle;    // ex: "Comptable", "Directeur Général"

    @OneToMany(mappedBy = "poste", fetch = FetchType.LAZY)
    private List<User> users;  // Utilisateurs ayant ce poste
}
```

**Exemples de codes de postes attendus :**
- `COMPTABLE` - Comptable
- `DIRECTEUR` - Directeur
- `CHEF_SERVICE` - Chef de Service
- `VALIDATEUR` - Validateur
- `GESTIONNAIRE` - Gestionnaire

---

## ✨ AVANTAGES DE L'UTILISATION DU "POSTE"

1. **Flexibilité Organisationnelle**
   - Plus adapté à une structure d'entreprise réelle
   - Permet plusieurs niveaux hiérarchiques
   - Pas de limitation à des rôles fixes

2. **Scalabilité**
   - Facile d'ajouter de nouveaux postes
   - Pas besoin de modifier le code pour ajouter un rôle

3. **Clarté Métier**
   - Les postes reflètent la réalité organisationnelle
   - Meilleure compréhension pour les utilisateurs non-techniques

4. **Maintenance**
   - Configuration via base de données (table `postes`)
   - Pas de recompilation nécessaire pour changer les rôles

---

## 🚀 PROCHAINES ÉTAPES (RECOMMANDATIONS)

### 1. ✅ Amélioration des Services Email

Créer des méthodes dédiées dans `EmailService` pour chaque type de notification :

```java
void sendBonPourToComptableNotification(String to, String titre, String nom, String prenom, Long id, String processCode);
void sendDemandeAchatToComptableNotification(String to, String titre, String nom, String prenom, Long id, String processCode);
```

### 2. ✅ Configuration des Postes dans la Base

Assurer que les postes sont bien configurés dans `data.sql` :

```sql
INSERT INTO postes (code, libelle, reference) VALUES
('COMPTABLE', 'Comptable', uuid_generate_v4()),
('DIRECTEUR', 'Directeur', uuid_generate_v4()),
('CHEF_SERVICE', 'Chef de Service', uuid_generate_v4());
```

### 3. ✅ Tests Unitaires

Créer des tests pour vérifier :
- La méthode `findByPosteCode("COMPTABLE")` retourne les bons utilisateurs
- Les notifications sont envoyées aux comptables lors de la validation finale
- Les messages email contiennent les bonnes informations

### 4. ✅ Documentation Utilisateur

Documenter dans le guide utilisateur :
- Comment configurer les postes
- Comment assigner des postes aux utilisateurs
- Le workflow de validation complet

---

## 📝 NOTES IMPORTANTES

### Différences Django vs Spring Boot

1. **Champs de nom :**
   - Django : `nom` / `prenom`
   - Spring Boot : `lastName` / `name`

2. **Gestion des null :**
   - Django : Utilise des conditions `if`
   - Spring Boot : Utilise des opérateurs ternaires et `.orElse()`

3. **Queries :**
   - Django : ORM avec `filter()`
   - Spring Boot : `@Query` natif SQL ou JPQL

4. **Email :**
   - Django : `send_mail()` synchrone
   - Spring Boot : `@Async` pour envoi asynchrone

### Cohérence avec le Code Existant

✅ **Votre projet utilise déjà `poste` partout** :
- La méthode `findByPosteCode` existait déjà
- `FicheDescriptiveMissionService` l'utilisait déjà correctement
- Les deux autres services ont maintenant été alignés

---

## 📞 CONTACT & SUPPORT

Pour toute question ou assistance supplémentaire sur cette adaptation :
- **Documentation Django originale :** Référez-vous aux fichiers Python fournis
- **Documentation Spring Boot :** Voir les interfaces dans `backend/src/main/java/.../interfaces/`

---

## ✅ CHECKLIST DE VÉRIFICATION

- [x] FicheDescriptiveMissionService utilise `findByPosteCode("COMPTABLE")`
- [x] BonPourService notifie les comptables après validation finale
- [x] DemandeAchatService notifie les comptables après validation finale
- [x] UserRepository a la méthode `findByPosteCode`
- [x] Les messages email sont personnalisés avec Monsieur/Madame
- [x] Les références de demande incluent l'ID + code processus
- [ ] Tests unitaires créés pour vérifier les notifications
- [ ] Documentation utilisateur mise à jour
- [ ] Configuration des postes vérifiée en base de données

---

**Date de création :** 2025-12-15
**Version :** 1.0
**Auteur :** Adaptation automatique Django → Spring Boot
