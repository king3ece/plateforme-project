package tg.idstechnologie.plateforme.controller.structure;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.structure.SubdivisionInterface;
import tg.idstechnologie.plateforme.models.structure.Subdivision;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/subdivisions")
@RequiredArgsConstructor
public class SubdivisionController {
    private final SubdivisionInterface subdivisionInterface;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = subdivisionInterface.getAllEntityNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(
            @PathVariable String ref
    ) {
        ResponseModel response = subdivisionInterface.getOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-subdivision/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(@PathVariable String ref) {
        ResponseModel response = subdivisionInterface.deleteOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/add-subdivision")
    public ResponseEntity<ResponseModel> postEntity(
            @RequestBody Subdivision subdivision)
    {
        return ResponseEntity.ok(subdivisionInterface.createEntity(subdivision));
    }

    @PutMapping()
    public ResponseEntity<ResponseModel> putEntity(
            @RequestBody Subdivision subdivision)
    {
        return ResponseEntity.ok(subdivisionInterface.updateEntity(subdivision));
    }
}
