package tg.idstechnologie.plateforme.mail;

public interface EmailService {
    void sendMailNewPassword(String to, String password);

    void sendMailNewFdm(String validateur, String id, String emetteur);

    void sendActivationEmail(String email, String newActivationToken, String userName);

}