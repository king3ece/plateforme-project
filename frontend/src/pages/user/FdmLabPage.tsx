import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { MissionForm } from "../../components/requests/FicheDescirptiveDeMissionForm";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { CreateFDMRequest, FicheDescriptiveMission, TraitementDecision, UpdateFDMRequest } from "../../types/Fdm";
import { Badge } from "../../components/ui/badge";

export const FdmLabPage = () => {
  const [lastFdm, setLastFdm] = useState<FicheDescriptiveMission | null>(null);

  // --- Update state ---
  const [updateRef, setUpdateRef] = useState("");
  const [updateInitial, setUpdateInitial] = useState<Partial<CreateFDMRequest>>({});
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [updateLoaded, setUpdateLoaded] = useState(false);

  // --- Traitement state ---
  const [traitementId, setTraitementId] = useState<number | undefined>(undefined);
  const [decision, setDecision] = useState<TraitementDecision>("VALIDER");
  const [commentaire, setCommentaire] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const lastInfo = useMemo(() => {
    if (!lastFdm) return null;
    return `${lastFdm.nomProjet} (id: ${lastFdm.id} / ref: ${lastFdm.reference})`;
  }, [lastFdm]);

  const handleCreate = async (data: any) => {
    try {
      const payload: CreateFDMRequest = {
        ...data,
        perdieme: Number(data.perdieme) || 0,
        transport: Number(data.transport) || 0,
        bonEssence: Number(data.bonEssence) || 0,
        peage: Number(data.peage) || 0,
        laisserPasser: Number(data.laisserPasser) || 0,
        hotel: Number(data.hotel) || 0,
        divers: Number(data.divers) || 0,
      };
      const created = await FicheDescriptiveMissionAPI.create(payload);
      setLastFdm(created);
      setTraitementId(created.id);
      toast.success("FDM créée", { description: `Référence: ${created.reference}` });
    } catch (error: any) {
      console.error("Création FDM échouée:", error);
      toast.error("Création impossible", {
        description: error?.response?.data?.message || error.message || "Erreur inconnue",
      });
    }
  };

  const handleLoadForUpdate = async () => {
    if (!updateRef.trim()) {
      toast.error("Saisir une référence pour charger la FDM");
      return;
    }
    setIsLoadingUpdate(true);
    try {
      const fdm = await FicheDescriptiveMissionAPI.getByRef(updateRef.trim());
      setUpdateInitial({
        nomProjet: fdm.nomProjet,
        lieuMission: fdm.lieuMission,
        dateDepart: fdm.dateDepart.slice(0, 10),
        dateProbableRetour: fdm.dateProbableRetour.slice(0, 10),
        dureeMission: fdm.dureeMission,
        objectifMission: fdm.objectifMission,
        perdieme: fdm.perdieme,
        transport: fdm.transport,
        bonEssence: fdm.bonEssence,
        peage: fdm.peage,
        laisserPasser: fdm.laisserPasser,
        hotel: fdm.hotel,
        divers: fdm.divers,
      });
      setUpdateLoaded(true);
      toast.success("FDM chargée", { description: `Prête à être modifiée (${fdm.reference})` });
    } catch (error: any) {
      console.error("Chargement FDM échoué:", error);
      toast.error("Impossible de charger la FDM", {
        description: error?.response?.data?.message || error.message || "Erreur inconnue",
      });
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!updateRef.trim()) {
      toast.error("Veuillez d'abord charger une FDM par sa référence");
      return;
    }
    try {
      const payload: UpdateFDMRequest = {
        reference: updateRef.trim(),
        nomProjet: data.nomProjet,
        lieuMission: data.lieuMission,
        dateDepart: data.dateDepart,
        dateProbableRetour: data.dateProbableRetour,
        dureeMission: data.dureeMission,
        objectifMission: data.objectifMission,
        perdieme: Number(data.perdieme) || 0,
        transport: Number(data.transport) || 0,
        bonEssence: Number(data.bonEssence) || 0,
        peage: Number(data.peage) || 0,
        laisserPasser: Number(data.laisserPasser) || 0,
        hotel: Number(data.hotel) || 0,
        divers: Number(data.divers) || 0,
      };
      const updated = await FicheDescriptiveMissionAPI.update(payload);
      setLastFdm(updated);
      setTraitementId(updated.id);
      toast.success("FDM mise à jour", { description: `Référence: ${updateRef}` });
    } catch (error: any) {
      console.error("Mise à jour FDM échouée:", error);
      toast.error("Erreur lors de la mise à jour", {
        description: error?.response?.data?.message || error.message || "Erreur inconnue",
      });
    }
  };

  const handleTraitement = async () => {
    if (!traitementId) {
      toast.error("Fournir l'id d'une FDM (ex: dernier id créé)");
      return;
    }
    if (decision !== "VALIDER" && !commentaire.trim()) {
      toast.error("Le commentaire est requis pour REJETER ou A_CORRIGER");
      return;
    }
    try {
      setIsProcessing(true);
      await FicheDescriptiveMissionAPI.traiter(traitementId, {
        decision,
        commentaire: commentaire.trim(),
      });
      toast.success("Traitement enregistré", { description: `${decision} envoyé` });
    } catch (error: any) {
      console.error("Traitement FDM échoué:", error);
      toast.error("Impossible de traiter la FDM", {
        description: error?.response?.data?.message || error.message || "Erreur inconnue",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FDM Lab</h1>
          <p className="text-muted-foreground">
            Tester rapidement la création, la modification et le traitement des FDM côté backend.
          </p>
        </div>
        {lastInfo && (
          <Badge variant="outline" className="text-sm">
            Dernière FDM : {lastInfo}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Créer une FDM</CardTitle>
          <CardDescription>
            Envoie un POST /fdms/add-fdm puis stocke l'id/référence pour les étapes suivantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MissionForm onSave={handleCreate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Modifier une FDM existante</CardTitle>
          <CardDescription>
            Charge une FDM par référence, édite puis envoie PUT /fdms (nécessite les champs obligatoires).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
            <div className="flex-1">
              <Label htmlFor="fdmRef">Référence FDM</Label>
              <Input
                id="fdmRef"
                placeholder="Copiez la référence renvoyée par la création"
                value={updateRef}
                onChange={(e) => setUpdateRef(e.target.value)}
              />
            </div>
            <Button onClick={handleLoadForUpdate} disabled={isLoadingUpdate}>
              {isLoadingUpdate ? "Chargement..." : "Charger"}
            </Button>
          </div>

          <Separator />

          {updateLoaded ? (
            <MissionForm initialData={updateInitial} onSave={handleUpdate} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Saisissez une référence puis cliquez sur Charger pour récupérer les données.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Traiter une FDM</CardTitle>
          <CardDescription>
            Appelle POST /fdms/{"{id}"}/traiter avec la décision choisie. Utilisez l'id du dernier create/mise à jour ou un id existant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fdmId">ID FDM</Label>
              <Input
                id="fdmId"
                type="number"
                value={traitementId ?? ""}
                onChange={(e) => setTraitementId(Number(e.target.value))}
                placeholder="Ex: 12"
              />
            </div>
            <div>
              <Label htmlFor="decision">Décision</Label>
              <select
                id="decision"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={decision}
                onChange={(e) => setDecision(e.target.value as TraitementDecision)}
              >
                <option value="VALIDER">VALIDER</option>
                <option value="REJETER">REJETER</option>
                <option value="A_CORRIGER">A_CORRIGER</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="commentaire">
              Commentaire (obligatoire pour REJETER / A_CORRIGER)
            </Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Détaillez la décision pour les notifications"
            />
          </div>
          <Button onClick={handleTraitement} disabled={isProcessing}>
            {isProcessing ? "Traitement..." : "Envoyer la décision"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
