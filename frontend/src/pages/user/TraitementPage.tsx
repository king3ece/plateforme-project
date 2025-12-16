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
import { Label } from "../../components/ui/label";
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
  XCircle,
  FileText,
  MessageSquare,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  FileEdit,
} from "lucide-react";

type RequestTab = RequestDetailType;

type RequestCollections = {
  FDM: FicheDescriptiveMission[];
  BONPOUR: BonPour[];
  RFDM: RapportFinancierDeMission[];
  DDA: DemandeAchat[];
};

const tabMeta: Record<RequestTab, { title: string; description: string }> = {
  FDM: {
    title: "Fiches descriptives de mission",
    description: "Demandes de mission à traiter",
  },
  BONPOUR: {
    title: "Bons pour",
    description: "Demandes de bons pour à traiter",
  },
  RFDM: {
    title: "Rapports financiers",
    description: "Rapports financiers à traiter",
  },
  DDA: {
    title: "Demandes d'achat",
    description: "Demandes d'achat à traiter",
  },
};

const TraitementPage = () => {
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

  // État pour le traitement avec commentaire obligatoire
  const [traitementState, setTraitementState] = useState<{
    open: boolean;
    type: RequestTab;
    data: RequestDetailData | null;
    action: "VALIDER" | "REJETER" | null;
  }>({ open: false, type: "FDM", data: null, action: null });
  const [commentaire, setCommentaire] = useState("");

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
        console.error("Erreur chargement demandes:", error);
        toast.error("Erreur lors du chargement des demandes à traiter");
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
      console.error("Erreur rafraîchissement demandes:", error);
      toast.error("Impossible de rafraîchir les demandes");
    }
  };

  const openTraitementDialog = (
    type: RequestTab,
    data: RequestDetailData,
    action: "VALIDER" | "REJETER"
  ) => {
    setTraitementState({ open: true, type, data, action });
    setCommentaire("");
  };

  const handleTraiter = async () => {
    if (!traitementState.data || !traitementState.action) return;

    if (!commentaire.trim()) {
      toast.error("Le commentaire est obligatoire pour traiter une demande");
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
      await handlers[traitementState.type](traitementState.data.id, {
        decision: traitementState.action,
        commentaire: commentaire.trim(),
      });

      const actionMessage = traitementState.action === "VALIDER"
        ? "Demande approuvée avec succès"
        : "Demande rejetée avec succès";
      toast.success(actionMessage);

      setTraitementState({ open: false, type: "FDM", data: null, action: null });
      setCommentaire("");
      await refreshTab();
    } catch (error) {
      console.error("Erreur traitement:", error);
      toast.error("Erreur lors du traitement de la demande");
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

  const renderCard = (type: RequestTab, item: RequestDetailData) => {
    switch (type) {
      case "FDM": {
        const req = item as FicheDescriptiveMission;
        return (
          <Card
            key={`fdm-${req.id}`}
            className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-white"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-semibold">{req.nomProjet}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="flex items-center gap-1">
                        📍 {req.lieuMission}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(req.dateDepart).toLocaleDateString("fr-FR")} -{" "}
                        {new Date(req.dateProbableRetour).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-md">
                {req.objectifMission}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  💰 {req.totalEstimatif.toLocaleString("fr-FR")} CFA
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  👤 {req.emetteur.lastName} {req.emetteur.name}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("FDM", req)}
                  className="w-full hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1" /> Détails
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openTraitementDialog("FDM", req, "VALIDER")}
                  disabled={isProcessing}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openTraitementDialog("FDM", req, "REJETER")}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Rejeter
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
            className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-white"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-semibold">{req.beneficiaire}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">{req.motif}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  💰 {req.montantTotal.toLocaleString("fr-FR")} CFA
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  📋 {req.lignes.length} ligne{req.lignes.length > 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  👤 {req.emetteur.lastName} {req.emetteur.name}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("BONPOUR", req)}
                  className="w-full hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1" /> Détails
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openTraitementDialog("BONPOUR", req, "VALIDER")}
                  disabled={isProcessing}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openTraitementDialog("BONPOUR", req, "REJETER")}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Rejeter
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
            className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-white"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-semibold">{req.objet}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {new Date(req.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                    {new Date(req.dateFin).toLocaleDateString("fr-FR")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  💰 {req.totalDepenses.toLocaleString("fr-FR")} CFA
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  👤 {req.emetteur.lastName} {req.emetteur.name}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("RFDM", req)}
                  className="w-full hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1" /> Détails
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openTraitementDialog("RFDM", req, "VALIDER")}
                  disabled={isProcessing}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openTraitementDialog("RFDM", req, "REJETER")}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Rejeter
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
            className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 bg-white"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="font-semibold">{req.destination}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Fournisseur : {req.fournisseur} • Service : {req.service}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                  💰 {req.prixTotal.toLocaleString("fr-FR")} €
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  👤 {req.emetteur.lastName} {req.emetteur.name}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog("DDA", req)}
                  className="w-full hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1" /> Détails
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openTraitementDialog("DDA", req, "VALIDER")}
                  disabled={isProcessing}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openTraitementDialog("DDA", req, "REJETER")}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Rejeter
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
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des demandes...</p>
          </div>
        </div>
      );
    }

    if (filteredRequests.length === 0 && activeTab === type) {
      return (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Filter className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm
                ? "Aucun résultat trouvé"
                : "Aucune demande à traiter"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm
                ? "Essayez avec d'autres mots-clés de recherche"
                : "Toutes les demandes ont été traitées. Bon travail !"}
            </p>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === type) {
      return (
        <div className="grid gap-4 pb-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => renderCard(type, request))}
        </div>
      );
    }
    return null;
  };

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
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header amélioré */}
      <div className="flex-shrink-0 mb-6">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                  <MessageSquare className="h-8 w-8" />
                </div>
                Traitement des demandes
              </h1>
              <p className="text-purple-100 text-lg">
                Approuvez ou rejetez les demandes en attente
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/30 shadow-xl">
              <div className="text-center">
                <p className="text-5xl font-bold mb-1">{totalPending}</p>
                <p className="text-sm text-purple-100 font-medium">En attente</p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-blue-400/30 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-100" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.FDM}</p>
                  <p className="text-xs text-purple-100 font-medium">Fiches de mission</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-green-400/30 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-green-100" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.BONPOUR}</p>
                  <p className="text-xs text-purple-100 font-medium">Bons pour</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-purple-400/30 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-100" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.RFDM}</p>
                  <p className="text-xs text-purple-100 font-medium">Rapports</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-orange-400/30 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-100" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.DDA}</p>
                  <p className="text-xs text-purple-100 font-medium">Demandes d'achat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche améliorée */}
      <Card className="flex-shrink-0 mb-6 border-2 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="search"
              placeholder="🔍 Rechercher par nom, lieu, objectif, demandeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contenu avec tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs
          defaultValue="FDM"
          value={activeTab}
          onValueChange={(value: string) => {
            setActiveTab(value as RequestTab);
            setSearchTerm("");
          }}
          className="space-y-6"
        >
          <TabsList className="bg-white p-1 shadow-md border">
            <TabsTrigger value="FDM" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              FDM ({stats.FDM})
            </TabsTrigger>
            <TabsTrigger value="BONPOUR" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Bon pour ({stats.BONPOUR})
            </TabsTrigger>
            <TabsTrigger value="RFDM" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Rapports ({stats.RFDM})
            </TabsTrigger>
            <TabsTrigger value="DDA" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Achats ({stats.DDA})
            </TabsTrigger>
          </TabsList>

          {(Object.keys(tabMeta) as RequestTab[]).map((tab: RequestTab) => (
            <TabsContent value={tab} key={tab} className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800">{tabMeta[tab].title}</h2>
                <p className="text-sm text-gray-600 mt-1">{tabMeta[tab].description}</p>
              </div>
              {renderTabContent(tab)}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Dialog détails */}
      <Dialog
        open={detailState.open}
        onOpenChange={(open: boolean) =>
          setDetailState((prev: typeof detailState) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Détails de la demande</DialogTitle>
          </DialogHeader>
          {detailState.data && (
            <RequestDetailContent
              type={detailState.type}
              data={detailState.data}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de traitement amélioré */}
      <Dialog
        open={traitementState.open}
        onOpenChange={(open: boolean) =>
          setTraitementState((prev: typeof traitementState) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {traitementState.action === "VALIDER" ? (
                <>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                  </div>
                  Approbation de la demande
                </>
              ) : (
                <>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ThumbsDown className="h-6 w-6 text-red-600" />
                  </div>
                  Rejet de la demande
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-start gap-3 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">Commentaire obligatoire</p>
                  <p>
                    Votre commentaire sera visible par l'émetteur de la demande.
                    Soyez clair et professionnel dans vos explications.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-3">
              <Label htmlFor="commentaire" className="text-base font-semibold flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Commentaire <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="commentaire"
                value={commentaire}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCommentaire(e.target.value)
                }
                placeholder={
                  traitementState.action === "VALIDER"
                    ? "Expliquez pourquoi vous approuvez cette demande..."
                    : "Expliquez pourquoi vous rejetez cette demande..."
                }
                rows={6}
                className="resize-none border-2 focus:border-purple-400"
              />
              <div className="flex justify-between items-center text-xs">
                <p className="text-muted-foreground">
                  {commentaire.length} caractère{commentaire.length > 1 ? 's' : ''}
                </p>
                {commentaire.length < 10 && commentaire.length > 0 && (
                  <p className="text-amber-600">Au moins 10 caractères recommandés</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setTraitementState({
                  open: false,
                  type: "FDM",
                  data: null,
                  action: null,
                })
              }
              disabled={isProcessing}
              className="px-6"
            >
              Annuler
            </Button>
            <Button
              onClick={handleTraiter}
              disabled={isProcessing || !commentaire.trim()}
              className={`px-6 ${
                traitementState.action === "VALIDER"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Traitement en cours...
                </>
              ) : (
                <>
                  {traitementState.action === "VALIDER" ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirmer l'approbation
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      Confirmer le rejet
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { TraitementPage };
