package tg.idstechnologie.plateforme.dao.idsdemande.fdm;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.FicheDescriptiveMission;

import java.util.Optional;

@Repository
public interface FicheDescriptiveMissionRepository  extends JpaRepository<FicheDescriptiveMission, Long> {

    @Query(value = "SELECT * FROM fiche_descriptive_missions WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM fiche_descriptive_missions WHERE is_delete = false ORDER BY create_date DESC",
            nativeQuery = true)
    Page<FicheDescriptiveMission> handleAllEntity(Pageable pageable);

    @Query(value = "select * from fiche_descriptive_missions  where is_delete = false and reference = :ref",
            nativeQuery = true
    )
    Optional<FicheDescriptiveMission> findByReference(String ref);




}
