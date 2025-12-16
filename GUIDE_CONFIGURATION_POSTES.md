# 🔧 GUIDE DE CONFIGURATION DES POSTES

## 📋 Vue d'ensemble

Ce guide vous aide à configurer correctement les **postes** dans votre application pour que le système de notification des comptables fonctionne correctement.

---

## 1️⃣ Vérifier la Table `postes`

### SQL de vérification
```sql
-- Vérifier que la table postes existe et contient des données
SELECT * FROM postes WHERE is_delete = false;
```

### Résultat attendu
```
┌────┬──────────────┬────────────────────┬──────────────────────────────────────┐
│ id │ code         │ libelle            │ reference                            │
├────┼──────────────┼────────────────────┼──────────────────────────────────────┤
│ 1  │ COMPTABLE    │ Comptable          │ uuid-xxx-xxx-xxx                     │
│ 2  │ DIRECTEUR    │ Directeur Général  │ uuid-xxx-xxx-xxx                     │
│ 3  │ CHEF_SERVICE │ Chef de Service    │ uuid-xxx-xxx-xxx                     │
│ 4  │ VALIDATEUR   │ Validateur         │ uuid-xxx-xxx-xxx                     │
└────┴──────────────┴────────────────────┴──────────────────────────────────────┘
```

---

## 2️⃣ Créer le Poste "COMPTABLE" (si inexistant)

### Via SQL
```sql
INSERT INTO postes (code, libelle, reference, create_date, is_delete, is_enable)
VALUES (
    'COMPTABLE',
    'Comptable',
    gen_random_uuid(),  -- PostgreSQL
    CURRENT_TIMESTAMP,
    false,
    true
);
```

### Via API REST (si disponible)
```http
POST /api/postes
Content-Type: application/json

{
  "code": "COMPTABLE",
  "libelle": "Comptable"
}
```

---

## 3️⃣ Assigner le Poste aux Utilisateurs

### SQL de vérification
```sql
-- Vérifier les utilisateurs avec le poste COMPTABLE
SELECT
    u.id,
    u.name,
    u.last_name,
    u.email,
    p.code AS poste_code,
    p.libelle AS poste_libelle
FROM _users u
LEFT JOIN postes p ON u.poste_id = p.id
WHERE p.code = 'COMPTABLE'
  AND u.is_delete = false
  AND u.is_enable = true;
```

### Assigner un poste à un utilisateur existant
```sql
-- Mettre à jour le poste d'un utilisateur
UPDATE _users
SET poste_id = (SELECT id FROM postes WHERE code = 'COMPTABLE')
WHERE email = 'comptable@idstechnologie.com'
  AND is_delete = false;
```

---

## 4️⃣ Tester la Méthode Repository

### Test dans votre application
Créez un test unitaire ou un endpoint temporaire :

```java
@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/comptables")
    public ResponseEntity<List<User>> getComptables() {
        List<User> comptables = userRepository.findByPosteCode("COMPTABLE");
        return ResponseEntity.ok(comptables);
    }
}
```

### Appeler l'endpoint
```bash
curl http://localhost:9091/api/test/comptables
```

### Résultat attendu
```json
[
  {
    "id": 1,
    "name": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@idstechnologie.com",
    "sexe": "M",
    "poste": {
      "code": "COMPTABLE",
      "libelle": "Comptable"
    }
  },
  {
    "id": 2,
    "name": "Marie",
    "lastName": "Martin",
    "email": "marie.martin@idstechnologie.com",
    "sexe": "F",
    "poste": {
      "code": "COMPTABLE",
      "libelle": "Comptable"
    }
  }
]
```

---

## 5️⃣ Vérifier les Notifications Email

### Scénario de test complet

1. **Créer une Fiche Descriptive de Mission (FDM)**
   - Se connecter comme utilisateur standard
   - Créer une nouvelle FDM avec tous les champs requis
   - Soumettre la demande

2. **Valider par tous les validateurs**
   - Se connecter comme chaque validateur dans l'ordre
   - Approuver la demande (Decision = VALIDER)

3. **Vérifier l'email envoyé aux comptables**
   - Après la dernière validation, tous les utilisateurs avec `poste.code = "COMPTABLE"` doivent recevoir un email
   - Contenu attendu :
     ```
     Monsieur/Madame [Nom] [Prénom],

     Une nouvelle Fiche Descriptive de Mission vient d'être validée.

     REFERENCE DE LA DEMANDE : [ID]FDM

     Veuillez procéder au règlement dans l'espace 'Règlements en attente' de l'application IDS DEMANDE.

     Cordialement, l'équipe IDS DEMANDE
     ```

### Vérifier les logs
```bash
# Vérifier les logs de l'application pour voir les emails envoyés
tail -f backend/logs/application.log | grep -i "email\|comptable"
```

---

## 6️⃣ Codes de Postes Recommandés

| Code Poste | Libellé | Description | Reçoit Notifications |
|------------|---------|-------------|---------------------|
| `COMPTABLE` | Comptable | Gestion financière | ✅ Oui (FDM, BP, DDA) |
| `DIRECTEUR` | Directeur | Direction générale | ❌ Non (sauf si validateur) |
| `CHEF_SERVICE` | Chef de Service | Responsable service | ❌ Non (sauf si validateur) |
| `VALIDATEUR` | Validateur | Validateur générique | ❌ Non (notification individuelle) |
| `GESTIONNAIRE` | Gestionnaire | Gestionnaire admin | ❌ Non |
| `UTILISATEUR` | Utilisateur | Utilisateur standard | ❌ Non |

---

## 7️⃣ Dépannage

### ❌ Aucun email reçu par les comptables

**Causes possibles :**
1. Aucun utilisateur n'a le poste `COMPTABLE`
2. Les utilisateurs avec poste `COMPTABLE` ont `is_enable = false`
3. Les utilisateurs avec poste `COMPTABLE` ont `is_delete = true`
4. Configuration email incorrecte dans `application.properties`

**Solution :**
```sql
-- Vérifier les utilisateurs comptables actifs
SELECT
    u.id,
    u.email,
    u.is_enable,
    u.is_delete,
    p.code
FROM _users u
LEFT JOIN postes p ON u.poste_id = p.id
WHERE p.code = 'COMPTABLE';
```

### ❌ Erreur "poste.code does not exist"

**Cause :** Le champ `code` n'existe pas dans la table `postes`

**Solution :**
```sql
-- Ajouter la colonne code si elle n'existe pas
ALTER TABLE postes ADD COLUMN code VARCHAR(50) UNIQUE;

-- Mettre à jour les codes existants
UPDATE postes SET code = 'COMPTABLE' WHERE libelle = 'Comptable';
UPDATE postes SET code = 'DIRECTEUR' WHERE libelle = 'Directeur';
```

### ❌ Plusieurs utilisateurs reçoivent des doublons

**Cause :** Plusieurs utilisateurs ont le même email avec le poste COMPTABLE

**Solution :**
```sql
-- Identifier les doublons
SELECT email, COUNT(*)
FROM _users u
JOIN postes p ON u.poste_id = p.id
WHERE p.code = 'COMPTABLE'
  AND u.is_delete = false
  AND u.is_enable = true
GROUP BY email
HAVING COUNT(*) > 1;
```

---

## 8️⃣ Commandes Utiles

### Lister tous les postes
```sql
SELECT id, code, libelle, reference
FROM postes
WHERE is_delete = false
ORDER BY libelle;
```

### Compter les utilisateurs par poste
```sql
SELECT
    p.code,
    p.libelle,
    COUNT(u.id) AS nb_utilisateurs
FROM postes p
LEFT JOIN _users u ON p.id = u.poste_id AND u.is_delete = false AND u.is_enable = true
WHERE p.is_delete = false
GROUP BY p.id, p.code, p.libelle
ORDER BY nb_utilisateurs DESC;
```

### Lister les utilisateurs sans poste
```sql
SELECT
    u.id,
    u.name,
    u.last_name,
    u.email
FROM _users u
WHERE u.poste_id IS NULL
  AND u.is_delete = false
  AND u.is_enable = true;
```

---

## 9️⃣ Script d'Initialisation Complet

```sql
-- ==============================================
-- SCRIPT D'INITIALISATION DES POSTES
-- ==============================================

-- 1. Créer les postes de base
INSERT INTO postes (code, libelle, reference, create_date, is_delete, is_enable)
VALUES
    ('COMPTABLE', 'Comptable', gen_random_uuid(), CURRENT_TIMESTAMP, false, true),
    ('DIRECTEUR', 'Directeur Général', gen_random_uuid(), CURRENT_TIMESTAMP, false, true),
    ('CHEF_SERVICE', 'Chef de Service', gen_random_uuid(), CURRENT_TIMESTAMP, false, true),
    ('VALIDATEUR', 'Validateur', gen_random_uuid(), CURRENT_TIMESTAMP, false, true),
    ('GESTIONNAIRE', 'Gestionnaire', gen_random_uuid(), CURRENT_TIMESTAMP, false, true),
    ('UTILISATEUR', 'Utilisateur Standard', gen_random_uuid(), CURRENT_TIMESTAMP, false, true)
ON CONFLICT (code) DO NOTHING;

-- 2. Créer un utilisateur comptable de test (si aucun n'existe)
INSERT INTO _users (
    name,
    last_name,
    email,
    password,
    sexe,
    poste_id,
    is_enable,
    is_delete,
    reference,
    create_date
)
VALUES (
    'Comptable',
    'Test',
    'comptable.test@idstechnologie.com',
    '$2a$10$hashedpassword', -- Remplacer par un vrai hash bcrypt
    'M',
    (SELECT id FROM postes WHERE code = 'COMPTABLE'),
    true,
    false,
    gen_random_uuid(),
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- 3. Vérifier l'insertion
SELECT
    u.email,
    u.name,
    u.last_name,
    p.code,
    p.libelle
FROM _users u
JOIN postes p ON u.poste_id = p.id
WHERE p.code = 'COMPTABLE'
  AND u.is_delete = false;
```

---

## 🔟 Checklist Finale

Avant de déployer en production, vérifiez :

- [ ] La table `postes` existe avec la colonne `code`
- [ ] Le poste `COMPTABLE` existe (`code = 'COMPTABLE'`)
- [ ] Au moins un utilisateur a le poste `COMPTABLE`
- [ ] Les utilisateurs comptables ont `is_enable = true`
- [ ] Les utilisateurs comptables ont `is_delete = false`
- [ ] Les emails des comptables sont valides
- [ ] La configuration SMTP est correcte dans `application.properties`
- [ ] Le service email fonctionne (`EmailService` / `EmailServiceImpl`)
- [ ] La méthode `findByPosteCode("COMPTABLE")` retourne des résultats
- [ ] Un test de bout en bout a été effectué (création → validation → notification)

---

## 📞 Support

Pour toute assistance :
- **Documentation technique :** Voir [ADAPTATION_LOGIQUE_DJANGO_VERS_SPRINGBOOT.md](ADAPTATION_LOGIQUE_DJANGO_VERS_SPRINGBOOT.md)
- **Logs d'application :** `backend/logs/application.log`
- **Base de données :** PostgreSQL sur `localhost:5432`, database `plateforme_ids`

---

**Dernière mise à jour :** 2025-12-15
