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
@Table(name = "subdivisions")
@EntityListeners(AuditingEntityListener.class)
public class Subdivision extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String libelle;

    @OneToMany(mappedBy = "subdivision", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> users;

    @ManyToOne
    @JoinColumn(name = "typeSubdivision_id")
    private TypeSubdivision typeSubdivision;

}
