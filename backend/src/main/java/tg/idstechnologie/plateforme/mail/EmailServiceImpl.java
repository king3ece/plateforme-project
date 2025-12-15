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
     * Notification d'une nouvelle FDM en attente de validation
     */
    @Override
    @Async
    public void sendFdmValidationNotification(String to, String titre, String nom, String prenom, Long fdmId, String typeProcessusCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("NOUVELLE FICHE DESCRIPTIVE DE MISSION");

            String emailBody = String.format(
                    "%s\n%s %s,\n\n" +
                            "Vous avez une nouvelle fiche descriptive de mission en attente de traitement.\n\n" +
                            "REFERENCE DE LA DEMANDE : %d%s\n\n" +
                            "Cordialement,\n" +
                            "L'équipe IDS DEMANDE",
                    titre, nom, prenom, fdmId, typeProcessusCode
            );

            message.setText(emailBody);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email de validation FDM: " + exception.getMessage());
        }
    }

    /**
     * Notification d'approbation de FDM
     */
    @Override
    @Async
    public void sendFdmApprovalNotification(String to, String titre, String nom, String prenom, String dateEmission, Long fdmId, String typeProcessusCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("ACCORD DE MISSION");

            String emailBody = String.format(
                    "%s\n%s %s,\n\n" +
                            "Votre fiche descriptive de mission émise le %s est validée.\n\n" +
                            "REFERENCE DE LA DEMANDE : %d%s\n\n" +
                            "Cordialement,\n" +
                            "L'équipe IDS DEMANDE",
                    titre, nom, prenom, dateEmission, fdmId, typeProcessusCode
            );

            message.setText(emailBody);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email d'approbation FDM: " + exception.getMessage());
        }
    }

    /**
     * Notification de rejet de FDM
     */
    @Override
    @Async
    public void sendFdmRejectionNotification(String to, String titre, String nom, String prenom, String dateEmission,
                                             String raisonRejet, Long fdmId, String typeProcessusCode,
                                             String rejeteurTitre, String rejeteurNom) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("NOTIFICATION DE REJET DE DEMANDE DE MISSION");

            String emailBody = String.format(
                    "%s %s %s,\n\n" +
                            "Votre demande de mission émise le %s vient d'être rejetée par %s %s.\n" +
                            "Raison du rejet: %s.\n\n" +
                            "REFERENCE DE LA DEMANDE : %d%s\n\n" +
                            "Cordialement,\n" +
                            "L'équipe IDS DEMANDE",
                    titre, nom, prenom, dateEmission, rejeteurTitre, rejeteurNom, raisonRejet, fdmId, typeProcessusCode
            );

            message.setText(emailBody);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email de rejet FDM: " + exception.getMessage());
        }
    }

    /**
     * Notification de besoin de correction
     */
    @Override
    @Async
    public void sendFdmCorrectionNotification(String to, String titre, String nom, String prenom, String dateEmission,
                                              String raisonCorrection, Long fdmId, String typeProcessusCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("BESOIN DE CORRECTION");

            String emailBody = String.format(
                    "%s\n%s %s,\n\n" +
                            "Votre fiche descriptive de mission émise le %s vous est retournée pour correction.\n" +
                            "Raison du retour: %s.\n\n" +
                            "REFERENCE DE LA DEMANDE : %d%s\n\n" +
                            "Cordialement,\n" +
                            "L'équipe IDS DEMANDE",
                    titre, nom, prenom, dateEmission, raisonCorrection, fdmId, typeProcessusCode
            );

            message.setText(emailBody);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email de correction FDM: " + exception.getMessage());
        }
    }

    /**
     * Notification au comptable pour une FDM validée
     */
    @Override
    @Async
    public void sendFdmToComptableNotification(String to, String titre, String nom, String prenom, Long fdmId, String typeProcessusCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("NOUVELLE FICHE DESCRIPTIVE DE MISSION VALIDEE");

            String emailBody = String.format(
                    "%s %s %s,\n\n" +
                            "Une nouvelle fiche descriptive de mission vient d'être validée.\n\n" +
                            "REFERENCE DE LA DEMANDE : %d%s\n\n" +
                            "Veuillez procéder au règlement dans l'espace 'Règlements en attente' de l'application IDS DEMANDE.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe IDS DEMANDE",
                    titre, nom, prenom, fdmId, typeProcessusCode
            );

            message.setText(emailBody);
            emailSender.send(message);
        } catch (Exception exception) {
            System.err.println("Erreur lors de l'envoi de l'email au comptable: " + exception.getMessage());
        }
    }
}
