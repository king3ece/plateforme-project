package tg.idstechnologie.plateforme.dao.idsdemande.fdm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementRapportFinancierDeMission;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraitementRapportFinancierDeMissionRepository extends JpaRepository<TraitementRapportFinancierDeMission, Long> {

    @Query(value = "SELECT * FROM traitement_rapport_financier_missions WHERE is_delete = false AND reference = :ref",
            nativeQuery = true)
    Optional<TraitementRapportFinancierDeMission> findByReference(@Param("ref") String ref);

    @Query(value = "SELECT * FROM traitement_rapport_financier_missions WHERE is_delete = false AND rapport_financier_id = :rapportFinancierId ORDER BY create_date ASC",
            nativeQuery = true)
    List<TraitementRapportFinancierDeMission> findByRapportFinancierId(@Param("rapportFinancierId") Long rapportFinancierId);
}
