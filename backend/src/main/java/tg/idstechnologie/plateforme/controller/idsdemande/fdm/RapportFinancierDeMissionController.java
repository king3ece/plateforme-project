package tg.idstechnologie.plateforme.controller.idsdemande.fdm;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.idsdemande.fdm.RapportFinancierDeMissionInterface;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.RapportFinancierDeMission;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementRequest;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/rfdms")
@RequiredArgsConstructor
public class RapportFinancierDeMissionController {

    private final RapportFinancierDeMissionInterface rapportInterface;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(rapportInterface.getAllEntityNotDeleted(pageable));
    }

    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOne(@PathVariable String ref) {
        return ResponseEntity.ok(rapportInterface.getOneEntityNotDeleted(ref));
    }

    @DeleteMapping("/{ref}")
    public ResponseEntity<ResponseModel> delete(@PathVariable String ref) {
        return ResponseEntity.ok(rapportInterface.deleteOneEntityNotDeleted(ref));
    }

    @PostMapping("/add-rfdm")
    public ResponseEntity<ResponseModel> create(@RequestBody RapportFinancierDeMission rapport) {
        return ResponseEntity.ok(rapportInterface.createEntity(rapport));
    }

    @PutMapping
    public ResponseEntity<ResponseModel> update(@RequestBody RapportFinancierDeMission rapport) {
        return ResponseEntity.ok(rapportInterface.updateEntity(rapport));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ResponseModel> myRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(rapportInterface.getMyRequests(pageable));
    }

    @GetMapping("/pending-validations")
    public ResponseEntity<ResponseModel> pendingValidations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(rapportInterface.getPendingValidations(pageable));
    }

    @PostMapping("/{id}/traiter")
    public ResponseEntity<ResponseModel> traiter(
            @PathVariable Long id,
            @RequestBody TraitementRequest request) {
        return ResponseEntity.ok(
                rapportInterface.traiter(id, request.getDecision(), request.getCommentaire())
        );
    }
}
