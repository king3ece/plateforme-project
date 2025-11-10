package tg.idstechnologie.plateforme.controller.idsdemande.bonpour;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.idsdemande.bonpour.BonPourInterface;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.BonPour;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.TraitementRequest;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/bonpours")
@RequiredArgsConstructor
public class BonPourController {

    private final BonPourInterface bonPourInterface;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = bonPourInterface.getAllEntityNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(
            @PathVariable String ref
    ) {
        ResponseModel response = bonPourInterface.getOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(
            @PathVariable String ref
    ) {
        ResponseModel response = bonPourInterface.deleteOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-bonpour")
    public ResponseEntity<ResponseModel> postEntity(
            @RequestBody BonPour bonPour
    ) {
        return ResponseEntity.ok(bonPourInterface.createEntity(bonPour));
    }

    @PutMapping()
    public ResponseEntity<ResponseModel> putEntity(
            @RequestBody BonPour bonPour
    ) {
        return ResponseEntity.ok(bonPourInterface.updateEntity(bonPour));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ResponseModel> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = bonPourInterface.getMyRequests(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-validations")
    public ResponseEntity<ResponseModel> getPendingValidations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = bonPourInterface.getPendingValidations(pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/traiter")
    public ResponseEntity<ResponseModel> traiterBonPour(
            @PathVariable Long id,
            @RequestBody TraitementRequest request) {
        ResponseModel response = bonPourInterface.traiterBonPour(
                id,
                request.getDecision(),
                request.getCommentaire()
        );
        return ResponseEntity.ok(response);
    }
}
