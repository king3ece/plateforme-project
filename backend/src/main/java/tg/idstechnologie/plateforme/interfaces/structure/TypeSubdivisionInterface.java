package tg.idstechnologie.plateforme.interfaces.structure;


import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.structure.TypeSubdivision;
import tg.idstechnologie.plateforme.response.ResponseModel;

public interface TypeSubdivisionInterface {
    public ResponseModel createEntity(TypeSubdivision typeSubdivision);
    public ResponseModel updateEntity(TypeSubdivision typeSubdivision);
    public ResponseModel getAllTypeSubdivisionsNotDeleted(Pageable pageable);
    public ResponseModel getOneTypeSubdivisionsNotDeleted(String ref);
    public ResponseModel deleteOneTypeSubdivisionsNotDeleted(String ref);
}
