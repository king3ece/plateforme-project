package tg.idstechnologie.plateforme.controller.idsdemande;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.idsdemande.ValidateurInterface;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/validateurs")
@RequiredArgsConstructor
public class ValidateurControlleur {
    private final ValidateurInterface validateurInterface;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = validateurInterface.getAllEntityNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(
            @PathVariable String ref
    ) {

        ResponseModel response = validateurInterface.getOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(
            @PathVariable String ref
    ) {

        ResponseModel response = validateurInterface.deleteOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/add-validateur")
    public ResponseEntity<ResponseModel> postEntity(
            @RequestBody Validateur validateur
    )
    {
        return ResponseEntity.ok(validateurInterface.createEntity(validateur));
    }

    @PutMapping()
    public ResponseEntity<ResponseModel> putEntity(
            @RequestBody Validateur validateur
    )
    {
        return ResponseEntity.ok(validateurInterface.updateEntity(validateur));
    }
}
