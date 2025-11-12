package tg.idstechnologie.plateforme.models.idsdemande.dda;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseDemande;
import tg.idstechnologie.plateforme.secu.user.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "demande_achats")
@EntityListeners(AuditingEntityListener.class)
public class DemandeDachat extends BaseDemande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "emetteur_id")
    private User emetteur;

    @ManyToOne
    @JoinColumn(name = "traitement_precedent_id")
    private TraitementDemandeDachat traitementPrecedent;

    @Column(name = "destination", nullable = false)
    private String destination;

    @Column(name = "fournisseur", nullable = false)
    private String fournisseur;

    @Column(name = "service", nullable = false)
    private String service;

    @Column(name = "client", nullable = false)
    private String client;

    @Column(name = "montant_projet")
    private Double montantProjet = 0d;

    @Column(name = "prix_total", nullable = false)
    private Double prixTotal = 0d;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "date_reglement")
    private LocalDateTime dateReglement;

    @Column(name = "regler", nullable = false)
    private boolean regler = false;

    @OneToMany(mappedBy = "demandeDachat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneDemandeAchat> lignes = new ArrayList<>();

    public double calculerMontantTotal() {
        return lignes.stream()
                .mapToDouble(ligne -> ligne.getPrixUnitaire() * ligne.getQuantite())
                .sum();
    }
}
