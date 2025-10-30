package tg.idstechnologie.plateforme.interfaces.idsdemande;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;
import tg.idstechnologie.plateforme.response.ResponseModel;

public interface TypeProcessusInterface {
    public ResponseModel createEntity(TypeProcessus typeProcessus);
    public ResponseModel updateEntity(TypeProcessus typeProcessus);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
}
