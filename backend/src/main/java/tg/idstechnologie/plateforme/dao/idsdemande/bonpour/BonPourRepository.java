package tg.idstechnologie.plateforme.dao.idsdemande.bonpour;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.BonPour;

import java.util.List;
import java.util.Optional;

@Repository
public interface BonPourRepository extends JpaRepository<BonPour, Long> {

    @Query(value = "SELECT * FROM bon_pours WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM bon_pours WHERE is_delete = false ORDER BY create_date DESC",
            nativeQuery = true)
    Page<BonPour> handleAllEntity(Pageable pageable);

    @Query(value = "SELECT * FROM bon_pours WHERE is_delete = false AND reference = :ref",
            nativeQuery = true)
    Optional<BonPour> findByReference(String ref);

    @Query(value = "SELECT * FROM bon_pours WHERE is_delete = false AND emetteur_id = :emetteurId ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM bon_pours WHERE is_delete = false AND emetteur_id = :emetteurId",
            nativeQuery = true)
    Page<BonPour> findByEmetteurId(@Param("emetteurId") Long emetteurId, Pageable pageable);

    @Query(value = "SELECT bp.* FROM bon_pours bp " +
            "INNER JOIN validateurs v ON bp.validateur_suivant_id = v.id " +
            "WHERE bp.is_delete = false AND bp.traite = false AND v.user_id = :userId " +
            "ORDER BY bp.create_date DESC",
            countQuery = "SELECT COUNT(*) FROM bon_pours bp " +
            "INNER JOIN validateurs v ON bp.validateur_suivant_id = v.id " +
            "WHERE bp.is_delete = false AND bp.traite = false AND v.user_id = :userId",
            nativeQuery = true)
    Page<BonPour> findPendingValidationsByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query(value = "SELECT * FROM bon_pours WHERE is_delete = false AND emetteur_id = :emetteurId ORDER BY create_date DESC",
            nativeQuery = true)
    List<BonPour> findAllByEmetteurId(@Param("emetteurId") Long emetteurId);
}
