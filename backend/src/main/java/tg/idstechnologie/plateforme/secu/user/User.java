package tg.idstechnologie.plateforme.secu.user;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import tg.idstechnologie.plateforme.models.structure.Poste;
import tg.idstechnologie.plateforme.models.structure.Subdivision;
import tg.idstechnologie.plateforme.secu.token.Token;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, name = "email", nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role roles;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Token> tokens = new ArrayList<>();

    // Champs pour activation
    @Column(name = "activation_token", unique = true)
    private String activationToken;

    @Column(name = "activation_token_expiry")
    private LocalDateTime activationTokenExpiry;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "poste_id")
    private Poste poste;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "subdivision_id")
    private Subdivision subdivision;


    // ✅ Correction : forcer la génération même avec Lombok @Builder
    @Builder.Default
    @Column(nullable = false, unique = true)
    private String reference = UUID.randomUUID().toString();

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, name = "is_delete")
    private Boolean delete = false;

    @Column(nullable = false, name = "is_enable")
    private Boolean enabe = false;

    // ✅ Bonus : sécurise encore plus avec un hook avant insertion
    @PrePersist
    public void prePersist() {
        if (reference == null) {
            reference = UUID.randomUUID().toString();
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(roles.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return enabe;
    }

    // ✅ Getter/Setter personnalisé pour posteRef
    @Transient
    public String getPosteRef() {
        return poste != null ? poste.getReference() : null;
    }

    public void setPosteRef(String posteRef) {
        // Ce setter sera utilisé lors de l'update
        // Vous devrez charger le Poste depuis le repository
    }

}


/*
@CreatedDate
    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createDate;

    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime lastModified;


    @CreatedBy
    @Column(
            nullable = false,
            updatable = false
    )
    private Long createdBy;

    @LastModifiedBy
    @Column(insertable = false)
    private Long lastModifiedBy;
 */
