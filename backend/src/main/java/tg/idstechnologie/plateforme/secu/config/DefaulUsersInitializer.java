package tg.idstechnologie.plateforme.secu.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.secu.user.*;

@Component
@RequiredArgsConstructor
public class DefaulUsersInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Email réservé pour l’admin par défaut
        final String adminEmail = "admin@plateforme.com";

        // Vérifie s’il existe déjà un ADMIN
        boolean adminRoleExists = userRepository.findByRoles(Role.ADMIN).isPresent();

        // Vérifie si l’email admin existe déjà
        boolean adminEmailExists = userRepository.findByEmail(adminEmail).isPresent();

        if (!adminRoleExists && !adminEmailExists) {
            User admin = User.builder()
                    .name("Super")
                    .lastName("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123")) // ⚠️ change en prod
                    .roles(Role.ADMIN)
                    .enabe(true)
                    .delete(false)
                    .build();

            userRepository.save(admin);
            System.out.println("✅ Utilisateur ADMIN créé : " + adminEmail + " / admin123");
        } else {
            System.out.println("ℹ️ Un ADMIN existe déjà (par rôle ou email).");
        }
        // Email réservé pour l’utilisateur par défaut
        final String userEmail = "user@plateforme.com";

        if (userRepository.findByEmail(userEmail).isEmpty()) {
            User user = User.builder()
                    .name("Default")
                    .lastName("User")
                    .email(userEmail)
                    .password(passwordEncoder.encode("puser123")) // mot de passe par défaut
                    .roles(Role.USER)
                    .enabe(true)
                    .delete(false) // ✅ ajout obligatoire
                    .build();
            userRepository.save(user);
            System.out.println("✅ Utilisateur par défaut créé : " + userEmail);
        }
    }
}
