package tg.idstechnologie.plateforme.controller.idsdemande.fdm;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.interfaces.idsdemande.fdm.FicheDescriptiveMissionInterface;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.FicheDescriptiveMission;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/fdms")
@RequiredArgsConstructor
public class FicheDescriptiveMissionController {

    private final FicheDescriptiveMissionInterface ficheDescriptiveMissionInterface;

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
}
