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
            message.setSubject("Nouveau mot de passe");
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setText(EmailUtils.getNewPassword(password));
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email de nouveau mot de passe: " + exception.getMessage());
        }
    }

    /**
     * Envoyer un email pour une nouvelle demande en attente de validation
     */
    @Override
    @Async
    public void sendMailNewDemande(String toEmail, String typeProcessus, String reference, String emetteurNom) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject(EmailUtils.getSubjectNewDemande(typeProcessus, reference));
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setText(EmailUtils.getBodyNewDemande(typeProcessus, reference, emetteurNom));
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email nouvelle demande: " + exception.getMessage());
        }
    }

    /**
     * Envoyer un email pour notifier l'approbation d'une demande
     */
    @Override
    @Async
    public void sendMailApprobation(String toEmail, String typeProcessus, String reference) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject(EmailUtils.getSubjectApprobation(typeProcessus, reference));
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setText(EmailUtils.getBodyApprobation(typeProcessus, reference));
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email d'approbation: " + exception.getMessage());
        }
    }

    /**
     * Envoyer un email pour notifier le rejet d'une demande
     */
    @Override
    @Async
    public void sendMailRejet(String toEmail, String typeProcessus, String reference, String rejeteurNom, String raison) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject(EmailUtils.getSubjectRejet(typeProcessus, reference));
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setText(EmailUtils.getBodyRejet(typeProcessus, reference, rejeteurNom, raison));
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email de rejet: " + exception.getMessage());
        }
    }

    /**
     * Envoyer un email pour notifier un retour pour correction
     */
    @Override
    @Async
    public void sendMailCorrection(String toEmail, String typeProcessus, String reference, String raison) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject(EmailUtils.getSubjectCorrection(typeProcessus, reference));
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setText(EmailUtils.getBodyCorrection(typeProcessus, reference, raison));
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email de correction: " + exception.getMessage());
        }
    }

    /**
     * Envoyer un email aux comptables pour une demande approuvée
     */
    @Override
    @Async
    public void sendMailComptable(String toEmail, String typeProcessus, String reference, String emetteurNom) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject(EmailUtils.getSubjectComptable(typeProcessus, reference));
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setText(EmailUtils.getBodyComptable(typeProcessus, reference, emetteurNom));
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email comptable: " + exception.getMessage());
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
                            "L'équipe IDS DEMANDE",
                    userName, activationUrl
            );

            message.setText(emailBody);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email d'activation: " + exception.getMessage());
        }
    }

    /**
     * Méthode générique pour compatibilité (ancienne méthode)
     * @deprecated Utiliser les méthodes spécifiques à la place
     */
    @Override
    @Async
    @Deprecated
    public void sendMailNewFdm(String to, String id, String emetteur) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject("NOUVELLE DEMANDE : " + id);
            message.setFrom(fromEmail);
            message.setTo(to);
            if (emetteur != null && !emetteur.isEmpty() && emetteur.contains("@")) {
                message.setCc(emetteur);
            }
            message.setText("Vous avez une nouvelle demande en attente de traitement.\n\nRéférence: " + id + "\n\nCordialement, l'équipe IDS DEMANDE.");
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email: " + exception.getMessage());
        }
    }
}
