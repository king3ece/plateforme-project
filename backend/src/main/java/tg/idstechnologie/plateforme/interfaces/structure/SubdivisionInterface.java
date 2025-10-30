package tg.idstechnologie.plateforme.interfaces.structure;


import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.structure.Subdivision;
import tg.idstechnologie.plateforme.response.ResponseModel;


public interface SubdivisionInterface {
    public ResponseModel createEntity(Subdivision subdivision);
    public ResponseModel updateEntity(Subdivision subdivision);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
}
