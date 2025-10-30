package tg.idstechnologie.plateforme.interfaces.data_models;


import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.models.data_models.FileData;
import tg.idstechnologie.plateforme.response.ResponseModel;

public interface FileDataInterface {
    public ResponseModel createEntity(FileData fileData);
    public ResponseModel updateEntity(FileData fileData);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
}
