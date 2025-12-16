import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { toast } from "sonner";
import { MissionForm } from "../../components/requests/FicheDescirptiveDeMissionForm";
import { RapportFinancierForm } from "../../components/requests/RapportFinancierDeMission";
import { DemandeAchatForm } from "../../components/requests/DemandeAchat";
import { BonPourForm } from "../../components/requests/BonPour";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { BonPourAPI } from "../../api/bonpour";
import { RapportFinancierAPI } from "../../api/rfdm";
import { DemandeAchatAPI } from "../../api/demandeAchat";
import { FicheDescriptiveMission, UpdateFDMRequest } from "../../types/Fdm";
import { BonPour, UpdateBonPourRequest } from "../../types/BonPour";
import { RapportFinancierDeMission, UpdateRapportFinancierRequest } from "../../types/Rfdm";
import { DemandeAchat, UpdateDemandeAchatRequest } from "../../types/DemandeAchat";

type RequestTypeParam = "fdm" | "bonpour" | "rfdm" | "dda";

export function EditRequestPage() {
  const navigate = useNavigate();
  const { type, reference } = useParams<{ type: RequestTypeParam; reference: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [demande, setDemande] = useState<FicheDescriptiveMission | BonPour | RapportFinancierDeMission | DemandeAchat | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!type || !reference) {
      setError("Type de demande ou référence manquant");
      setIsLoading(false);
      return;
    }

    loadDemande();
  }, [type, reference]);

  const loadDemande = async () => {
    if (!type || !reference) return;

    setIsLoading(true);
    setError("");

    try {
      let data;
      switch (type) {
        case "fdm":
          data = await FicheDescriptiveMissionAPI.getByRef(reference);
          break;
        case "bonpour":
          data = await BonPourAPI.getByRef(reference);
          break;
        case "rfdm":
          data = await RapportFinancierAPI.getByRef(reference);
          break;
        case "dda":
          data = await DemandeAchatAPI.getByRef(reference);
          break;
        default:
          throw new Error("Type de demande invalide");
      }

      // Vérifier si la demande peut être modifiée
      if (data.traitementPrecedent?.decision === "VALIDER") {
        setError("Cette demande a déjà été validée et ne peut plus être modifiée");
        setIsLoading(false);
        return;
      }

      setDemande(data);
    } catch (error: any) {
      console.error("Erreur chargement demande:", error);
      setError(error.response?.data?.message || "Erreur lors du chargement de la demande");
      toast.error("Impossible de charger la demande");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFDM = async (formData: any) => {
    if (!demande || !reference) return;

    setIsSaving(true);
    try {
      const fdm = demande as FicheDescriptiveMission;
      const updateData: UpdateFDMRequest = {
        id: fdm.id,
        reference: fdm.reference,
        nomProjet: formData.nomProjet,
        lieuMission: formData.lieuMission,
        dateDepart: formData.dateDepart,
        dateProbableRetour: formData.dateProbableRetour,
        dureeMission: formData.dureeMission,
        objectifMission: formData.objectifMission,
        perdieme: formData.perdieme,
        transport: formData.transport,
        bonEssence: formData.bonEssence,
        peage: formData.peage,
        laisserPasser: formData.laisserPasser,
        hotel: formData.hotel,
        divers: formData.divers,
      };

      await FicheDescriptiveMissionAPI.update(updateData);
      toast.success("Fiche descriptive de mission modifiée avec succès");
      navigate("/user/demandes");
    } catch (error: any) {
      console.error("Erreur modification FDM:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBonPour = async (formData: any) => {
    if (!demande || !reference) return;

    setIsSaving(true);
    try {
      const bonPour = demande as BonPour;
      const updateData: UpdateBonPourRequest = {
        id: bonPour.id,
        reference: bonPour.reference,
        beneficiaire: formData.beneficiaire,
        motif: formData.motif,
        lignes: formData.lignes,
      };

      await BonPourAPI.update(updateData);
      toast.success("Bon pour modifié avec succès");
      navigate("/user/demandes");
    } catch (error: any) {
      console.error("Erreur modification Bon Pour:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRFDM = async (formData: any) => {
    if (!demande || !reference) return;

    setIsSaving(true);
    try {
      const rfdm = demande as RapportFinancierDeMission;
      const updateData: UpdateRapportFinancierRequest = {
        id: rfdm.id,
        reference: rfdm.reference,
        objet: formData.objet,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        depenses: formData.depenses,
      };

      await RapportFinancierAPI.update(updateData);
      toast.success("Rapport financier modifié avec succès");
      navigate("/user/demandes");
    } catch (error: any) {
      console.error("Erreur modification RFDM:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDDA = async (formData: any) => {
    if (!demande || !reference) return;

    setIsSaving(true);
    try {
      const dda = demande as DemandeAchat;
      const updateData: UpdateDemandeAchatRequest = {
        id: dda.id,
        reference: dda.reference,
        destination: formData.destination,
        fournisseur: formData.fournisseur,
        service: formData.service,
        client: formData.client,
        lignes: formData.lignes,
      };

      await DemandeAchatAPI.update(updateData);
      toast.success("Demande d'achat modifiée avec succès");
      navigate("/user/demandes");
    } catch (error: any) {
      console.error("Erreur modification DDA:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const getPageTitle = () => {
    switch (type) {
      case "fdm":
        return "Modifier la Fiche Descriptive de Mission";
      case "bonpour":
        return "Modifier le Bon Pour";
      case "rfdm":
        return "Modifier le Rapport Financier";
      case "dda":
        return "Modifier la Demande d'Achat";
      default:
        return "Modifier la demande";
    }
  };

  const getPageDescription = () => {
    switch (type) {
      case "fdm":
        return "Modifiez les informations de votre fiche descriptive de mission";
      case "bonpour":
        return "Modifiez les informations de votre bon pour";
      case "rfdm":
        return "Modifiez les informations de votre rapport financier";
      case "dda":
        return "Modifiez les informations de votre demande d'achat";
      default:
        return "Modifiez les informations de votre demande";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate("/user/demandes")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à mes demandes
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Impossible de charger la demande"}
          </AlertDescription>
        </Alert>

        <div className="mt-6">
          <Button onClick={() => navigate("/user/demandes")}>
            Retour à mes demandes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate("/user/demandes")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à mes demandes
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{getPageTitle()}</CardTitle>
          <CardDescription>{getPageDescription()}</CardDescription>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Référence: <span className="font-mono font-semibold">{reference}</span>
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent>
          {type === "fdm" && (
            <MissionForm
              initialData={{
                nomProjet: (demande as FicheDescriptiveMission).nomProjet,
                lieuMission: (demande as FicheDescriptiveMission).lieuMission,
                dateDepart: (demande as FicheDescriptiveMission).dateDepart,
                dateProbableRetour: (demande as FicheDescriptiveMission).dateProbableRetour,
                dureeMission: (demande as FicheDescriptiveMission).dureeMission,
                objectifMission: (demande as FicheDescriptiveMission).objectifMission,
                perdieme: (demande as FicheDescriptiveMission).perdieme,
                transport: (demande as FicheDescriptiveMission).transport,
                bonEssence: (demande as FicheDescriptiveMission).bonEssence,
                peage: (demande as FicheDescriptiveMission).peage,
                laisserPasser: (demande as FicheDescriptiveMission).laisserPasser,
                hotel: (demande as FicheDescriptiveMission).hotel,
                divers: (demande as FicheDescriptiveMission).divers,
              }}
              onSave={handleSaveFDM}
              isLoading={isSaving}
            />
          )}

          {type === "bonpour" && (
            <BonPourForm
              initialData={{
                beneficiaire: (demande as BonPour).beneficiaire,
                motif: (demande as BonPour).motif,
                lignes: (demande as BonPour).lignes,
              }}
              onSave={handleSaveBonPour}
              isLoading={isSaving}
            />
          )}

          {type === "rfdm" && (
            <RapportFinancierForm
              initialData={{
                objet: (demande as RapportFinancierDeMission).objet,
                dateDebut: (demande as RapportFinancierDeMission).dateDebut,
                dateFin: (demande as RapportFinancierDeMission).dateFin,
                depenses: (demande as RapportFinancierDeMission).depenses,
              }}
              onSave={handleSaveRFDM}
              isLoading={isSaving}
            />
          )}

          {type === "dda" && (
            <DemandeAchatForm
              initialData={{
                destination: (demande as DemandeAchat).destination,
                fournisseur: (demande as DemandeAchat).fournisseur,
                service: (demande as DemandeAchat).service,
                client: (demande as DemandeAchat).client,
                lignes: (demande as DemandeAchat).lignes,
              }}
              onSave={handleSaveDDA}
              isLoading={isSaving}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
