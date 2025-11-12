package tg.idstechnologie.plateforme.dao.idsdemande.fdm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementRapportFinancierDeMission;

@Repository
public interface TraitementRapportFinancierDeMissionRepository extends JpaRepository<TraitementRapportFinancierDeMission, Long> {
}
