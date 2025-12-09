package tg.idstechnologie.plateforme.models.idsdemande.fdm;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseDemande;
import tg.idstechnologie.plateforme.secu.user.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fiche_descriptive_missions")
@EntityListeners(AuditingEntityListener.class)
public class FicheDescriptiveMission extends BaseDemande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "emetteur_id", nullable = true)
    private User emetteur;

    @ManyToOne
    @JoinColumn(name = "traitement_precedent_id", nullable = true)
    private TraitementFicheDescriptiveMission traitementPrecedent;

    @Column(name = "date_reglement", nullable = true)
    private LocalDateTime dateReglement;

    @Column(name = "regler", nullable = false)
    private boolean regler = false;

    @Column(name = "nom_projet", nullable = false)
    private String nomProjet;

    @Column(name = "lieu_mission", nullable = false)
    private String lieuMission;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "date_depart", nullable = false)
    private LocalDate dateDepart;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "date_probable_retour", nullable = false)
    private LocalDate dateProbableRetour;

    @Column(name = "duree_mission", nullable = false)
    private Integer dureeMission;

    @Column(name = "objectif_mission", nullable = false)
    private String objectifMission;

    @Column(name = "perdieme", nullable = false)
    private Double perdieme;

    @Column(name = "transport", nullable = false)
    private Double transport;

    @Column(name = "bon_essence", nullable = false)
    private Double bonEssence;

    @Column(name = "peage", nullable = false)
    private Double peage;

    @Column(name = "laisser_passer", nullable = false)
    private Double laisserPasser;

    @Column(name = "hotel", nullable = false)
    private Double hotel;

    @Column(name = "divers", nullable = false)
    private Double divers;

    @Column(name = "total_estimatif", nullable = false)
    private Double totalEstimatif;

    /**
     * Calcule automatiquement le total estimatif avant persist/update
     */
    @PrePersist
    @PreUpdate
    public void calculerTotalEstimatif() {
        this.totalEstimatif = (perdieme != null ? perdieme : 0.0) +
                (transport != null ? transport : 0.0) +
                (bonEssence != null ? bonEssence : 0.0) +
                (peage != null ? peage : 0.0) +
                (laisserPasser != null ? laisserPasser : 0.0) +
                (hotel != null ? hotel : 0.0) +
                (divers != null ? divers : 0.0);
    }

}
