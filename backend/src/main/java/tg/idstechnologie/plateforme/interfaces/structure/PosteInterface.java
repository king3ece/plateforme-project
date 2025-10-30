package tg.idstechnologie.plateforme.interfaces.structure;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.structure.Poste;
import tg.idstechnologie.plateforme.response.ResponseModel;

public interface PosteInterface {
    public ResponseModel createEntity(Poste poste);
    public ResponseModel updateEntity(Poste poste);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
}
