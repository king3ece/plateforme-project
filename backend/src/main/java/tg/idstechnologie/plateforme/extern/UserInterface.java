package tg.idstechnologie.plateforme.extern;

import org.springframework.data.domain.Pageable;
import tg.idstechnologie.plateforme.secu.user.*;
import tg.idstechnologie.plateforme.response.ResponseModel;

public interface UserInterface {
    public ResponseModel createEntity(User user);
    public ResponseModel updateEntity(User user);
    public ResponseModel getAllEntityNotDeleted(Pageable pageable);
    public ResponseModel getOneEntityNotDeleted(String ref);
    public ResponseModel deleteOneEntityNotDeleted(String ref);
}
