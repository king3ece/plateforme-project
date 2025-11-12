package tg.idstechnologie.plateforme.models.idsdemande.dda;

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
@Table(name = "traitement_demande_achats")
@EntityListeners(AuditingEntityListener.class)
public class TraitementDemandeDachat extends BaseTraitement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "demande_achat_id", nullable = false)
    private DemandeDachat demandeDachat;

    @ManyToOne
    @JoinColumn(name = "traiteur_id")
    private User traiteur;
}
