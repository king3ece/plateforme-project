// 2. EmailServiceImpl - Version corrigée et synchronisée
package tg.idstechnologie.plateforme.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender emailSender;

    @Value("${app.base-url:http://localhost:9091}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Envoyer un email avec le nouveau mot de passe
     */
    @Override
    @Async
    public void sendMailNewPassword(String to, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject("New Password");
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setText(EmailUtils.getNewPassword(password));
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email de nouveau mot de passe: " + exception.getMessage());
            throw new RuntimeException(exception.getMessage());
        }
    }

    /**
     * Envoyer un email pour une nouvelle fiche descriptive de mission
     */
    @Override
    @Async
    public void sendMailNewFdm(String to, String id, String emetteur) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject("NOUVELLE FICHE DESCRIPTIVE DE MISSION : " + id);
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setCc(emetteur);
            message.setText(EmailUtils.newFdm());
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email FDM: " + exception.getMessage());
            throw new RuntimeException(exception.getMessage());
        }
    }

    /**
     * Envoyer l'email d'activation de compte
     */
    @Override
    @Async
    public void sendActivationEmail(String toEmail, String activationToken, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Activation de votre compte");

            String activationUrl = baseUrl + "api/auth/activate?token=" + activationToken;

            String emailBody = String.format(
                    "Bonjour %s,\n\n" +
                            "Merci de vous être inscrit sur notre plateforme.\n" +
                            "Pour activer votre compte, cliquez sur le lien suivant :\n\n" +
                            "%s\n\n" +
                            "Ce lien expire dans 24 heures.\n\n" +
                            "Si vous n'avez pas créé de compte, ignorez cet email.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe de support",
                    userName, activationUrl
            );

            message.setText(emailBody);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email d'activation: " + exception.getMessage());
            throw new RuntimeException(exception.getMessage());
        }
    }

    /**
     * Envoi générique d'un email avec sujet et contenu fournis.
     */
    @Override
    @Async
    public void sendSimpleMail(String to, String subject, String content, String... cc) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject(subject);
            message.setFrom(fromEmail);
            message.setTo(to);
            if (cc != null && cc.length > 0) {
                message.setCc(cc);
            }
            message.setText(content);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email: " + exception.getMessage());
            throw new RuntimeException(exception.getMessage());
        }
    }
}
