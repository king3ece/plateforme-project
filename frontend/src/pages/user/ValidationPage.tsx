import { useEffect, useState } from "react";
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
import { CheckCircle, XCircle, Edit, Eye, Clock } from "lucide-react";
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
import { TraitementDialog } from "../../components/requests/TraitementDialog";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle } from "lucide-react";

type RequestTab = RequestDetailType;

const formatCurrency = (value: number, currency = "CFA") =>
  `${(value ?? 0).toLocaleString("fr-FR")} ${currency}`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const ValidationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fdms, setFdms] = useState<FicheDescriptiveMission[]>([]);
  const [bonpours, setBonpours] = useState<BonPour[]>([]);
  const [rapports, setRapports] = useState<RapportFinancierDeMission[]>([]);
  const [ddas, setDdas] = useState<DemandeAchat[]>([]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<RequestDetailType>("FDM");
  const [detailData, setDetailData] = useState<RequestDetailData | null>(null);

  const [isTraitementOpen, setIsTraitementOpen] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<TraitementDecision | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: number;
    type: RequestDetailType;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fdmData, bonPourData, rapportData, ddaData] = await Promise.all([
        FicheDescriptiveMissionAPI.getPendingValidations(),
        BonPourAPI.getPendingValidations(),
        RapportFinancierAPI.getPendingValidations(),
        DemandeAchatAPI.getPendingValidations(),
      ]);
      setFdms(fdmData);
      setBonpours(bonPourData);
      setRapports(rapportData);
      setDdas(ddaData);
    } catch (error) {
      console.error("Erreur chargement demandes en attente:", error);
      toast.error("Erreur lors du chargement des demandes à valider");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDetails = (type: RequestTab, data: RequestDetailData) => {
    setDetailType(type);
    setDetailData(data);
    setIsDetailOpen(true);
  };

  const openTraitement = (
    id: number,
    type: RequestDetailType,
    decision: TraitementDecision
  ) => {
    setSelectedRequest({ id, type });
    setCurrentDecision(decision);
    setIsTraitementOpen(true);
  };

  const handleTraitement = async (decision: TraitementDecision, commentaire: string) => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      // Appeler l'API correspondante selon le type
      switch (selectedRequest.type) {
        case "FDM":
          await FicheDescriptiveMissionAPI.traiter(selectedRequest.id, { decision, commentaire });
          break;
        case "BONPOUR":
          await BonPourAPI.traiter(selectedRequest.id, { decision, commentaire });
          break;
        case "RFDM":
          await RapportFinancierAPI.traiter(selectedRequest.id, { decision, commentaire });
          break;
        case "DDA":
          await DemandeAchatAPI.traiter(selectedRequest.id, { decision, commentaire });
          break;
      }

      const actionLabel =
        decision === "VALIDER"
          ? "validée"
          : decision === "REJETER"
          ? "rejetée"
          : "marquée pour correction";

      toast.success(`Demande ${actionLabel} avec succès`, {
        description: "Les notifications ont été envoyées par email.",
      });

      // Recharger les données
      await loadData();
      setIsTraitementOpen(false);
    } catch (error: any) {
      console.error("Erreur lors du traitement:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors du traitement de la demande";
      toast.error("Erreur", {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionButtons = (id: number, type: RequestDetailType) => (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const data =
            type === "FDM"
              ? fdms.find((f) => f.id === id)
              : type === "BONPOUR"
              ? bonpours.find((b) => b.id === id)
              : type === "RFDM"
              ? rapports.find((r) => r.id === id)
              : ddas.find((d) => d.id === id);
          if (data) openDetails(type, data as RequestDetailData);
        }}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openTraitement(id, type, "VALIDER")}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
        title="Valider"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openTraitement(id, type, "A_CORRIGER")}
        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        title="Demander correction"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openTraitement(id, type, "REJETER")}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Rejeter"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderFdmRows = () =>
    fdms.map((fdm) => (
      <TableRow key={fdm.id}>
        <TableCell>
          <div className="font-medium">{fdm.nomProjet}</div>
          <div className="text-sm text-muted-foreground">
            Réf: {fdm.reference}
          </div>
        </TableCell>
        <TableCell>
          <div>
            {fdm.emetteur.lastName} {fdm.emetteur.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {fdm.emetteur.email}
          </div>
        </TableCell>
        <TableCell>{fdm.lieuMission}</TableCell>
        <TableCell>
          {formatDate(fdm.dateDepart)} → {formatDate(fdm.dateProbableRetour)}
          <div className="text-sm text-muted-foreground">
            {fdm.dureeMission} jour(s)
          </div>
        </TableCell>
        <TableCell className="font-semibold">
          {formatCurrency(fdm.totalEstimatif)}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(fdm.dateEmission)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {renderActionButtons(fdm.id, "FDM")}
        </TableCell>
      </TableRow>
    ));

  const renderBonPourRows = () =>
    bonpours.map((bonpour) => (
      <TableRow key={bonpour.id}>
        <TableCell>
          <div className="font-medium">{bonpour.beneficiaire}</div>
          <div className="text-sm text-muted-foreground">
            Réf: {bonpour.reference}
          </div>
        </TableCell>
        <TableCell>
          <div>
            {bonpour.emetteur.lastName} {bonpour.emetteur.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {bonpour.emetteur.email}
          </div>
        </TableCell>
        <TableCell className="max-w-xs truncate">{bonpour.motif}</TableCell>
        <TableCell className="font-semibold">
          {formatCurrency(bonpour.montantTotal)}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(bonpour.dateEmission)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {renderActionButtons(bonpour.id, "BONPOUR")}
        </TableCell>
      </TableRow>
    ));

  const renderRapportRows = () =>
    rapports.map((rapport) => (
      <TableRow key={rapport.id}>
        <TableCell>
          <div className="font-medium">{rapport.objet}</div>
          <div className="text-sm text-muted-foreground">
            Réf: {rapport.reference}
          </div>
        </TableCell>
        <TableCell>
          <div>
            {rapport.emetteur.lastName} {rapport.emetteur.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {rapport.emetteur.email}
          </div>
        </TableCell>
        <TableCell>
          {formatDate(rapport.dateDebut)} → {formatDate(rapport.dateFin)}
        </TableCell>
        <TableCell className="font-semibold">
          {formatCurrency(rapport.totalDepenses)}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(rapport.dateEmission)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {renderActionButtons(rapport.id, "RFDM")}
        </TableCell>
      </TableRow>
    ));

  const renderDdaRows = () =>
    ddas.map((demande) => (
      <TableRow key={demande.id}>
        <TableCell>
          <div className="font-medium">{demande.destination}</div>
          <div className="text-sm text-muted-foreground">
            Réf: {demande.reference}
          </div>
        </TableCell>
        <TableCell>
          <div>
            {demande.emetteur.lastName} {demande.emetteur.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {demande.emetteur.email}
          </div>
        </TableCell>
        <TableCell>{demande.fournisseur}</TableCell>
        <TableCell>{demande.service}</TableCell>
        <TableCell className="font-semibold">
          {formatCurrency(demande.prixTotal)}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(demande.dateEmission)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {renderActionButtons(demande.id, "DDA")}
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

  const totalPending = fdms.length + bonpours.length + rapports.length + ddas.length;

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
              <TableCell
                colSpan={headers.length}
                className="text-center py-8 text-muted-foreground"
              >
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
        <div>
          <h1 className="text-3xl font-bold">Demandes à valider</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes en attente de votre validation
          </p>
        </div>
        <Card className="w-48">
          <CardHeader className="pb-3">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-4xl">{totalPending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Actions disponibles :</strong> Pour chaque demande, vous pouvez la <strong className="text-green-600">Valider</strong>,
          demander une <strong className="text-orange-600">Correction</strong> (retour à l'émetteur/validateur précédent),
          ou la <strong className="text-red-600">Rejeter</strong> définitivement.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="FDM" className="space-y-4">
        <TabsList>
          <TabsTrigger value="FDM" className="gap-2">
            FDM
            {fdms.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {fdms.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="BONPOUR" className="gap-2">
            Bon pour
            {bonpours.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {bonpours.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="RFDM" className="gap-2">
            Rapports
            {rapports.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {rapports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="DDA" className="gap-2">
            Demandes d'achat
            {ddas.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {ddas.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="FDM">
          {renderTableWrapper(
            renderFdmRows(),
            [
              "Projet",
              "Émetteur",
              "Lieu",
              "Période",
              "Total estimatif",
              "Date d'émission",
              "Actions",
            ],
            "Aucune FDM en attente de validation"
          )}
        </TabsContent>

        <TabsContent value="BONPOUR">
          {renderTableWrapper(
            renderBonPourRows(),
            [
              "Bénéficiaire",
              "Émetteur",
              "Motif",
              "Montant",
              "Date d'émission",
              "Actions",
            ],
            "Aucun bon pour en attente de validation"
          )}
        </TabsContent>

        <TabsContent value="RFDM">
          {renderTableWrapper(
            renderRapportRows(),
            [
              "Objet",
              "Émetteur",
              "Période",
              "Total dépenses",
              "Date d'émission",
              "Actions",
            ],
            "Aucun rapport financier en attente de validation"
          )}
        </TabsContent>

        <TabsContent value="DDA">
          {renderTableWrapper(
            renderDdaRows(),
            [
              "Destination",
              "Émetteur",
              "Fournisseur",
              "Service",
              "Montant total",
              "Date d'émission",
              "Actions",
            ],
            "Aucune demande d'achat en attente de validation"
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {detailData && <RequestDetailContent type={detailType} data={detailData} />}
        </DialogContent>
      </Dialog>

      <TraitementDialog
        open={isTraitementOpen}
        onOpenChange={setIsTraitementOpen}
        onConfirm={handleTraitement}
        decision={currentDecision}
        isLoading={isProcessing}
      />
    </div>
  );
};
