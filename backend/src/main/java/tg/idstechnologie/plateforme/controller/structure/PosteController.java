package tg.idstechnologie.plateforme.controller.structure;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import tg.idstechnologie.plateforme.interfaces.structure.PosteInterface;
import tg.idstechnologie.plateforme.models.structure.Poste;
import tg.idstechnologie.plateforme.response.ResponseModel;

// @RestController
// @RequestMapping("/api/postes")
// @RequiredArgsConstructor
// public class PosteController {
//     private final PosteInterface posteInterface;

//     @GetMapping("/all/not-deleted")
//     public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
//             @RequestParam(defaultValue = "0") int page,
//             @RequestParam(defaultValue = "30") int size) {
//         Pageable pageable = PageRequest.of(page, size);
//         ResponseModel response = posteInterface.getAllEntityNotDeleted(pageable);
//         return ResponseEntity.ok(response);
//     }
//     @GetMapping("/get-poste/{ref}")
//     public ResponseEntity<ResponseModel> getOneEntityNotDeleted(
//             @PathVariable String ref
//             ) {

//         ResponseModel response = posteInterface.getOneEntityNotDeleted(ref);
//         return ResponseEntity.ok(response);
//     }

//     @DeleteMapping("/delete-poste/{ref}")
//     public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(
//             @PathVariable String ref
//     ) {

//         ResponseModel response = posteInterface.deleteOneEntityNotDeleted(ref);
//         return ResponseEntity.ok(response);
//     }
//     @PostMapping("/add-poste")
//     public ResponseEntity<ResponseModel> postEntity(
//             @RequestBody Poste poste
//     )
//     {
//         return ResponseEntity.ok(posteInterface.createEntity(poste));
//     }

//     @PutMapping()
//     public ResponseEntity<ResponseModel> putEntity(
//             @RequestBody Poste poste
//     )
//     {
//         return ResponseEntity.ok(posteInterface.updateEntity(poste));
//     }
// }

@RestController
@RequestMapping("/api/postes")
@RequiredArgsConstructor
public class PosteController {
    private final PosteInterface posteInterface;

    // ✅ Route simplifiée
    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = posteInterface.getAllEntityNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }
    
    // ✅ Route RESTful standard
    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(@PathVariable String ref) {
        ResponseModel response = posteInterface.getOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    // ✅ DELETE standard
    @DeleteMapping("/delete-poste/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(@PathVariable String ref) {
        ResponseModel response = posteInterface.deleteOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/add-poste")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseModel> postEntity(@RequestBody Poste poste) {
        return ResponseEntity.ok(posteInterface.createEntity(poste));
    }

    @PutMapping()
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseModel> putEntity(@RequestBody Poste poste) {
        return ResponseEntity.ok(posteInterface.updateEntity(poste));
    }
}