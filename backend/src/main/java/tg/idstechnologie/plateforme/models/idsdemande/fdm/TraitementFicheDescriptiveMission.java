package tg.idstechnologie.plateforme.models.idsdemande.fdm;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseTraitement;
import tg.idstechnologie.plateforme.secu.user.User;
//import tg.idstechnologie.plateforme.secu.user.*;
@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "traitement_fiche_descriptive_missions")
@EntityListeners(AuditingEntityListener.class)
public class TraitementFicheDescriptiveMission extends BaseTraitement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "fiche_descriptive_mission_id")
    @JsonBackReference
    private FicheDescriptiveMission ficheDescriptiveDeMission;

    @ManyToOne
    @JoinColumn(name = "traiteur_id", nullable = true)
    private User traiteur;

}
