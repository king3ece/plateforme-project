import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { FicheDescriptiveMission, TraitementDecision } from "../../types/Fdm";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";

type StatutFDM = TraitementDecision | "EN_ATTENTE";

export const FDMPage = () => {
  const [fdms, setFdms] = useState<FicheDescriptiveMission[]>([]);
  const [selectedFDM, setSelectedFDM] =
    useState<FicheDescriptiveMission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFDMs();
  }, []);

  const loadFDMs = async () => {
    setIsLoading(true);
    try {
      const data = await FicheDescriptiveMissionAPI.getMyRequests();
      setFdms(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des FDM");
    } finally {
      setIsLoading(false);
    }
  };

  const statutConfig: Record<
    StatutFDM,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    EN_ATTENTE: { variant: "secondary", label: "En attente" },
    VALIDER: { variant: "outline", label: "Validée" },
    REJETER: { variant: "destructive", label: "Rejetée" },
    A_CORRIGER: { variant: "default", label: "À corriger" },
  };

  const resolveStatut = (fdm: FicheDescriptiveMission): StatutFDM => {
    if (!fdm.traitementPrecedent) {
      return "EN_ATTENTE";
    }
    const decision = fdm.traitementPrecedent.decision;
    return decision ?? "EN_ATTENTE";
  };

  const getStatutBadge = (statut: StatutFDM) => {
    const config = statutConfig[statut] ?? statutConfig["EN_ATTENTE"];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getReglementBadge = (regler: boolean) => {
    return (
      <Badge variant={regler ? "outline" : "secondary"}>
        {regler ? "Réglée" : "Non réglée"}
      </Badge>
    );
  };

  const handleViewDetails = (fdm: FicheDescriptiveMission) => {
    setSelectedFDM(fdm);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Mes Fiches Descriptives de Mission</h1>
        <Link to="/user/demandes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Demande
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Date départ</TableHead>
              <TableHead>Date retour</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Total estimatif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Règlement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fdms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucune FDM trouvée
                </TableCell>
              </TableRow>
            ) : (
              fdms.map((fdm) => (
                <TableRow key={fdm.id}>
                  <TableCell className="font-medium">{fdm.nomProjet}</TableCell>
                  <TableCell>{fdm.lieuMission}</TableCell>
                  <TableCell>
                    {new Date(fdm.dateDepart).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    {new Date(fdm.dateProbableRetour).toLocaleDateString(
                      "fr-FR"
                    )}
                  </TableCell>
                  <TableCell>{fdm.dureeMission} jour(s)</TableCell>
                  <TableCell className="font-semibold">
                    {fdm.totalEstimatif.toLocaleString("fr-FR")} CFA
                  </TableCell>
                  <TableCell>
                    {getStatutBadge(resolveStatut(fdm))}
                  </TableCell>
                  <TableCell>{getReglementBadge(fdm.regler)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(fdm)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la Fiche Descriptive de Mission
            </DialogTitle>
          </DialogHeader>
          {selectedFDM && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Nom du projet
                    </p>
                    <p className="font-medium">{selectedFDM.nomProjet}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Lieu de mission
                    </p>
                    <p className="font-medium">{selectedFDM.lieuMission}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Date de départ
                    </p>
                    <p>
                      {new Date(selectedFDM.dateDepart).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Date probable de retour
                    </p>
                    <p>
                      {new Date(
                        selectedFDM.dateProbableRetour
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Durée de mission
                    </p>
                    <p>{selectedFDM.dureeMission} jour(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Émetteur</p>
                    <p>
                      {selectedFDM.emetteur.lastName}{" "}
                      {selectedFDM.emetteur.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Objectif */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Objectif de la mission</h3>
                <p className="text-sm">{selectedFDM.objectifMission}</p>
              </div>

              {/* Estimations financières */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Estimations financières</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Per diem</span>
                    <span className="font-medium">
                      {selectedFDM.perdieme.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Transport</span>
                    <span className="font-medium">
                      {selectedFDM.transport.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Bon essence</span>
                    <span className="font-medium">
                      {selectedFDM.bonEssence.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Péage</span>
                    <span className="font-medium">
                      {selectedFDM.peage.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Laisser-passer</span>
                    <span className="font-medium">
                      {selectedFDM.laisserPasser.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Hôtel</span>
                    <span className="font-medium">
                      {selectedFDM.hotel.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Divers</span>
                    <span className="font-medium">
                      {selectedFDM.divers.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span className="font-semibold">Total estimatif</span>
                    <span className="font-bold text-blue-700">
                      {selectedFDM.totalEstimatif.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Statut et traitement */}
              <div>
                <h3 className="font-semibold mb-3">Statut et règlement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Statut</p>
                    {getStatutBadge(resolveStatut(selectedFDM))}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Règlement</p>
                    {getReglementBadge(selectedFDM.regler)}
                  </div>
                  {selectedFDM.dateReglement && (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Date de règlement
                      </p>
                      <p>
                        {new Date(selectedFDM.dateReglement).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Commentaire du traitement */}
                {selectedFDM.traitementPrecedent?.commentaire && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">
                      Commentaire du validateur
                    </p>
                    <p className="text-sm">
                      {selectedFDM.traitementPrecedent.commentaire}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Traité par:{" "}
                      {selectedFDM.traitementPrecedent.traiteur.lastName}{" "}
                      {selectedFDM.traitementPrecedent.traiteur.name}
                      {" - "}
                      {new Date(
                        selectedFDM.traitementPrecedent.dateTraitement
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
