package tg.idstechnologie.plateforme.models.idsdemande.bonpour;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseTraitement;
import tg.idstechnologie.plateforme.secu.user.User;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "traitement_bon_pours")
@EntityListeners(AuditingEntityListener.class)
public class TraitementBonPour extends BaseTraitement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bon_pour_id")
    private BonPour bonPour;

    @ManyToOne
    @JoinColumn(name = "traiteur_id", nullable = true)
    private User traiteur;
}
