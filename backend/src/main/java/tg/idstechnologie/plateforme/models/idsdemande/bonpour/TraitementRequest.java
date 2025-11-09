package tg.idstechnologie.plateforme.models.idsdemande.bonpour;

import lombok.Data;
import tg.idstechnologie.plateforme.utils.Choix_decisions;

@Data
public class TraitementRequest {
    private Choix_decisions decision;
    private String commentaire;
}
