package tg.idstechnologie.plateforme.models.idsdemande.fdm;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "traitement_rapport_financier_missions")
@EntityListeners(AuditingEntityListener.class)
public class TraitementRapportFinancierDeMission extends BaseTraitement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rapport_financier_id", nullable = false)
    @JsonBackReference
    private RapportFinancierDeMission rapportFinancierDeMission;

    @ManyToOne
    @JoinColumn(name = "traiteur_id")
    private User traiteur;
}
