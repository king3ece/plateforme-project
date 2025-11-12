package tg.idstechnologie.plateforme.dao.idsdemande.dda;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.dda.LigneDemandeAchat;

import java.util.List;

@Repository
public interface LigneDemandeAchatRepository extends JpaRepository<LigneDemandeAchat, Long> {
    List<LigneDemandeAchat> findByDemandeDachatId(Long demandeId);
}
