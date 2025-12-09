package tg.idstechnologie.plateforme.controller.idsdemande.dda;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.idsdemande.dda.DemandeAchatInterface;
import tg.idstechnologie.plateforme.models.idsdemande.dda.DemandeDachat;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementRequest;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/ddas")
@RequiredArgsConstructor
public class DemandeAchatController {

    private final DemandeAchatInterface demandeAchatInterface;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(demandeAchatInterface.getAllEntityNotDeleted(pageable));
    }

    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOne(@PathVariable String ref) {
        return ResponseEntity.ok(demandeAchatInterface.getOneEntityNotDeleted(ref));
    }

    @DeleteMapping("/{ref}")
    public ResponseEntity<ResponseModel> delete(@PathVariable String ref) {
        return ResponseEntity.ok(demandeAchatInterface.deleteOneEntityNotDeleted(ref));
    }

    @PostMapping("/add-dda")
    public ResponseEntity<ResponseModel> create(@RequestBody DemandeDachat demande) {
        return ResponseEntity.ok(demandeAchatInterface.createEntity(demande));
    }

    @PutMapping
    public ResponseEntity<ResponseModel> update(@RequestBody DemandeDachat demande) {
        return ResponseEntity.ok(demandeAchatInterface.updateEntity(demande));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ResponseModel> myRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(demandeAchatInterface.getMyRequests(pageable));
    }

    @GetMapping("/pending-validations")
    public ResponseEntity<ResponseModel> pendingValidations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(demandeAchatInterface.getPendingValidations(pageable));
    }

    @PostMapping("/{id}/traiter")
    public ResponseEntity<ResponseModel> traiter(
            @PathVariable Long id,
            @RequestBody TraitementRequest request) {
        return ResponseEntity.ok(
                demandeAchatInterface.traiter(id, request.getDecision(), request.getCommentaire())
        );
    }

    @PostMapping("/{id}/generer-bon-commande")
    public ResponseEntity<ResponseModel> genererBonCommande(@PathVariable Long id) {
        if (demandeAchatInterface instanceof tg.idstechnologie.plateforme.services.idsdemande.dda.DemandeAchatService service) {
            return ResponseEntity.ok(service.genererBonCommande(id));
        }
        throw new RuntimeException("Service non disponible");
    }

    @PostMapping("/{id}/confirmer-commande")
    public ResponseEntity<ResponseModel> confirmerCommande(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> body) {
        boolean commander = body.getOrDefault("commander", false);
        if (demandeAchatInterface instanceof tg.idstechnologie.plateforme.services.idsdemande.dda.DemandeAchatService service) {
            return ResponseEntity.ok(service.confirmerCommande(id, commander));
        }
        throw new RuntimeException("Service non disponible");
    }
}
