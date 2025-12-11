package tg.idstechnologie.plateforme.secu.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.secu.user.Role;
import tg.idstechnologie.plateforme.secu.user.User;

@Component
@RequiredArgsConstructor
public class DefaulUsersInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Vérifier si l'utilisateur admin existe déjà
        if (userRepository.findByEmail("admin@idstechnologie.com").isEmpty()) {
            
            // ✅ ÉTAPE 1 : Créer l'utilisateur système
            User systemUser = User.builder()
                    .name("System")
                    .lastName("Admin")
                    .email("system@idstechnologie.com")
                    .password(passwordEncoder.encode("SystemPassword123"))
                    .roles(Role.ADMIN)
                    .enable(true)
                    .delete(false)
                    .build();
            
            // Sauvegarder l'utilisateur système (createdBy sera null pour le premier)
            User savedSystemUser = userRepository.save(systemUser);
            
            // ✅ ÉTAPE 2 : Récupérer l'ID du système user
            Long systemUserId = savedSystemUser.getId();
            
            // ✅ ÉTAPE 3 : Mettre à jour avec son propre ID comme createdBy
            savedSystemUser.setCreatedBy(systemUserId);
            userRepository.save(savedSystemUser);
            
            // ✅ ÉTAPE 4 : Créer l'utilisateur admin
            User adminUser = User.builder()
                    .name("Admin")
                    .lastName("Plateforme")
                    .email("admin@idstechnologie.com")
                    .password(passwordEncoder.encode("AdminPassword123"))
                    .roles(Role.ADMIN)
                    .enable(true)
                    .delete(false)
                    .build();
            
            // ✅ Remplir createdBy avec l'ID du système
            adminUser.setCreatedBy(systemUserId);
            userRepository.save(adminUser);
            
            // ✅ ÉTAPE 5 : Créer l'utilisateur par défaut
            User userDefault = User.builder()
                    .name("User")
                    .lastName("Default")
                    .email("user@idstechnologie.com")
                    .password(passwordEncoder.encode("UserPassword123"))
                    .roles(Role.USER)
                    .enable(true)
                    .delete(false)
                    .build();
            
            // ✅ Remplir createdBy avec l'ID du système
            userDefault.setCreatedBy(systemUserId);
            userRepository.save(userDefault);
            
            }
    }
}