package tg.idstechnologie.plateforme.extern;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.response.UserResponse;
import tg.idstechnologie.plateforme.secu.user.ChangePasswordRequest;
import tg.idstechnologie.plateforme.secu.user.User;
import tg.idstechnologie.plateforme.secu.user.UserService;
import tg.idstechnologie.plateforme.services.user.CurrentUserService;
import tg.idstechnologie.plateforme.response.ResponseModel;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserInterface userInterface;
    private final CurrentUserService currentUserService;
    /**
     * ✅ Changement de mot de passe
     */
    @PatchMapping
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal connectedUser
    ) {
        userService.changePassword(request, connectedUser);
        return ResponseEntity.ok().build();
    }

     /**
     * ✅ Récupère les informations de l'utilisateur actuellement connecté
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        // Récupère la référence de l'utilisateur connecté
        String ref = currentUserService.getCurrentUserRef();

        // Recherche de l'utilisateur dans la base de données
        User user = userRepository.findByReference(ref)
                .orElseThrow(() -> new ObjectNotValidException("Utilisateur introuvable"));

        // Retourne la réponse avec les infos utilisateur
        return ResponseEntity.ok(new UserResponse(user));
    }

    /**
     * Création d'un user
     */
    // @PostMapping
    // public ResponseEntity<ResponseModel> createUser(@RequestBody User user) {
    //     ResponseModel response = userService.createEntity(user);
    //     return ResponseEntity.status(response.getCode()).body(response);
    // }

    /**
     * Mise à jour
     */
    @PutMapping
    public ResponseEntity<ResponseModel> putEntity(@RequestBody User user) {
        return ResponseEntity.ok(userInterface.updateEntity(user));
    }

    /**
     * Listing paginé
     */
    @GetMapping("/not-deleted")
    public ResponseEntity<ResponseModel> getAllEntityNotDeleted(
            @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        ResponseModel response = userInterface.getAllEntityNotDeleted(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère par référence
     */
    @GetMapping("/{ref}")
    public ResponseEntity<ResponseModel> getOneEntityNotDeleted(@PathVariable String ref) {
        ResponseModel response = userInterface.getOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }

    /**
     * Soft-delete par référence
     */
    @DeleteMapping("/delete-user/{ref}")
    public ResponseEntity<ResponseModel> deleteOneEntityNotDeleted(@PathVariable String ref) {
        ResponseModel response = userInterface.deleteOneEntityNotDeleted(ref);
        return ResponseEntity.ok(response);
    }
   
}
