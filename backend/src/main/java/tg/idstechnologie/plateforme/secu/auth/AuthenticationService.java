package tg.idstechnologie.plateforme.secu.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tg.idstechnologie.plateforme.dao.user.TokenRepository;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.dao.structure.PosteRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.secu.config.JwtService;
import tg.idstechnologie.plateforme.secu.token.Token;
import tg.idstechnologie.plateforme.secu.token.TokenType;
import tg.idstechnologie.plateforme.secu.user.Role;
import tg.idstechnologie.plateforme.secu.user.User;
import tg.idstechnologie.plateforme.services.user.CurrentUserService;
import tg.idstechnologie.plateforme.mail.EmailService;
import tg.idstechnologie.plateforme.models.structure.Poste;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PosteRepository posteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ResponseConstant responseConstant;
    private final CurrentUserService currentUserService;
    private final EmailService emailService;

    /**
     * Inscription d'un nouvel utilisateur avec activation par email
     */
    public ResponseModel register(RegisterRequest request) {
        // Validations des champs obligatoires
        if(request.getEmail() == null || request.getEmail().isEmpty() || request.getEmail().isBlank()) {
            throw new ObjectNotValidException("Email obligatoire");
        }

        if(request.getLastName() == null || request.getLastName().isEmpty() || request.getLastName().isBlank()) {
            throw new ObjectNotValidException("Last name obligatoire");
        }

        if(request.getName() == null || request.getName().isEmpty() || request.getName().isBlank()) {
            throw new ObjectNotValidException("Name obligatoire");
        }

        if(request.getPassword() == null || request.getPassword().isEmpty() || request.getPassword().isBlank()) {
            throw new ObjectNotValidException("Password obligatoire");
        }

        // Vérifier si l'email existe déjà
        if(repository.findByEmail(request.getEmail()).isPresent()) {
            throw new ObjectNotValidException("Cet email est déjà utilisé");
        }

        // Générer le token d'activation
        String activationToken = UUID.randomUUID().toString();

        // ✅ FIX : Récupérer l'ID du user actuellement connecté (ou système par défaut)
        Long createdById = null;
        try {
            // Si un utilisateur est connecté, utiliser son ID
            String currentUserRef = currentUserService.getCurrentUserRef();
            Optional<User> currentUser = repository.findByReference(currentUserRef);
            if (currentUser.isPresent()) {
                createdById = currentUser.get().getId();
            }
        } catch (Exception e) {
            // Pas d'utilisateur connecté, on va chercher le user système
        }

        // Si pas d'utilisateur connecté, utiliser l'ID du user système
        if (createdById == null) {
            Optional<User> systemUser = repository.findByEmail("system@idstechnologie.com");
            if (systemUser.isPresent()) {
                createdById = systemUser.get().getId();
            } else {
                // Si pas de user système, utiliser un ID par défaut (1)
                createdById = 1L;
            }
        }

        // Créer l'utilisateur
        User user = User.builder()
                .name(request.getName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .enable(false) // Compte désactivé par défaut
                .delete(false)
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Role.USER)
                .activationToken(activationToken)
                .activationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        // ✅ FIX : Remplir createdBy avec le setter (pas le builder car c'est un field hérité)
        user.setCreatedBy(createdById);

        // ✅ FIX : Assigner le poste s'il est fourni
        if (request.getPosteRef() != null && !request.getPosteRef().isBlank()) {
            Optional<Poste> poste = posteRepository.findByReference(request.getPosteRef());
            poste.ifPresent(user::setPoste);
        }

        User savedUser = repository.save(user);

        // Envoyer l'email d'activation
        try {
            emailService.sendActivationEmail(
                    savedUser.getEmail(),
                    activationToken,
                    savedUser.getName()
            );
        } catch (Exception e) {
            // Log l'erreur mais ne pas faire échouer l'inscription
            System.err.println("Erreur lors de l'envoi de l'email d'activation: " + e.getMessage());
        }

        return responseConstant.ok("Compte créé avec succès. Vérifiez votre email pour l'activer.");
    }

    /**
     * Authentification d'un utilisateur
     */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        
        // Authentifier avec Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Récupérer l'utilisateur
        Optional<User> userOpt = repository.findByEmail(request.getEmail());

        if(userOpt.isEmpty()) {
            throw new ObjectNotValidException("Email non trouvé");
        }

        User user = userOpt.get();

        // Vérifier si le compte est activé
        if(!user.getEnable()) {
            throw new ObjectNotValidException("Compte non activé. Vérifiez votre email.");
        }

        // Vérifier si le compte n'est pas supprimé
        if(user.getDelete()) {
            throw new ObjectNotValidException("Compte désactivé");
        }

        // Générer le token JWT
        var jwtToken = jwtService.generateToken(user);

        // Révoquer les anciens tokens
        revokeAllUserTokens(user);

        // Sauvegarder le nouveau token
        saveUserToken(user, jwtToken);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    /**
     * Activer le compte utilisateur avec le token d'activation
     */
    public ResponseModel activateUser(String activationToken) {
        if(activationToken == null || activationToken.isBlank()) {
            throw new ObjectNotValidException("Token d'activation obligatoire");
        }

        Optional<User> userOpt = repository.findByActivationToken(activationToken);

        if(userOpt.isEmpty()) {
            throw new ObjectNotValidException("Token d'activation invalide");
        }

        User user = userOpt.get();

        // Vérifier si le compte est déjà activé
        if(user.getEnable()) {
            return responseConstant.ok("Compte déjà activé");
        }

        // Vérifier si le token n'a pas expiré
        if(user.getActivationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ObjectNotValidException("Token d'activation expiré. Demandez un nouveau lien.");
        }

        // Activer le compte
        user.setEnable(true);
        user.setActivationToken(null); // Supprimer le token après utilisation
        user.setActivationTokenExpiry(null);

        repository.save(user);

        return responseConstant.ok("Compte activé avec succès. Vous pouvez maintenant vous connecter.");
    }

    /**
     * Renvoyer l'email d'activation
     */
    public ResponseModel resendActivationEmail(String email) {
        if(email == null || email.isBlank()) {
            throw new ObjectNotValidException("Email obligatoire");
        }

        Optional<User> userOpt = repository.findByEmail(email);

        if(userOpt.isEmpty()) {
            throw new ObjectNotValidException("Aucun compte trouvé avec cet email");
        }

        User user = userOpt.get();

        // Vérifier si le compte est déjà activé
        if(user.getEnable()) {
            throw new ObjectNotValidException("Ce compte est déjà activé");
        }

        // Générer un nouveau token d'activation
        String newActivationToken = UUID.randomUUID().toString();
        user.setActivationToken(newActivationToken);
        user.setActivationTokenExpiry(LocalDateTime.now().plusHours(24));

        repository.save(user);

        // Renvoyer l'email
        try {
            emailService.sendActivationEmail(
                    user.getEmail(),
                    newActivationToken,
                    user.getName()
            );
            return responseConstant.ok("Email d'activation renvoyé avec succès");
        } catch (Exception e) {
            throw new ObjectNotValidException("Erreur lors de l'envoi de l'email");
        }
    }

    /**
     * Sauvegarder un token JWT en base de données
     */
    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    /**
     * Révoquer tous les tokens valides d'un utilisateur
     */
    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;

        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }
}