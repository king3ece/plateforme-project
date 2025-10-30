package tg.idstechnologie.plateforme.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;
import tg.idstechnologie.plateforme.response.ResponseModel;

@Data
@AllArgsConstructor
@Service
public class ResponseConstant {
    public ResponseModel ok(Object object){
        return new ResponseModel(200,"OK", object);
    }

    public ResponseModel noContent(String message){
        return new ResponseModel(204,message, null);
    }

    public ResponseModel badRequest(String message,Object object){
        return new ResponseModel(400,message,object);
    }

    public ResponseModel internalError(String message,Object object){
        return new ResponseModel(500,message,object);
    }
}
