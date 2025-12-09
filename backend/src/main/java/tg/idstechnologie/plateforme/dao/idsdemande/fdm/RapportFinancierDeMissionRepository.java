package tg.idstechnologie.plateforme.dao.idsdemande.fdm;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.RapportFinancierDeMission;
import tg.idstechnologie.plateforme.utils.Choix_decisions;
import tg.idstechnologie.plateforme.secu.user.User;

import java.util.Optional;

@Repository
public interface RapportFinancierDeMissionRepository extends JpaRepository<RapportFinancierDeMission, Long> {

    @Query(value = "SELECT * FROM rapport_financier_missions WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM rapport_financier_missions WHERE is_delete = false",
            nativeQuery = true)
    Page<RapportFinancierDeMission> handleAllEntity(Pageable pageable);

    @Query(value = "SELECT * FROM rapport_financier_missions WHERE is_delete = false AND reference = :ref",
            nativeQuery = true)
    Optional<RapportFinancierDeMission> findByReference(@Param("ref") String ref);

    @Query(value = "SELECT * FROM rapport_financier_missions WHERE is_delete = false AND emetteur_id = :emetteurId ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM rapport_financier_missions WHERE is_delete = false AND emetteur_id = :emetteurId",
            nativeQuery = true)
    Page<RapportFinancierDeMission> findByEmetteurId(@Param("emetteurId") Long emetteurId, Pageable pageable);

    @Query(value = "SELECT rfm.* FROM rapport_financier_missions rfm " +
            "INNER JOIN validateurs v ON rfm.validateur_suivant_id = v.id " +
            "WHERE rfm.is_delete = false AND rfm.traite = false AND v.user_id = :userId " +
            "ORDER BY rfm.create_date DESC",
            countQuery = "SELECT COUNT(*) FROM rapport_financier_missions rfm " +
                    "INNER JOIN validateurs v ON rfm.validateur_suivant_id = v.id " +
                    "WHERE rfm.is_delete = false AND rfm.traite = false AND v.user_id = :userId",
            nativeQuery = true)
    Page<RapportFinancierDeMission> findPendingValidationsByUserId(@Param("userId") Long userId, Pageable pageable);

    // Statistics methods
    long countByEmetteurAndDeleteFalse(User emetteur);

    long countByEmetteurAndTraitementPrecedentIsNullAndDeleteFalse(User emetteur);

    long countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(User emetteur, Choix_decisions decision);
}
