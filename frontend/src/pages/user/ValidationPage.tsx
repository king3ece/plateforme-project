import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { toast } from "sonner";
import {
  RequestDetailContent,
  RequestDetailData,
  RequestDetailType,
} from "../../components/requests/RequestDetailContent";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { BonPourAPI } from "../../api/bonpour";
import { RapportFinancierAPI } from "../../api/rfdm";
import { DemandeAchatAPI } from "../../api/demandeAchat";
import { FicheDescriptiveMission } from "../../types/Fdm";
import { BonPour } from "../../types/BonPour";
import { RapportFinancierDeMission } from "../../types/Rfdm";
import { DemandeAchat } from "../../types/DemandeAchat";
import {
  CheckCircle,
  Eye,
  Filter,
  MessageSquare,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { TraitementDecision } from "../../types/Fdm";

type RequestTab = RequestDetailType;

type RequestCollections = {
  FDM: FicheDescriptiveMission[];
  BONPOUR: BonPour[];
  RFDM: RapportFinancierDeMission[];
  DDA: DemandeAchat[];
};

type DecisionMode = "REJETER" | "A_CORRIGER";

const tabMeta: Record<RequestTab, { title: string; description: string }> = {
  FDM: {
    title: "Fiches descriptives de mission",
    description: "Demandes de mission en attente de votre approbation",
  },
  BONPOUR: {
    title: "Bons pour",
    description: "Demandes de bons pour nécessitant un avis",
  },
  RFDM: {
    title: "Rapports financiers",
    description: "Rapports financiers à valider ou commenter",
  },
  DDA: {
    title: "Demandes d'achat",
    description: "Demandes d'achat à approuver ou corriger",
  },
};

const decisionLabel: Record<DecisionMode, string> = {
  REJETER: "Rejeter",
  A_CORRIGER: "Demander une correction",
};

const ValidationPage = () => {
  const [activeTab, setActiveTab] = useState<RequestTab>("FDM");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [requests, setRequests] = useState<RequestCollections>({
    FDM: [],
    BONPOUR: [],
    RFDM: [],
    DDA: [],
  });
  const [detailState, setDetailState] = useState<{
    open: boolean;
    type: RequestTab;
    data: RequestDetailData | null;
  }>({ open: false, type: "FDM", data: null });
  const [decisionState, setDecisionState] = useState<{
    open: boolean;
    type: RequestTab;
    data: RequestDetailData | null;
    mode: DecisionMode;
  }>({ open: false, type: "FDM", data: null, mode: "REJETER" });
  const [decisionComment, setDecisionComment] = useState("");

  useEffect(() => {
    const loadPending = async () => {
      setIsLoading(true);
      try {
        const [fdm, bonPour, rapports, ddas] = await Promise.all([
          FicheDescriptiveMissionAPI.getPendingValidations(),
          BonPourAPI.getPendingValidations(),
          RapportFinancierAPI.getPendingValidations(),
          DemandeAchatAPI.getPendingValidations(),
        ]);
        setRequests({
          FDM: fdm,
          BONPOUR: bonPour,
          RFDM: rapports,
          DDA: ddas,
        });
      } catch (error) {
        console.error("Erreur chargement validations:", error);
        toast.error("Erreur lors du chargement des demandes à valider");
      } finally {
        setIsLoading(false);
      }
    };
    loadPending();
  }, []);

  const refreshTab = async () => {
    try {
      const loaders: Record<RequestTab, () => Promise<any[]>> = {
        FDM: FicheDescriptiveMissionAPI.getPendingValidations,
        BONPOUR: BonPourAPI.getPendingValidations,
        RFDM: RapportFinancierAPI.getPendingValidations,
        DDA: DemandeAchatAPI.getPendingValidations,
      };
      const data = await loaders[activeTab]();
      setRequests((prev) => ({ ...prev, [activeTab]: data }));
    } catch (error) {
      console.error("Erreur rafraîchissement validations:", error);
      toast.error("Impossible de rafraîchir les demandes");
    }
  };

  const handleApprove = async (type: RequestTab, id: number) => {
    const handlers: Record<
      RequestTab,
      (id: number, payload: any) => Promise<void>
    > = {
      FDM: FicheDescriptiveMissionAPI.traiter,
      BONPOUR: BonPourAPI.traiter,
      RFDM: RapportFinancierAPI.traiter,
      DDA: DemandeAchatAPI.traiter,
    };
    try {
      setIsProcessing(true);
      await handlers[type](id, { decision: "VALIDER" });
      toast.success("Demande approuvée avec succès");
      await refreshTab();
    } catch (error) {
      console.error("Erreur approbation:", error);
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecision = async () => {
    if (!decisionState.data) return;
    if (!decisionComment.trim()) {
      toast.error("Merci de saisir un commentaire");
      return;
    }
    const handlers: Record<
      RequestTab,
      (id: number, payload: any) => Promise<void>
    > = {
      FDM: FicheDescriptiveMissionAPI.traiter,
      BONPOUR: BonPourAPI.traiter,
      RFDM: RapportFinancierAPI.traiter,
      DDA: DemandeAchatAPI.traiter,
    };

    try {
      setIsProcessing(true);
      await handlers[decisionState.type](decisionState.data.id, {
        decision: decisionState.mode,
        commentaire: decisionComment,
      });
      toast.success(
        decisionState.mode === "REJETER"
          ? "Demande rejetée"
          : "Demande renvoyée pour correction"
      );
      setDecisionState({ ...decisionState, open: false, data: null });
      setDecisionComment("");
      await refreshTab();
    } catch (error) {
      console.error("Erreur décision:", error);
      toast.error("Impossible de traiter la demande");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const entries = requests[activeTab] as RequestDetailData[];

    if (!term) return entries;

    const matcher = (text?: string) =>
      text?.toLowerCase().includes(term) ?? false;

    return entries.filter((req) => {
      switch (activeTab) {
        case "FDM": {
          const r = req as FicheDescriptiveMission;
          return (
            matcher(r.nomProjet) ||
            matcher(r.lieuMission) ||
            matcher(r.objectifMission) ||
            matcher(`${r.emetteur.lastName} ${r.emetteur.name}`)
          );
        }
        case "BONPOUR": {
          const r = req as BonPour;
          return matcher(r.beneficiaire) || matcher(r.motif);
        }
        case "RFDM": {
          const r = req as RapportFinancierDeMission;
          return (
            matcher(r.objet) ||
            matcher(`${r.emetteur.lastName} ${r.emetteur.name}`)
          );
        }
        case "DDA": {
          const r = req as DemandeAchat;
          return (
            matcher(r.destination) ||
            matcher(r.fournisseur) ||
            matcher(r.service) ||
            matcher(r.client)
          );
        }
        default:
          return false;
      }
    });
  }, [activeTab, requests, searchTerm]);

  const openDetailDialog = (type: RequestTab, data: RequestDetailData) =>
    setDetailState({ open: true, type, data });

  const openDecisionDialog = (
    type: RequestTab,
    data: RequestDetailData,
    mode: DecisionMode
  ) => {
    setDecisionState({ open: true, type, data, mode });
    setDecisionComment("");
  };

  const renderCard = (type: RequestTab, item: RequestDetailData) => {
    switch (type) {
      case "FDM": {
        const req = item as FicheDescriptiveMission;
        return (
          <Card
            key={`fdm-${req.id}`}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle>{req.nomProjet}</CardTitle>
              <CardDescription>
                {req.lieuMission} •{" "}
                {new Date(req.dateDepart).toLocaleDateString("fr-FR")} -{" "}
                {new Date(req.dateProbableRetour).toLocaleDateString("fr-FR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {req.objectifMission}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">
                  Montant estimatif :{" "}
                  {req.totalEstimatif.toLocaleString("fr-FR")} CFA
                </Badge>
                <span>
                  Émetteur : {req.emetteur.lastName} {req.emetteur.name}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("FDM", req)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Voir détails
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove("FDM", req.id)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDecisionDialog("FDM", req, "REJETER")}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Rejeter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDecisionDialog("FDM", req, "A_CORRIGER")}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> À corriger
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }
      case "BONPOUR": {
        const req = item as BonPour;
        return (
          <Card
            key={`bonpour-${req.id}`}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle>{req.beneficiaire}</CardTitle>
              <CardDescription>{req.motif}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary">
                Montant : {req.montantTotal.toLocaleString("fr-FR")} CFA
              </Badge>
              <p className="text-sm text-muted-foreground">
                Lignes : {req.lignes.length} • Émetteur :{" "}
                {req.emetteur.lastName} {req.emetteur.name}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("BONPOUR", req)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Voir détails
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove("BONPOUR", req.id)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDecisionDialog("BONPOUR", req, "REJETER")}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Rejeter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openDecisionDialog("BONPOUR", req, "A_CORRIGER")
                  }
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> À corriger
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }
      case "RFDM": {
        const req = item as RapportFinancierDeMission;
        return (
          <Card
            key={`rfdm-${req.id}`}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle>{req.objet}</CardTitle>
              <CardDescription>
                {new Date(req.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                {new Date(req.dateFin).toLocaleDateString("fr-FR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary">
                Total dépenses : {req.totalDepenses.toLocaleString("fr-FR")} CFA
              </Badge>
              <p className="text-sm text-muted-foreground">
                Émetteur : {req.emetteur.lastName} {req.emetteur.name}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("RFDM", req)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Voir détails
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove("RFDM", req.id)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDecisionDialog("RFDM", req, "REJETER")}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Rejeter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDecisionDialog("RFDM", req, "A_CORRIGER")}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> À corriger
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }
      case "DDA": {
        const req = item as DemandeAchat;
        return (
          <Card
            key={`dda-${req.id}`}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle>{req.destination}</CardTitle>
              <CardDescription>
                Fournisseur : {req.fournisseur} • Service : {req.service}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary">
                Montant total : {req.prixTotal.toLocaleString("fr-FR")} €
              </Badge>
              <p className="text-sm text-muted-foreground">
                Émetteur : {req.emetteur.lastName} {req.emetteur.name}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("DDA", req)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Voir détails
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove("DDA", req.id)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDecisionDialog("DDA", req, "REJETER")}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Rejeter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDecisionDialog("DDA", req, "A_CORRIGER")}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> À corriger
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }
      default:
        return null;
    }
  };

  const renderTabContent = (type: RequestTab) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (filteredRequests.length === 0 && activeTab === type) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Filter className="h-8 w-8 mb-3" />
            <p>
              {searchTerm
                ? "Aucune demande ne correspond à la recherche"
                : "Aucune demande à traiter"}
            </p>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === type) {
      return (
        <div className="space-y-4 pb-6">
          {filteredRequests.map((request) => renderCard(type, request))}
        </div>
      );
    }
    return null;
  };

  // Calculer les statistiques
  const totalPending = Object.values(requests).reduce(
    (acc, arr) => acc + arr.length,
    0
  );
  const stats = {
    FDM: requests.FDM.length,
    BONPOUR: requests.BONPOUR.length,
    RFDM: requests.RFDM.length,
    DDA: requests.DDA.length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header avec gradient et statistiques */}
      <div className="flex-shrink-0 mb-6">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-8 w-8" />
                </div>
                Validation des demandes
              </h1>
              <p className="text-blue-100 mt-2">
                Consultez et traitez les demandes en attente de votre
                approbation
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-4 border border-white/20">
              <div className="text-center">
                <p className="text-4xl font-bold">{totalPending}</p>
                <p className="text-sm text-blue-100 mt-1">En attente</p>
              </div>
            </div>
          </div>

          {/* Statistiques par type */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-yellow-200" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.FDM}</p>
                  <p className="text-xs text-blue-100">FDM</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-green-400/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-green-200" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.BONPOUR}</p>
                  <p className="text-xs text-blue-100">Bon pour</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-purple-400/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-200" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.RFDM}</p>
                  <p className="text-xs text-blue-100">Rapports</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-orange-400/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-200" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.DDA}</p>
                  <p className="text-xs text-blue-100">Achats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche améliorée */}
      <Card className="flex-shrink-0 mb-6 border-2 hover:border-blue-200 transition-all">
        <CardContent className="pt-6">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="search"
              placeholder="Rechercher par nom, lieu, objectif ou demandeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-y-auto pr-2">
        <Tabs
          defaultValue="FDM"
          value={activeTab}
          onValueChange={(value: string) => {
            setActiveTab(value as RequestTab);
            setSearchTerm("");
          }}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="FDM">FDM</TabsTrigger>
            <TabsTrigger value="BONPOUR">Bon pour</TabsTrigger>
            <TabsTrigger value="RFDM">Rapports</TabsTrigger>
            <TabsTrigger value="DDA">Demandes d'achat</TabsTrigger>
          </TabsList>

          {(Object.keys(tabMeta) as RequestTab[]).map((tab: RequestTab) => (
            <TabsContent value={tab} key={tab} className="space-y-3">
              <h2 className="text-xl font-semibold">{tabMeta[tab].title}</h2>
              <p className="text-sm text-muted-foreground">
                {tabMeta[tab].description}
              </p>
              {renderTabContent(tab)}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog
        open={detailState.open}
        onOpenChange={(open: boolean) =>
          setDetailState((prev: typeof detailState) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {detailState.data && (
            <RequestDetailContent
              type={detailState.type}
              data={detailState.data}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={decisionState.open}
        onOpenChange={(open: boolean) =>
          setDecisionState((prev: typeof decisionState) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decisionLabel[decisionState.mode]}</DialogTitle>
            <DialogDescription>
              Merci de préciser un commentaire pour{" "}
              {decisionLabel[decisionState.mode].toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={decisionComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDecisionComment(e.target.value)
            }
            placeholder="Vos remarques..."
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDecisionState((prev: typeof decisionState) => ({
                  ...prev,
                  open: false,
                }))
              }
            >
              Annuler
            </Button>
            <Button onClick={handleDecision} disabled={isProcessing}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ValidationPage };
