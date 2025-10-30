package tg.idstechnologie.plateforme.services.user;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.secu.user.User;

@Service
public class CurrentUserService {

    /**
     * Récupère la référence de l'utilisateur actuellement connecté.
     */
    public String getCurrentUserRef() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            throw new ObjectNotValidException("Connectez-vous !");
        }

        User userPrincipal = (User) authentication.getPrincipal();

        if (userPrincipal.getReference() == null ||
                userPrincipal.getReference().isEmpty() ||
                userPrincipal.getReference().isBlank()) {
            throw new ObjectNotValidException("Connectez-vous !!");
        }

        return userPrincipal.getReference();
    }

    /**
     * Récupère l'objet User complet de l'utilisateur connecté.
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            throw new ObjectNotValidException("Connectez-vous !");
        }

        return (User) authentication.getPrincipal();
    }

    // Ancienne méthode potentielle pour récupérer un utilisateur par référence depuis la base.
    // Gardée en commentaire au cas où elle serait utile plus tard.
    /*
    public User findByReference(String reference) {
        return userRepository.findByReference(reference)
                .orElseThrow(() -> new ObjectNotFoundException("Utilisateur non trouvé !"));
    }
    */
}
