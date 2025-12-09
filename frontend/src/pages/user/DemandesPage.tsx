import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { BonPourAPI } from "../../api/bonpour";
import { RapportFinancierAPI } from "../../api/rfdm";
import { DemandeAchatAPI } from "../../api/demandeAchat";
import { FicheDescriptiveMission, TraitementDecision } from "../../types/Fdm";
import { BonPour } from "../../types/BonPour";
import { RapportFinancierDeMission } from "../../types/Rfdm";
import { DemandeAchat } from "../../types/DemandeAchat";
import {
  RequestDetailContent,
  RequestDetailData,
  RequestDetailType,
} from "../../components/requests/RequestDetailContent";

type RequestTab = RequestDetailType;

const STATUT_CONFIG: Record<
  "EN_ATTENTE" | TraitementDecision,
  { variant: "secondary" | "outline" | "destructive" | "default"; label: string }
> = {
  EN_ATTENTE: { variant: "secondary", label: "En attente" },
  VALIDER: { variant: "outline", label: "Validée" },
  REJETER: { variant: "destructive", label: "Rejetée" },
  A_CORRIGER: { variant: "default", label: "À corriger" },
};

const formatDecisionBadge = (decision?: TraitementDecision | null) => {
  const key = decision ?? "EN_ATTENTE";
  const config = STATUT_CONFIG[key];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const formatCurrency = (value: number, currency = "CFA") =>
  `${(value ?? 0).toLocaleString("fr-FR")} ${currency}`;

export const FDMPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fdms, setFdms] = useState<FicheDescriptiveMission[]>([]);
  const [bonpours, setBonpours] = useState<BonPour[]>([]);
  const [rapports, setRapports] = useState<RapportFinancierDeMission[]>([]);
  const [ddas, setDdas] = useState<DemandeAchat[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<RequestDetailType>("FDM");
  const [detailData, setDetailData] = useState<RequestDetailData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [fdmData, bonPourData, rapportData, ddaData] = await Promise.all([
          FicheDescriptiveMissionAPI.getMyRequests(),
          BonPourAPI.getMyRequests(),
          RapportFinancierAPI.getMyRequests(),
          DemandeAchatAPI.getMyRequests(),
        ]);
        setFdms(fdmData);
        setBonpours(bonPourData);
        setRapports(rapportData);
        setDdas(ddaData);
      } catch (error) {
        console.error("Erreur chargement demandes:", error);
        toast.error("Erreur lors du chargement des demandes");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const openDetails = (type: RequestTab, data: RequestDetailData) => {
    setDetailType(type);
    setDetailData(data);
    setIsDetailOpen(true);
  };

  const renderFdmRows = () =>
    fdms.map((fdm) => (
      <TableRow key={fdm.id}>
        <TableCell className="font-medium">{fdm.nomProjet}</TableCell>
        <TableCell>{fdm.lieuMission}</TableCell>
        <TableCell>{new Date(fdm.dateDepart).toLocaleDateString("fr-FR")}</TableCell>
        <TableCell>
          {new Date(fdm.dateProbableRetour).toLocaleDateString("fr-FR")}
        </TableCell>
        <TableCell>{fdm.dureeMission} jour(s)</TableCell>
        <TableCell className="font-semibold">
          {formatCurrency(fdm.totalEstimatif)}
        </TableCell>
        <TableCell>{formatDecisionBadge(fdm.traitementPrecedent?.decision)}</TableCell>
        <TableCell>
          <Badge variant={fdm.regler ? "outline" : "secondary"}>
            {fdm.regler ? "Réglée" : "Non réglée"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => openDetails("FDM", fdm)}>
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));

  const renderBonPourRows = () =>
    bonpours.map((bonpour) => (
      <TableRow key={bonpour.id}>
        <TableCell className="font-medium">{bonpour.beneficiaire}</TableCell>
        <TableCell>{bonpour.motif}</TableCell>
        <TableCell className="font-semibold">
          {formatCurrency(bonpour.montantTotal)}
        </TableCell>
        <TableCell>{formatDecisionBadge(bonpour.traitementPrecedent?.decision)}</TableCell>
        <TableCell>
          <Badge variant={bonpour.regler ? "outline" : "secondary"}>
            {bonpour.regler ? "Réglé" : "Non réglé"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => openDetails("BONPOUR", bonpour)}>
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));

  const renderRapportRows = () =>
    rapports.map((rapport) => (
      <TableRow key={rapport.id}>
        <TableCell className="font-medium">{rapport.objet}</TableCell>
        <TableCell>{new Date(rapport.dateDebut).toLocaleDateString("fr-FR")}</TableCell>
        <TableCell>{new Date(rapport.dateFin).toLocaleDateString("fr-FR")}</TableCell>
        <TableCell>{formatCurrency(rapport.totalDepenses)}</TableCell>
        <TableCell>
          {formatCurrency(rapport.montantDepense ?? rapport.totalDepenses)}
        </TableCell>
        <TableCell>{formatDecisionBadge(rapport.traitementPrecedent?.decision)}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => openDetails("RFDM", rapport)}>
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));

  const renderDdaRows = () =>
    ddas.map((demande) => (
      <TableRow key={demande.id}>
        <TableCell className="font-medium">{demande.destination}</TableCell>
        <TableCell>{demande.fournisseur}</TableCell>
        <TableCell>{demande.service}</TableCell>
        <TableCell>{demande.client}</TableCell>
        <TableCell>{formatCurrency(demande.prixTotal, "€")}</TableCell>
        <TableCell>{formatDecisionBadge(demande.traitementPrecedent?.decision)}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => openDetails("DDA", demande)}>
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));



  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderTableWrapper = (
    rows: React.ReactNode,
    headers: string[],
    emptyLabel: string
  ) => (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows && Array.isArray(rows) && (rows as React.ReactNode[]).length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-center py-6 text-muted-foreground">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            rows
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Mes Demandes</h1>
        <Link to="/user/demandes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Demande
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="FDM" className="space-y-4">
        <TabsList>
          <TabsTrigger value="FDM">FDM</TabsTrigger>
          <TabsTrigger value="BONPOUR">Bon pour</TabsTrigger>
          <TabsTrigger value="RFDM">Rapports</TabsTrigger>
          <TabsTrigger value="DDA">Demandes d'achat</TabsTrigger>
        </TabsList>

        <TabsContent value="FDM">
          {renderTableWrapper(
            renderFdmRows(),
            [
              "Projet",
              "Lieu",
              "Date départ",
              "Date retour",
              "Durée",
              "Total estimatif",
              "Statut",
              "Règlement",
              "Actions",
            ],
            "Aucune FDM trouvée"
          )}
        </TabsContent>

        <TabsContent value="BONPOUR">
          {renderTableWrapper(
            renderBonPourRows(),
            ["Bénéficiaire", "Motif", "Montant", "Statut", "Règlement", "Actions"],
            "Aucun bon pour trouvé"
          )}
        </TabsContent>

        <TabsContent value="RFDM">
          {renderTableWrapper(
            renderRapportRows(),
            ["Objet", "Date début", "Date fin", "Total dépenses", "Montant dépensé", "Statut", "Actions"],
            "Aucun rapport financier trouvé"
          )}
        </TabsContent>

        <TabsContent value="DDA">
          {renderTableWrapper(
            renderDdaRows(),
            ["Destination", "Fournisseur", "Service", "Client", "Montant total", "Statut", "Actions"],
            "Aucune demande d'achat trouvée"
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {detailData && (
            <RequestDetailContent type={detailType} data={detailData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
