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
import { CheckCircle, Eye, Filter, MessageSquare, XCircle } from "lucide-react";

import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { BonPourAPI } from "../../api/bonpour";
import { RapportFinancierAPI } from "../../api/rfdm";
import { DemandeAchatAPI } from "../../api/demandeAchat";

import { FicheDescriptiveMission } from "../../types/Fdm";
import { BonPour } from "../../types/BonPour";
import { RapportFinancierDeMission } from "../../types/Rfdm";
import { DemandeAchat } from "../../types/DemandeAchat";

type RequestTab = RequestDetailType;
type DecisionMode = "REJETER" | "A_CORRIGER";

const ValidationPage = () => {
  const [activeTab, setActiveTab] = useState<RequestTab>("FDM");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [requests, setRequests] = useState({
    FDM: [] as FicheDescriptiveMission[],
    BONPOUR: [] as BonPour[],
    RFDM: [] as RapportFinancierDeMission[],
    DDA: [] as DemandeAchat[],
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

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [fdm, bp, rfdm, dda] = await Promise.all([
          FicheDescriptiveMissionAPI.getPendingValidations(),
          BonPourAPI.getPendingValidations(),
          RapportFinancierAPI.getPendingValidations(),
          DemandeAchatAPI.getPendingValidations(),
        ]);
        setRequests({ FDM: fdm, BONPOUR: bp, RFDM: rfdm, DDA: dda });
      } catch {
        toast.error("Erreur de chargement des validations");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const refreshTab = async () => {
    const loaders = {
      FDM: FicheDescriptiveMissionAPI.getPendingValidations,
      BONPOUR: BonPourAPI.getPendingValidations,
      RFDM: RapportFinancierAPI.getPendingValidations,
      DDA: DemandeAchatAPI.getPendingValidations,
    };
    const data = await loaders[activeTab]();
    setRequests((prev) => ({ ...prev, [activeTab]: data }));
  };

  /* ================= ACTIONS ================= */
  const handleApprove = async (type: RequestTab, id: number) => {
    const handlers = {
      FDM: FicheDescriptiveMissionAPI.traiter,
      BONPOUR: BonPourAPI.traiter,
      RFDM: RapportFinancierAPI.traiter,
      DDA: DemandeAchatAPI.traiter,
    };
    try {
      setIsProcessing(true);
      await handlers[type](id, { decision: "VALIDER" });
      toast.success("Demande approuvée");
      await refreshTab();
    } catch {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecision = async () => {
    if (!decisionState.data || !decisionComment.trim()) return;

    const handlers = {
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
      toast.success("Décision enregistrée");
      setDecisionState({ ...decisionState, open: false, data: null });
      setDecisionComment("");
      await refreshTab();
    } catch {
      toast.error("Erreur lors du traitement");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredRequests = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return requests[activeTab].filter((r: any) =>
      JSON.stringify(r).toLowerCase().includes(term)
    );
  }, [searchTerm, requests, activeTab]);

  /* ================= CARD ================= */
  const renderActions = (type: RequestTab, req: any) => (
    <div className="flex justify-between items-center pt-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDetailState({ open: true, type, data: req })}
      >
        <Eye className="h-4 w-4 mr-1" /> Détails
      </Button>

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isProcessing}
          onClick={() => handleApprove(type, req.id)}
        >
          <CheckCircle className="h-4 w-4 mr-1" /> Approuver
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            setDecisionState({ open: true, type, data: req, mode: "REJETER" })
          }
        >
          <XCircle className="h-4 w-4 mr-1" /> Rejeter
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setDecisionState({
              open: true,
              type,
              data: req,
              mode: "A_CORRIGER",
            })
          }
        >
          <MessageSquare className="h-4 w-4 mr-1" /> A corriger
        </Button>
      </div>
    </div>
  );

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Validation des demandes</h1>
          <p className="text-muted-foreground">
            Traitez rapidement les demandes en attente
          </p>
        </div>
        <Badge className="text-lg px-4 py-2">
          {Object.values(requests).reduce((a, b) => a + b.length, 0)} en attente
        </Badge>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="relative max-w-md">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ===== TABS ===== */}
      <Tabs
        value={activeTab}
        onValueChange={(v: RequestTab) => setActiveTab(v as RequestTab)}
      >
        <TabsList>
          <TabsTrigger value="FDM">FDM</TabsTrigger>
          <TabsTrigger value="BONPOUR">Bon pour</TabsTrigger>
          <TabsTrigger value="RFDM">Rapports</TabsTrigger>
          <TabsTrigger value="DDA">Achats</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <p className="text-center py-10">Chargement...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">
              Aucune demande à traiter
            </p>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req: any) => (
                <Card key={req.id}>
                  <CardHeader>
                    <CardTitle>
                      {req.nomProjet || req.objet || req.destination}
                    </CardTitle>
                    <CardDescription>
                      Émetteur : {req.emetteur.lastName} {req.emetteur.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>{renderActions(activeTab, req)}</CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== DIALOGS ===== */}
      <Dialog
        open={decisionState.open}
        onOpenChange={(o) => setDecisionState((p) => ({ ...p, open: o }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commentaire</DialogTitle>
            <DialogDescription>
              Merci de préciser votre décision
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={decisionComment}
            onChange={(e) => setDecisionComment(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDecisionState((p) => ({ ...p, open: false }))}
            >
              Annuler
            </Button>
            <Button onClick={handleDecision} disabled={isProcessing}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailState.open}
        onOpenChange={(o) => setDetailState((p) => ({ ...p, open: o }))}
      >
        <DialogContent className="max-w-3xl">
          {detailState.data && (
            <RequestDetailContent
              type={detailState.type}
              data={detailState.data}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ValidationPage };
