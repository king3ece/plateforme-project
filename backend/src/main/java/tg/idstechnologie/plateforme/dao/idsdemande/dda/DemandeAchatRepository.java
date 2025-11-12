package tg.idstechnologie.plateforme.dao.idsdemande.dda;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.dda.DemandeDachat;

import java.util.Optional;

@Repository
public interface DemandeAchatRepository extends JpaRepository<DemandeDachat, Long> {

    @Query(value = "SELECT * FROM demande_achats WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM demande_achats WHERE is_delete = false",
            nativeQuery = true)
    Page<DemandeDachat> handleAllEntity(Pageable pageable);

    @Query(value = "SELECT * FROM demande_achats WHERE is_delete = false AND reference = :ref",
            nativeQuery = true)
    Optional<DemandeDachat> findByReference(@Param("ref") String ref);

    @Query(value = "SELECT * FROM demande_achats WHERE is_delete = false AND emetteur_id = :emetteurId ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM demande_achats WHERE is_delete = false AND emetteur_id = :emetteurId",
            nativeQuery = true)
    Page<DemandeDachat> findByEmetteurId(@Param("emetteurId") Long emetteurId, Pageable pageable);

    @Query(value = "SELECT da.* FROM demande_achats da " +
            "INNER JOIN validateurs v ON da.validateur_suivant_id = v.id " +
            "WHERE da.is_delete = false AND da.traite = false AND v.user_id = :userId " +
            "ORDER BY da.create_date DESC",
            countQuery = "SELECT COUNT(*) FROM demande_achats da " +
                    "INNER JOIN validateurs v ON da.validateur_suivant_id = v.id " +
                    "WHERE da.is_delete = false AND da.traite = false AND v.user_id = :userId",
            nativeQuery = true)
    Page<DemandeDachat> findPendingValidationsByUserId(@Param("userId") Long userId, Pageable pageable);
}
