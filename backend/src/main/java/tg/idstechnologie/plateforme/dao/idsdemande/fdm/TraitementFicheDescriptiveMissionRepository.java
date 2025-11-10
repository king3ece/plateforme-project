package tg.idstechnologie.plateforme.dao.idsdemande.fdm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementFicheDescriptiveMission;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraitementFicheDescriptiveMissionRepository extends JpaRepository<TraitementFicheDescriptiveMission, Long> {

    @Query(value = "SELECT * FROM traitement_fiche_descriptive_missions WHERE is_delete = false AND reference = :ref",
            nativeQuery = true)
    Optional<TraitementFicheDescriptiveMission> findByReference(@Param("ref") String ref);

    @Query(value = "SELECT * FROM traitement_fiche_descriptive_missions WHERE is_delete = false AND fiche_descriptive_mission_id = :fdmId ORDER BY create_date ASC",
            nativeQuery = true)
    List<TraitementFicheDescriptiveMission> findByFicheDescriptiveMissionId(@Param("fdmId") Long fdmId);
}
