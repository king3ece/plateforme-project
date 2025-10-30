package tg.idstechnologie.plateforme.interfaces.idsdemande.fdm;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.FicheDescriptiveMission;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.utils.Choix_decisions;

public interface FicheDescriptiveMissionInterface {
    public ResponseModel createEntity(FicheDescriptiveMission ficheDescriptiveMission);
    public ResponseModel updateEntity(FicheDescriptiveMission ficheDescriptiveMission);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
    public ResponseModel getMyRequests(Pageable pageable);
    public ResponseModel getPendingValidations(Pageable pageable);
    public ResponseModel traiterFDM(Long fdmId, Choix_decisions decision, String commentaire);
}
