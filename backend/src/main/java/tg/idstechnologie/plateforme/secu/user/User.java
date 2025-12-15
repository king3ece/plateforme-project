package tg.idstechnologie.plateforme.secu.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import tg.idstechnologie.plateforme.models.base.BaseEntity;
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
public class User extends BaseEntity implements UserDetails {

       // ✅ Hérite maintenant de BaseEntity :
    
    // - reference (String, unique, non-null)
    // - createDate, lastModified (LocalDateTime)
    // - delete (Boolean)
    // - prePersist() génère reference automatiquement
    // Cette classe contient les attributs de base d'une classe

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

    @Column(name = "activation_token", unique = true)
    private String activationToken;

    @Column(name = "activation_token_expiry")
    private LocalDateTime activationTokenExpiry;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "poste_id")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Poste poste;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subdivision_id")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Subdivision subdivision;

    @Column(name = "sexe", length = 1)
    private String sexe; // "M" pour Monsieur, "F" pour Madame

    // @Builder.Default
    // @Column(nullable = false, unique = true)
    // private String reference = UUID.randomUUID().toString();

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, name = "is_delete")
    private Boolean delete = false;

    @Column(nullable = false, name = "is_enable")
    private Boolean enable = false;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Ajout du préfixe ROLE_ pour compatibilité avec Spring Security
        return List.of(new SimpleGrantedAuthority("ROLE_" + roles.name()));
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
        return enable;
    }

    // ✅ Getter/Setter personnalisé pour posteRef
  // ✅ Getter pour posteRef (utile pour le frontend)
    @Transient
    public String getPosteRef() {
        return poste != null ? poste.getReference() : null;
    }

    // ✅ Setter pour posteRef (peut être utilisé lors de deserialization)
    public void setPosteRef(String posteRef) {
        // Ce setter sera utilisé lors de l'update
        // Le backend devra charger le Poste depuis le repository
        if (posteRef != null && !posteRef.isEmpty()) {
            // Créer une instance Poste avec juste la reference
            // La vraie valeur sera chargée dans UserService
            this.poste = new Poste();
            this.poste.setReference(posteRef);
        } else {
            this.poste = null;
        }
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
