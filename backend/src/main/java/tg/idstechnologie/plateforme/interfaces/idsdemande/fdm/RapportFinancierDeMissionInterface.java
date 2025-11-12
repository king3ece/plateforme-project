package tg.idstechnologie.plateforme.interfaces.idsdemande.fdm;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.RapportFinancierDeMission;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.utils.Choix_decisions;

public interface RapportFinancierDeMissionInterface {
    ResponseModel createEntity(RapportFinancierDeMission rapport);

    ResponseModel updateEntity(RapportFinancierDeMission rapport);

    ResponseModel getAllEntityNotDeleted(Pageable pageable);

    ResponseModel getOneEntityNotDeleted(String ref);

    ResponseModel deleteOneEntityNotDeleted(String ref);

    ResponseModel getMyRequests(Pageable pageable);

    ResponseModel getPendingValidations(Pageable pageable);

    ResponseModel traiter(Long id, Choix_decisions decision, String commentaire);
}
