import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FicheDescriptiveMission } from "../../types/Fdm";
import { BonPour } from "../../types/BonPour";
import { RapportFinancierDeMission } from "../../types/Rfdm";
import { DemandeAchat } from "../../types/DemandeAchat";

export type RequestDetailType = "FDM" | "BONPOUR" | "RFDM" | "DDA";
export type RequestDetailData =
  | FicheDescriptiveMission
  | BonPour
  | RapportFinancierDeMission
  | DemandeAchat;

const formatCurrency = (value: number, currency = "CFA") =>
  `${(value ?? 0).toLocaleString("fr-FR")} ${currency}`;

export const RequestDetailContent = ({
  type,
  data,
}: {
  type: RequestDetailType;
  data: RequestDetailData;
}) => {
  switch (type) {
    case "FDM": {
      const fdm = data as FicheDescriptiveMission;
      return (
        <div className="space-y-4">
          <section>
            <h3 className="font-semibold mb-2">Informations générales</h3>
            <p>Projet : {fdm.nomProjet}</p>
            <p>Lieu : {fdm.lieuMission}</p>
            <p>
              Période : {new Date(fdm.dateDepart).toLocaleDateString("fr-FR")} -{" "}
              {new Date(fdm.dateProbableRetour).toLocaleDateString("fr-FR")} ({fdm.dureeMission} jours)
            </p>
            <p>
              Émetteur : {fdm.emetteur.lastName} {fdm.emetteur.name}
            </p>
          </section>
          <section>
            <h3 className="font-semibold mb-2">Objectif</h3>
            <p className="text-sm">{fdm.objectifMission}</p>
          </section>
          <section className="grid grid-cols-2 gap-3">
            <Badge variant="secondary">Per diem : {formatCurrency(fdm.perdieme)}</Badge>
            <Badge variant="secondary">Transport : {formatCurrency(fdm.transport)}</Badge>
            <Badge variant="secondary">Bon essence : {formatCurrency(fdm.bonEssence)}</Badge>
            <Badge variant="secondary">Péage : {formatCurrency(fdm.peage)}</Badge>
            <Badge variant="secondary">
              Laisser-passer : {formatCurrency(fdm.laisserPasser)}
            </Badge>
            <Badge variant="secondary">Hôtel : {formatCurrency(fdm.hotel)}</Badge>
            <Badge variant="secondary">Divers : {formatCurrency(fdm.divers)}</Badge>
            <Badge variant="outline" className="font-semibold">
              Total : {formatCurrency(fdm.totalEstimatif)}
            </Badge>
          </section>
        </div>
      );
    }
    case "BONPOUR": {
      const bonpour = data as BonPour;
      return (
        <div className="space-y-4">
          <section className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Bénéficiaire</p>
              <p className="font-medium">{bonpour.beneficiaire}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Montant total</p>
              <p className="font-semibold">{formatCurrency(bonpour.montantTotal)}</p>
            </div>
          </section>
          <section>
            <p className="text-muted-foreground text-sm mb-2">Motif</p>
            <p className="text-sm">{bonpour.motif}</p>
          </section>
          <section>
            <h3 className="font-semibold mb-2">Lignes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonpour.lignes.map((ligne) => (
                  <TableRow key={ligne.id}>
                    <TableCell>{ligne.libelle}</TableCell>
                    <TableCell>{formatCurrency(ligne.montant)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      );
    }
    case "RFDM": {
      const rapport = data as RapportFinancierDeMission;
      return (
        <div className="space-y-4">
          <section>
            <h3 className="font-semibold mb-2">Informations</h3>
            <p>Objet : {rapport.objet}</p>
            <p>
              Période : {new Date(rapport.dateDebut).toLocaleDateString("fr-FR")} -{" "}
              {new Date(rapport.dateFin).toLocaleDateString("fr-FR")}
            </p>
            <p>
              Émetteur : {rapport.emetteur.lastName} {rapport.emetteur.name}
            </p>
          </section>
          <section className="grid grid-cols-2 gap-3">
            <Badge variant="secondary">
              Hôtel / déjeuner : {formatCurrency(rapport.hotelDejeuner)}
            </Badge>
            <Badge variant="secondary">Téléphone : {formatCurrency(rapport.telephone)}</Badge>
            <Badge variant="secondary">Transport : {formatCurrency(rapport.transport)}</Badge>
            <Badge variant="secondary">Indemnités : {formatCurrency(rapport.indemnites)}</Badge>
            <Badge variant="secondary">
              Laisser-passer : {formatCurrency(rapport.laisserPasser)}
            </Badge>
            <Badge variant="secondary">Coûts divers : {formatCurrency(rapport.coutDivers)}</Badge>
          </section>
          <section className="grid grid-cols-2 gap-3">
            <Badge variant="outline">Total dépenses : {formatCurrency(rapport.totalDepenses)}</Badge>
            <Badge variant="outline">
              Montant dépensé : {formatCurrency(rapport.montantDepense ?? rapport.totalDepenses)}
            </Badge>
            <Badge variant="outline">
              Montant reçu : {formatCurrency(rapport.montantRecu ?? 0)}
            </Badge>
            {rapport.commentaire && (
              <p className="col-span-2 text-sm text-muted-foreground">
                Commentaire : {rapport.commentaire}
              </p>
            )}
          </section>
        </div>
      );
    }
    case "DDA": {
      const demande = data as DemandeAchat;
      return (
        <div className="space-y-4">
          <section className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Destination</p>
              <p className="font-medium">{demande.destination}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Fournisseur</p>
              <p className="font-medium">{demande.fournisseur}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Service</p>
              <p className="font-medium">{demande.service}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Client</p>
              <p className="font-medium">{demande.client}</p>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-3">
            <Badge variant="secondary">
              Montant projet : {formatCurrency(demande.montantProjet ?? 0, "€")}
            </Badge>
            <Badge variant="outline">Prix total : {formatCurrency(demande.prixTotal, "€")}</Badge>
          </section>
          {demande.commentaire && (
            <section>
              <p className="text-muted-foreground text-sm mb-1">Commentaire</p>
              <p className="text-sm">{demande.commentaire}</p>
            </section>
          )}
          <section>
            <h3 className="font-semibold mb-2">Lignes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead>PU (€)</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Total (€)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demande.lignes.map((ligne, idx) => (
                  <TableRow key={`${ligne.reference}-${idx}`}>
                    <TableCell>{ligne.ligneReference || ligne.reference || "-"}</TableCell>
                    <TableCell>{ligne.designation}</TableCell>
                    <TableCell>{formatCurrency(ligne.prixUnitaire, "€")}</TableCell>
                    <TableCell>{ligne.quantite}</TableCell>
                    <TableCell>
                      {formatCurrency(ligne.prixUnitaire * ligne.quantite, "€")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      );
    }
    default:
      return null;
  }
};
