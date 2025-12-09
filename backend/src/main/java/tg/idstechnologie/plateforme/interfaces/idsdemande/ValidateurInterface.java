package tg.idstechnologie.plateforme.interfaces.idsdemande;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.response.ResponseModel;

public interface ValidateurInterface {
    public ResponseModel createEntity(Validateur validateur);
    public ResponseModel updateEntity(Validateur validateur);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
    public ResponseModel getValidateursByTypeProcessus(Long typeProcessusId);
}
