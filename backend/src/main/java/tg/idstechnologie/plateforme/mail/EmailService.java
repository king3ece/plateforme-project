package tg.idstechnologie.plateforme.mail;

public interface EmailService {
    void sendMailNewPassword(String to, String password);

    void sendMailNewFdm(String validateur, String id, String emetteur);

    void sendActivationEmail(String email, String newActivationToken, String userName);

    // Nouvelles méthodes pour notifications détaillées selon la logique Django
    void sendFdmValidationNotification(String to, String titre, String nom, String prenom, Long fdmId, String typeProcessusCode);

    void sendFdmApprovalNotification(String to, String titre, String nom, String prenom, String dateEmission, Long fdmId, String typeProcessusCode);

    void sendFdmRejectionNotification(String to, String titre, String nom, String prenom, String dateEmission, String raisonRejet, Long fdmId, String typeProcessusCode, String rejeteurTitre, String rejeteurNom);

    void sendFdmCorrectionNotification(String to, String titre, String nom, String prenom, String dateEmission, String raisonCorrection, Long fdmId, String typeProcessusCode);

    void sendFdmToComptableNotification(String to, String titre, String nom, String prenom, Long fdmId, String typeProcessusCode);
}