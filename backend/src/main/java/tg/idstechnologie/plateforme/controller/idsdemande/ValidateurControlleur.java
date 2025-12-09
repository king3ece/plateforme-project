package tg.idstechnologie.plateforme.controller.idsdemande;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.idsdemande.ValidateurInterface;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.dao.idsdemande.ValidateurRepository;
import tg.idstechnologie.plateforme.services.user.CurrentUserService;
import tg.idstechnologie.plateforme.secu.user.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/validateurs")
@RequiredArgsConstructor
public class ValidateurControlleur {
    private final ValidateurInterface validateurInterface;
    private final ValidateurRepository validateurRepository;
    private final CurrentUserService currentUserService;

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

    @GetMapping("/processus/{typeProcessusId}")
    public ResponseEntity<ResponseModel> getValidateursByTypeProcessus(
            @PathVariable Long typeProcessusId) {
        ResponseModel response = validateurInterface.getValidateursByTypeProcessus(typeProcessusId);
        return ResponseEntity.ok(response);
    }

    // ✅ Vérifier si l'utilisateur connecté est validateur
    @GetMapping("/is-validator")
    public ResponseEntity<ResponseModel> isCurrentUserValidator() {
        User currentUser = currentUserService.getCurrentUser();
        Boolean isValidator = validateurRepository.isUserValidator(currentUser.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("isValidator", isValidator != null ? isValidator : false);
        result.put("userId", currentUser.getId());

        return ResponseEntity.ok(new ResponseConstant().ok(result));
    }

    // ✅ Récupérer tous les rôles de validateur de l'utilisateur connecté
    @GetMapping("/my-validations")
    public ResponseEntity<ResponseModel> getMyValidatorRoles() {
        User currentUser = currentUserService.getCurrentUser();
        List<Validateur> validateurs = validateurRepository.findByUserId(currentUser.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("validateurs", validateurs);
        result.put("count", validateurs.size());
        result.put("isValidator", !validateurs.isEmpty());

        return ResponseEntity.ok(new ResponseConstant().ok(result));
    }

    // ✅ Compter le nombre de demandes en attente de validation pour l'utilisateur
    @GetMapping("/pending-count")
    public ResponseEntity<ResponseModel> getPendingValidationsCount() {
        User currentUser = currentUserService.getCurrentUser();
        Integer count = validateurRepository.countByUserId(currentUser.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("count", count != null ? count : 0);
        result.put("hasPending", count != null && count > 0);

        return ResponseEntity.ok(new ResponseConstant().ok(result));
    }
}
