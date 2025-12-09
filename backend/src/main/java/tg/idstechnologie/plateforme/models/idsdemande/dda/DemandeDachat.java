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

    @Column(name = "remise")
    private Double remise = 0d;

    @Column(name = "prix_total_effectif")
    private Double prixTotalEffectif = 0d;

    @Column(name = "tva")
    private Double tva = 0d;

    @Column(name = "ttc")
    private Double ttc = 0d;

    @Column(name = "appliquer_tva", nullable = false)
    private boolean appliquerTva = false;

    @Column(name = "delai_livraison")
    private String delaiLivraison;

    @Column(name = "lieu_livraison")
    private String lieuLivraison;

    @Column(name = "condition_paiement", columnDefinition = "TEXT")
    private String conditionPaiement;

    @Column(name = "fichier_proforma")
    private String fichierProforma;

    @Column(name = "fichier_bon_commande")
    private String fichierBonCommande;

    @Column(name = "commander", nullable = false)
    private boolean commander = false;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "date_reglement")
    private LocalDateTime dateReglement;

    @Column(name = "regler", nullable = false)
    private boolean regler = false;

    @OneToMany(mappedBy = "demandeDachat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneDemandeAchat> lignes = new ArrayList<>();

    /**
     * Calcule automatiquement les montants (prix total, effectif, TVA, TTC) avant persist/update
     */
    @PrePersist
    @PreUpdate
    public void calculerMontants() {
        // 1. Calculer le prix total à partir des lignes
        this.prixTotal = lignes != null ? lignes.stream()
                .mapToDouble(ligne -> {
                    double pu = ligne.getPrixUnitaire() != null ? ligne.getPrixUnitaire() : 0d;
                    int qty = ligne.getQuantite() != null ? ligne.getQuantite() : 0;
                    return pu * qty;
                })
                .sum() : 0d;

        // 2. Calculer le prix total effectif (après remise)
        double remiseValue = this.remise != null ? this.remise : 0d;
        this.prixTotalEffectif = this.prixTotal - remiseValue;

        // 3. Calculer la TVA si applicable (18%)
        if (this.appliquerTva) {
            this.tva = this.prixTotalEffectif * 0.18;
        } else {
            this.tva = 0d;
        }

        // 4. Calculer le TTC (prix effectif + TVA)
        this.ttc = this.prixTotalEffectif + this.tva;
    }

    public double calculerMontantTotal() {
        return lignes.stream()
                .mapToDouble(ligne -> {
                    double pu = ligne.getPrixUnitaire() != null ? ligne.getPrixUnitaire() : 0d;
                    int qty = ligne.getQuantite() != null ? ligne.getQuantite() : 0;
                    return pu * qty;
                })
                .sum();
    }
}
