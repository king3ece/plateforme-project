package tg.idstechnologie.plateforme.handler;


import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.exceptions.StorageException;
import tg.idstechnologie.plateforme.exceptions.StorageFileNotFoundException;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestControllerAdvice
@RequiredArgsConstructor
@Data
public class GlobalExceptionHandler {
    private final ResponseConstant responseConstant;

    @ExceptionHandler(ObjectNotValidException.class)
    public ResponseModel handleObjectNotValidException(ObjectNotValidException e) {
        return responseConstant.badRequest(e.getErrorMessage(),null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseModel handleDuplicateKeyException(DataIntegrityViolationException e) {
        //Loggin des erreurs
        return responseConstant.badRequest("Violation des contraintes d'integrités",null);
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseModel handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return responseConstant.badRequest(exc.getMessage(),null);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseModel handleStorageException(StorageException exc) {
        return responseConstant.badRequest(exc.getMessage(),null);
    }
}
