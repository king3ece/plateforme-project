package tg.idstechnologie.plateforme.models.idsdemande;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseEntity;
import tg.idstechnologie.plateforme.models.structure.Subdivision;
import tg.idstechnologie.plateforme.secu.user.User;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "validateurs",uniqueConstraints = @UniqueConstraint(columnNames = {"ordre", "user_id","type_processus_id"}))
@EntityListeners(AuditingEntityListener.class)
public class Validateur extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer ordre;

    @ManyToOne
    @JoinColumn(name = "subdivision_id")
    private Subdivision subdivision;

    @ManyToOne
    @JoinColumn(name = "type_processus_id")
    private TypeProcessus typeProcessus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
