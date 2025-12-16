package tg.idstechnologie.plateforme.mail;

import java.util.Map;

/**
 * Utilitaires pour la génération des contenus d'emails
 */
public class EmailUtils {

    private static final String SIGNATURE = "\n\nCordialement,\nL'équipe IDS DEMANDE";

    // Mapping des codes de processus vers leurs libellés
    private static final Map<String, String> PROCESS_LABELS = Map.of(
            "FDM", "Fiche Descriptive de Mission",
            "BONPOUR", "Bon Pour",
            "DDA", "Demande d'Achat",
            "RFDM", "Rapport Financier de Mission",
            "DECO", "Demande de Congé",
            "FOR", "Formulaire de Réquisition",
            "DEDE", "Demande de Décaissement",
            "FIDE", "Fiche de Déplacement",
            "RI", "Rapport d'Inspection"
    );

    /**
     * Obtenir le libellé d'un type de processus
     */
    public static String getProcessLabel(String code) {
        return PROCESS_LABELS.getOrDefault(code, code);
    }

    /**
     * Template pour nouveau mot de passe
     */
    public static String getNewPassword(String password) {
        return "Votre nouveau mot de passe est : " + password +
                "\n\nEn cas de problème, contactez l'administrateur." + SIGNATURE;
    }

    /**
     * Template pour FDM (compatibilité)
     */
    public static String newFdm() {
        return "Vous avez une nouvelle fiche descriptive de mission en attente de traitement." + SIGNATURE;
    }

    // =====================
    // NOUVELLE DEMANDE
    // =====================

    /**
     * Sujet pour nouvelle demande en attente
     */
    public static String getSubjectNewDemande(String typeProcessus, String reference) {
        return String.format("NOUVELLE %s - Réf: %s", getProcessLabel(typeProcessus).toUpperCase(), reference);
    }

    /**
     * Corps du mail pour nouvelle demande en attente
     */
    public static String getBodyNewDemande(String typeProcessus, String reference, String emetteurNom) {
        return String.format(
                "Bonjour,\n\n" +
                        "Vous avez une nouvelle %s en attente de traitement.\n\n" +
                        "RÉFÉRENCE DE LA DEMANDE : %s\n" +
                        "ÉMETTEUR : %s\n\n" +
                        "Veuillez vous connecter à la plateforme IDS DEMANDE pour traiter cette demande." +
                        SIGNATURE,
                getProcessLabel(typeProcessus).toLowerCase(),
                reference,
                emetteurNom
        );
    }

    // =====================
    // APPROBATION
    // =====================

    /**
     * Sujet pour approbation
     */
    public static String getSubjectApprobation(String typeProcessus, String reference) {
        return String.format("APPROBATION - %s - Réf: %s", getProcessLabel(typeProcessus).toUpperCase(), reference);
    }

    /**
     * Corps du mail pour approbation
     */
    public static String getBodyApprobation(String typeProcessus, String reference) {
        return String.format(
                "Bonjour,\n\n" +
                        "Votre %s a été approuvée par tous les validateurs.\n\n" +
                        "RÉFÉRENCE DE LA DEMANDE : %s\n\n" +
                        "Vous pouvez consulter les détails sur la plateforme IDS DEMANDE." +
                        SIGNATURE,
                getProcessLabel(typeProcessus).toLowerCase(),
                reference
        );
    }

    // =====================
    // REJET
    // =====================

    /**
     * Sujet pour rejet
     */
    public static String getSubjectRejet(String typeProcessus, String reference) {
        return String.format("REJET - %s - Réf: %s", getProcessLabel(typeProcessus).toUpperCase(), reference);
    }

    /**
     * Corps du mail pour rejet
     */
    public static String getBodyRejet(String typeProcessus, String reference, String rejeteurNom, String raison) {
        return String.format(
                "Bonjour,\n\n" +
                        "Votre %s a été rejetée.\n\n" +
                        "RÉFÉRENCE DE LA DEMANDE : %s\n" +
                        "REJETÉE PAR : %s\n" +
                        "RAISON DU REJET : %s\n\n" +
                        "Vous pouvez consulter les détails sur la plateforme IDS DEMANDE." +
                        SIGNATURE,
                getProcessLabel(typeProcessus).toLowerCase(),
                reference,
                rejeteurNom,
                raison != null && !raison.isEmpty() ? raison : "Non spécifiée"
        );
    }

    // =====================
    // CORRECTION
    // =====================

    /**
     * Sujet pour demande de correction
     */
    public static String getSubjectCorrection(String typeProcessus, String reference) {
        return String.format("CORRECTION REQUISE - %s - Réf: %s", getProcessLabel(typeProcessus).toUpperCase(), reference);
    }

    /**
     * Corps du mail pour demande de correction
     */
    public static String getBodyCorrection(String typeProcessus, String reference, String raison) {
        return String.format(
                "Bonjour,\n\n" +
                        "Votre %s vous est retournée pour correction.\n\n" +
                        "RÉFÉRENCE DE LA DEMANDE : %s\n" +
                        "RAISON DU RETOUR : %s\n\n" +
                        "Veuillez effectuer les corrections nécessaires et resoumettre la demande sur la plateforme IDS DEMANDE." +
                        SIGNATURE,
                getProcessLabel(typeProcessus).toLowerCase(),
                reference,
                raison != null && !raison.isEmpty() ? raison : "Non spécifiée"
        );
    }

    // =====================
    // COMPTABLE
    // =====================

    /**
     * Sujet pour notification comptable
     */
    public static String getSubjectComptable(String typeProcessus, String reference) {
        return String.format("NOUVELLE %s VALIDÉE - Réf: %s", getProcessLabel(typeProcessus).toUpperCase(), reference);
    }

    /**
     * Corps du mail pour notification comptable
     */
    public static String getBodyComptable(String typeProcessus, String reference, String emetteurNom) {
        return String.format(
                "Bonjour,\n\n" +
                        "Une nouvelle %s vient d'être validée et nécessite votre attention.\n\n" +
                        "RÉFÉRENCE DE LA DEMANDE : %s\n" +
                        "ÉMETTEUR : %s\n\n" +
                        "Veuillez procéder au règlement dans l'espace 'Règlements en attente' de l'application IDS DEMANDE." +
                        SIGNATURE,
                getProcessLabel(typeProcessus).toLowerCase(),
                reference,
                emetteurNom
        );
    }
}
