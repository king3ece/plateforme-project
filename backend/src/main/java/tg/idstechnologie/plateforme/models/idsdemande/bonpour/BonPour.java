package tg.idstechnologie.plateforme.models.idsdemande.bonpour;

// import com.fasterxml.jackson.annotation.JsonFormat;
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
@Table(name = "bon_pours")
@EntityListeners(AuditingEntityListener.class)
public class BonPour extends BaseDemande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "emetteur_id", nullable = true)
    private User emetteur;

    @ManyToOne
    @JoinColumn(name = "traitement_precedent_id", nullable = true)
    private TraitementBonPour traitementPrecedent;

    @Column(name = "beneficiaire", nullable = false)
    private String beneficiaire;

    @Column(name = "montant_total", nullable = false)
    private Double montantTotal;

    @Column(name = "motif", columnDefinition = "TEXT", nullable = false)
    private String motif;

    @Column(name = "date_reglement", nullable = true)
    private LocalDateTime dateReglement;

    @Column(name = "regler", nullable = false)
    private boolean regler = false;

    @OneToMany(mappedBy = "bonPour", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LigneBonPour> lignes = new ArrayList<>();

    // Helper method to calculate total from lines
    public double calculerMontantTotal() {
        return lignes.stream()
                .mapToDouble(LigneBonPour::getMontant)
                .sum();
    }
}
