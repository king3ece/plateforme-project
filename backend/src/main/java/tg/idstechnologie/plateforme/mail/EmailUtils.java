package tg.idstechnologie.plateforme.mail;

public class EmailUtils {
    public static String getNewPassword(String password) {
        return "Your New Password: " + password + ",\n\nIn case of problem contact SLF.";
    }

    public static String newFdm() {
        return "Vous avez une nouvelle fiche descriptive de mission en attente de traitement.\n\nCordialement, SLF.";
    }
}
