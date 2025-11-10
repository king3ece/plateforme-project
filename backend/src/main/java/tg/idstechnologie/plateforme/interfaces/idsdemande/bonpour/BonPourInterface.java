package tg.idstechnologie.plateforme.interfaces.idsdemande.bonpour;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.BonPour;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.utils.Choix_decisions;

public interface BonPourInterface {
    public ResponseModel createEntity(BonPour bonPour);
    public ResponseModel updateEntity(BonPour bonPour);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
    public ResponseModel getMyRequests(Pageable pageable);
    public ResponseModel getPendingValidations(Pageable pageable);
    public ResponseModel traiterBonPour(Long bonPourId, Choix_decisions decision, String commentaire);
}
