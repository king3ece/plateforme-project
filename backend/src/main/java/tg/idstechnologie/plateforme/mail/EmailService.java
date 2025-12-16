package tg.idstechnologie.plateforme.mail;

/**
 * Service d'envoi d'emails pour la plateforme
 */
public interface EmailService {

    /**
     * Envoyer un email avec le nouveau mot de passe
     */
    void sendMailNewPassword(String to, String password);

    /**
     * Envoyer un email pour une nouvelle demande en attente de validation
     * @param toEmail email du destinataire (validateur)
     * @param typeProcessus type de processus (FDM, BONPOUR, DDA, etc.)
     * @param reference référence de la demande
     * @param emetteurNom nom de l'émetteur
     */
    void sendMailNewDemande(String toEmail, String typeProcessus, String reference, String emetteurNom);

    /**
     * Envoyer un email pour notifier l'approbation d'une demande
     * @param toEmail email du destinataire (émetteur)
     * @param typeProcessus type de processus
     * @param reference référence de la demande
     */
    void sendMailApprobation(String toEmail, String typeProcessus, String reference);

    /**
     * Envoyer un email pour notifier le rejet d'une demande
     * @param toEmail email du destinataire
     * @param typeProcessus type de processus
     * @param reference référence de la demande
     * @param rejeteurNom nom du validateur qui a rejeté
     * @param raison raison du rejet
     */
    void sendMailRejet(String toEmail, String typeProcessus, String reference, String rejeteurNom, String raison);

    /**
     * Envoyer un email pour notifier un retour pour correction
     * @param toEmail email du destinataire
     * @param typeProcessus type de processus
     * @param reference référence de la demande
     * @param raison raison du retour
     */
    void sendMailCorrection(String toEmail, String typeProcessus, String reference, String raison);

    /**
     * Envoyer un email aux comptables pour une demande approuvée
     * @param toEmail email du comptable
     * @param typeProcessus type de processus
     * @param reference référence de la demande
     * @param emetteurNom nom de l'émetteur
     */
    void sendMailComptable(String toEmail, String typeProcessus, String reference, String emetteurNom);

    /**
     * Envoyer l'email d'activation de compte
     */
    void sendActivationEmail(String email, String newActivationToken, String userName);

    /**
     * Méthode générique pour compatibilité (ancienne méthode)
     * @deprecated Utiliser les méthodes spécifiques à la place
     */
    @Deprecated
    void sendMailNewFdm(String validateur, String id, String emetteur);
}
