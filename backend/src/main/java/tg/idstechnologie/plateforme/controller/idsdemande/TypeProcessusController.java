package tg.idstechnologie.plateforme.controller.idsdemande;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.idsdemande.TypeProcessusInterface;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/type_processus")
@RequiredArgsConstructor
public class TypeProcessusController {
    private final TypeProcessusInterface typeProcessusInterface;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = typeProcessusInterface.getAllEntityNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(
            @PathVariable String ref
    ) {

        ResponseModel response = typeProcessusInterface.getOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(
            @PathVariable String ref
    ) {

        ResponseModel response = typeProcessusInterface.deleteOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/add-type_processus")
    public ResponseEntity<ResponseModel> postEntity(
            @RequestBody TypeProcessus typeProcessus
    )
    {
        return ResponseEntity.ok(typeProcessusInterface.createEntity(typeProcessus));
    }

    @PutMapping()
    public ResponseEntity<ResponseModel> putEntity(
            @RequestBody TypeProcessus typeProcessus
    )
    {
        return ResponseEntity.ok(typeProcessusInterface.updateEntity(typeProcessus));
    }
}
