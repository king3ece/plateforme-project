package tg.idstechnologie.plateforme.dao.idsdemande.dda;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.dda.TraitementDemandeDachat;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraitementDemandeAchatRepository extends JpaRepository<TraitementDemandeDachat, Long> {

    @Query(value = "SELECT * FROM traitement_demande_achats WHERE is_delete = false AND reference = :ref",
            nativeQuery = true)
    Optional<TraitementDemandeDachat> findByReference(@Param("ref") String ref);

    @Query(value = "SELECT * FROM traitement_demande_achats WHERE is_delete = false AND demande_achat_id = :demandeAchatId ORDER BY create_date ASC",
            nativeQuery = true)
    List<TraitementDemandeDachat> findByDemandeAchatId(@Param("demandeAchatId") Long demandeAchatId);
}
