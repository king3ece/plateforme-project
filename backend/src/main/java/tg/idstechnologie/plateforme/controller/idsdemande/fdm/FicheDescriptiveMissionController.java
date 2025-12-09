package tg.idstechnologie.plateforme.controller.idsdemande.fdm;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tg.idstechnologie.plateforme.interfaces.idsdemande.fdm.FicheDescriptiveMissionInterface;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.FicheDescriptiveMission;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementRequest;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.file_upload.StorageService;

@RestController
@RequestMapping("/api/fdms")
@RequiredArgsConstructor
public class FicheDescriptiveMissionController {

    private final FicheDescriptiveMissionInterface ficheDescriptiveMissionInterface;
    private final StorageService storageService;

    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = ficheDescriptiveMissionInterface.getAllEntityNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(
            @PathVariable String ref
    ) {

        ResponseModel response = ficheDescriptiveMissionInterface.getOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(
            @PathVariable String ref
    ) {

        ResponseModel response = ficheDescriptiveMissionInterface.deleteOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/add-fdm")
    public ResponseEntity<ResponseModel> postEntity(
            @RequestBody FicheDescriptiveMission ficheDescriptiveMission
    )
    {
        return ResponseEntity.ok(ficheDescriptiveMissionInterface.createEntity(ficheDescriptiveMission));
    }

    @PutMapping()
    public ResponseEntity<ResponseModel> putEntity(
            @RequestBody FicheDescriptiveMission ficheDescriptiveMission
    )
    {
        return ResponseEntity.ok(ficheDescriptiveMissionInterface.updateEntity(ficheDescriptiveMission));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ResponseModel> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = ficheDescriptiveMissionInterface.getMyRequests(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-validations")
    public ResponseEntity<ResponseModel> getPendingValidations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = ficheDescriptiveMissionInterface.getPendingValidations(pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/traiter")
    public ResponseEntity<ResponseModel> traiterFDM(
            @PathVariable Long id,
            @RequestBody TraitementRequest request) {
        ResponseModel response = ficheDescriptiveMissionInterface.traiterFDM(
                id,
                request.getDecision(),
                request.getCommentaire()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reference}/pieces-jointes")
    public ResponseEntity<ResponseModel> uploadFilesForFDM(
            @PathVariable String reference,
            @RequestParam("files") MultipartFile[] files) {
        ResponseModel response = ficheDescriptiveMissionInterface.uploadFilesToFDM(reference, files);
        return ResponseEntity.ok(response);
    }
}
