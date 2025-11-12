package tg.idstechnologie.plateforme.dao.idsdemande.dda;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.dda.TraitementDemandeDachat;

@Repository
public interface TraitementDemandeAchatRepository extends JpaRepository<TraitementDemandeDachat, Long> {
}
