package tg.idstechnologie.plateforme.controller.structure;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.structure.TypeSubdivisionInterface;
import tg.idstechnologie.plateforme.models.structure.TypeSubdivision;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/type_subdivisions")
@RequiredArgsConstructor
public class TypeSubdivisionController {
    private final TypeSubdivisionInterface typeSubdivisionInterface;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = typeSubdivisionInterface.getAllTypeSubdivisionsNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(
            @PathVariable String ref ) {
        ResponseModel response = typeSubdivisionInterface.getOneTypeSubdivisionsNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-type_subdivision/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(
            @PathVariable String ref) {
        ResponseModel response = typeSubdivisionInterface.deleteOneTypeSubdivisionsNotDeleted(ref);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/add-type_subdivision")
    public ResponseEntity<ResponseModel> postEntity(
            @RequestBody TypeSubdivision object
    )
    {
        return ResponseEntity.ok(typeSubdivisionInterface.createEntity(object));
    }

    @PutMapping()
    public ResponseEntity<ResponseModel> putEntity(
            @RequestBody TypeSubdivision object
    )
    {
        return ResponseEntity.ok(typeSubdivisionInterface.updateEntity(object));
    }
}
