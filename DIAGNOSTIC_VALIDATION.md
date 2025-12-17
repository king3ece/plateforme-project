# Diagnostic du problème de validation FDM
## Problème identifié
Le second validateur ne voit pas les demandes après que le premier validateur les ait validées.

## Cause probable
Dans `FicheDescriptiveMissionService.java`, la méthode `handleValidation()` (ligne 436) ne persiste pas explicitement les changements, même si une sauvegarde globale est faite dans `traiterFDM()` ligne 347.

## Points à vérifier

### 1. Vérifier que `validateurSuivant` est bien mis à jour en base
Exécutez cette requête SQL après qu'un premier validateur valide :

```sql
SELECT
    fdm.id,
    fdm.reference,
    fdm.nom_projet,
    fdm.traite,
    fdm.validateur_suivant_id,
    v.ordre as ordre_validateur,
    u.email as email_validateur
FROM fiche_descriptive_missions fdm
LEFT JOIN validateurs v ON fdm.validateur_suivant_id = v.id
LEFT JOIN users u ON v.user_id = u.id
WHERE fdm.is_delete = false
AND fdm.traite = false
ORDER BY fdm.create_date DESC;
```

**Résultat attendu** : Après validation du 1er validateur, `validateur_suivant_id` doit pointer vers le 2ème validateur.

### 2. Vérifier la requête `findPendingValidationsByUserId`
La requête du repository (ligne 34-42 de `FicheDescriptiveMissionRepository.java`) :

```sql
SELECT fdm.* FROM fiche_descriptive_missions fdm
INNER JOIN validateurs v ON fdm.validateur_suivant_id = v.id
WHERE fdm.is_delete = false
  AND fdm.traite = false
  AND v.user_id = :userId
```

**Test** : Connectez-vous avec le 2ème validateur et vérifiez son `userId`, puis exécutez :

```sql
SELECT
    fdm.*,
    v.id as validateur_id,
    v.user_id,
    v.ordre
FROM fiche_descriptive_missions fdm
INNER JOIN validateurs v ON fdm.validateur_suivant_id = v.id
WHERE fdm.is_delete = false
  AND fdm.traite = false
  AND v.user_id = [USER_ID_DU_2EME_VALIDATEUR];
```

### 3. Vérifier l'ordre des validateurs
```sql
SELECT
    v.id,
    v.ordre,
    u.email,
    tp.code as processus,
    s.libelle as subdivision
FROM validateurs v
INNER JOIN users u ON v.user_id = u.id
INNER JOIN type_processus tp ON v.type_processus_id = tp.id
LEFT JOIN subdivisions s ON v.subdivision_id = s.id
WHERE tp.code = 'FDM'
ORDER BY v.ordre;
```

**Vérifiez** : Les validateurs sont-ils dans le bon ordre ?

## Solutions possibles

### Solution 1 : Ajouter un flush explicite
Dans `traiterFDM()`, après `handleValidation()` :

```java
if (decision == Choix_decisions.VALIDER) {
    handleValidation(fdm, validateurList, validateurSuivant);
}
// ... autres cas ...

ficheDescriptiveMissionDao.save(fdm);
ficheDescriptiveMissionDao.flush(); // ← AJOUTER CETTE LIGNE
```

### Solution 2 : Vérifier la transaction
Assurez-vous que `@Transactional` est bien configuré sur la classe service (c'est déjà le cas ligne 45).

### Solution 3 : Debug logging
Ajoutez des logs dans `handleValidation()` :

```java
private void handleValidation(FicheDescriptiveMission fdm, List<Validateur> validateurList, Validateur validateurActuel) {
    System.out.println("=== DEBUG handleValidation ===");
    System.out.println("FDM ID: " + fdm.getId());
    System.out.println("Validateur actuel: " + validateurActuel.getUser().getEmail());
    System.out.println("Nombre de validateurs dans la liste: " + validateurList.size());

    Optional<Validateur> nextValidateur = getNextValidateur(validateurList, validateurActuel);

    if (nextValidateur.isPresent()) {
        System.out.println("Prochain validateur trouvé: " + nextValidateur.get().getUser().getEmail());
        fdm.setValidateurSuivant(nextValidateur.get());
        notifyValidateur(nextValidateur.get(), fdm, "Vous avez une nouvelle fiche descriptive de mission en attente de traitement.");
    } else {
        System.out.println("Aucun validateur suivant - FDM sera marquée comme traitée");
        fdm.setTraite(true);
        fdm.setFavorable(true);
        fdm.setValidateurSuivant(null);
        // ...
    }
    System.out.println("Validateur suivant ID: " + (fdm.getValidateurSuivant() != null ? fdm.getValidateurSuivant().getId() : "NULL"));
    System.out.println("==============================");
}
```

## Étapes de test

1. **Créer une FDM** avec un utilisateur
2. **Valider avec le 1er validateur**
3. **Vérifier en base** que `validateur_suivant_id` pointe vers le 2ème validateur
4. **Se connecter avec le 2ème validateur** et vérifier l'endpoint `/api/fdms/pending-validations`
5. **Regarder les logs** pour voir si la FDM est bien retournée

## Requête de test directe
Pour tester l'endpoint backend directement (avec le token du 2ème validateur) :

```bash
curl -X GET "http://localhost:8080/api/fdms/pending-validations?page=0&size=30" \
  -H "Authorization: Bearer [TOKEN_2EME_VALIDATEUR]"
```
