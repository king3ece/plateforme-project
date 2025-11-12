package tg.idstechnologie.plateforme.models.idsdemande.fdm;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseDemande;
import tg.idstechnologie.plateforme.secu.user.User;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rapport_financier_missions")
@EntityListeners(AuditingEntityListener.class)
public class RapportFinancierDeMission extends BaseDemande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "emetteur_id")
    private User emetteur;

    @ManyToOne
    @JoinColumn(name = "traitement_precedent_id")
    private TraitementRapportFinancierDeMission traitementPrecedent;

    @Column(name = "objet", nullable = false)
    private String objet;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "hotel_dejeuner", nullable = false)
    private Double hotelDejeuner = 0d;

    @Column(name = "telephone", nullable = false)
    private Double telephone = 0d;

    @Column(name = "transport", nullable = false)
    private Double transport = 0d;

    @Column(name = "indemnites", nullable = false)
    private Double indemnites = 0d;

    @Column(name = "laisser_passer", nullable = false)
    private Double laisserPasser = 0d;

    @Column(name = "cout_divers", nullable = false)
    private Double coutDivers = 0d;

    @Column(name = "total_depenses", nullable = false)
    private Double totalDepenses = 0d;

    @Column(name = "montant_recu")
    private Double montantRecu = 0d;

    @Column(name = "montant_depense")
    private Double montantDepense = 0d;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "date_reglement")
    private LocalDate dateReglement;

    @Column(name = "regler", nullable = false)
    private boolean regler = false;
}
