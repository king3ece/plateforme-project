package tg.idstechnologie.plateforme.interfaces.idsdemande.dda;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.idsdemande.dda.DemandeDachat;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.utils.Choix_decisions;

public interface DemandeAchatInterface {
    ResponseModel createEntity(DemandeDachat demande);

    ResponseModel updateEntity(DemandeDachat demande);

    ResponseModel getAllEntityNotDeleted(Pageable pageable);

    ResponseModel getOneEntityNotDeleted(String ref);

    ResponseModel deleteOneEntityNotDeleted(String ref);

    ResponseModel getMyRequests(Pageable pageable);

    ResponseModel getPendingValidations(Pageable pageable);

    ResponseModel traiter(Long id, Choix_decisions decision, String commentaire);
}
