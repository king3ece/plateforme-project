package tg.idstechnologie.plateforme.models.structure;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseEntity;
import tg.idstechnologie.plateforme.secu.user.User;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "postes")
@EntityListeners(AuditingEntityListener.class)
public class Poste extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String libelle;

//    @ManyToOne
//    @JoinColumn(name = "subdivision_id")
//    private Subdivision subdivision;

    @OneToMany(mappedBy = "poste", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> users;
}
