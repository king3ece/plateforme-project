package tg.idstechnologie.plateforme.handler;


import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ResponseModel> handleObjectNotValidException(ObjectNotValidException e) {
        ResponseModel body = responseConstant.badRequest(e.getErrorMessage(), null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ResponseModel> handleDuplicateKeyException(DataIntegrityViolationException e) {
        // Logging des erreurs
        ResponseModel body = responseConstant.badRequest("Violation des contraintes d'integrités", null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity<ResponseModel> handleStorageFileNotFound(StorageFileNotFoundException exc) {
        ResponseModel body = responseConstant.badRequest(exc.getMessage(), null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ResponseModel> handleStorageException(StorageException exc) {
        ResponseModel body = responseConstant.badRequest(exc.getMessage(), null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
