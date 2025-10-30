package tg.idstechnologie.plateforme.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
public class ObjectNotValidException extends RuntimeException{
    private String errorMessage;
}
