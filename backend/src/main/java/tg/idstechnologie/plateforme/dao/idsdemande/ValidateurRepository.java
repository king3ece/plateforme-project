package tg.idstechnologie.plateforme.dao.idsdemande;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;

import java.util.List;
import java.util.Optional;

@Repository
public interface ValidateurRepository  extends JpaRepository<Validateur, Long> {

    @Query(value = "SELECT * FROM validateurs WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM validateurs WHERE is_delete = false ORDER BY create_date DESC",
            nativeQuery = true)
    Page<Validateur> handleAllEntity(Pageable pageable);



    @Query(value = "select * from validateurs  where is_delete = false and reference = :ref",
            nativeQuery = true
    )
    Optional<Validateur> findByReference(String ref);

    @Query(value = "select v.* from validateurs v left join type_processus t on v.type_processus_id = t.id where v.is_delete = false and t.code = :ref ORDER BY v.ordre ASC",
            nativeQuery = true
    )
    List<Validateur> handleValidatorByProcessCode(String ref);

    @Query(value = "SELECT v.* FROM validateurs v " +
            "WHERE v.is_delete = false " +
            "AND v.type_processus_id = :processusId " +
            "AND v.ordre < :currentOrdre " +
            "ORDER BY v.ordre DESC " +
            "LIMIT 1",
            nativeQuery = true)
    Optional<Validateur> findPreviousValidator(@Param("processusId") Long processusId, @Param("currentOrdre") Integer currentOrdre);

      List<Validateur> findByTypeProcessusIdAndDeleteFalse(Long typeProcessusId);

    // ✅ Vérifier si un utilisateur est validateur
    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END " +
            "FROM validateurs " +
            "WHERE is_delete = false AND user_id = :userId",
            nativeQuery = true)
    Boolean isUserValidator(@Param("userId") Long userId);

    // ✅ Récupérer tous les rôles de validateur d'un utilisateur
    @Query(value = "SELECT * FROM validateurs " +
            "WHERE is_delete = false AND user_id = :userId " +
            "ORDER BY ordre ASC",
            nativeQuery = true)
    List<Validateur> findByUserId(@Param("userId") Long userId);

    // ✅ Compter le nombre de rôles de validateur d'un utilisateur
    @Query(value = "SELECT COUNT(*) FROM validateurs " +
            "WHERE is_delete = false AND user_id = :userId",
            nativeQuery = true)
    Integer countByUserId(@Param("userId") Long userId);

}
