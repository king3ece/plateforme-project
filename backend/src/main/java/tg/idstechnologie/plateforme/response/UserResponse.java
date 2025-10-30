package tg.idstechnologie.plateforme.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tg.idstechnologie.plateforme.secu.user.Role;
import tg.idstechnologie.plateforme.secu.user.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String reference;
    private String name;
    private String lastName;
    private String email;
    private Role role;

    /**
     * Constructeur pratique pour créer un UserResponse à partir d'un User
     */
    public UserResponse(User user) {
        this.id = user.getId();
        this.reference = user.getReference();
        this.name = user.getName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.role = user.getRoles();
    }
}
