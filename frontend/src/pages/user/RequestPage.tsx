import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { toast } from "sonner";
import { MissionForm } from "../../components/requests/FicheDescirptiveDeMissionForm";
import { RapportFinancierForm } from "../../components/requests/RapportFinancierDeMission";
import { DemandeAchatForm } from "../../components/requests/DemandeAchat";
import { BonPourForm } from "../../components/requests/BonPour";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { BonPourAPI } from "../../api/bonpour";
import { RapportFinancierAPI } from "../../api/rfdm";
import { DemandeAchatAPI } from "../../api/dda";
import { CreateFDMRequest } from "../../types/Fdm";
import { CreateBonPourRequest } from "../../types/BonPour";
import { CreateRapportFinancierRequest } from "../../types/Rfdm";
import { CreateDemandeAchatRequest } from "../../types/DemandeAchat";
import { RequestType } from "../../types/request";
import { useAuth } from "../../hooks/useAuth";

type RequestTypeUI = RequestType | "DDA" | "FORMATION" | "MISSION" | "AUTRE";

export function RequestPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<RequestTypeUI | "">("");
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer l'utilisateur connecté depuis le contexte d'auth
  // Utilise le hook `useAuth` fourni dans `src/hooks/useAuth.ts`
  const { user, isLoading: authLoading } = useAuth();

  const typeLabels: Record<RequestTypeUI, string> = {
    [RequestType.FDM]: "Fiche descriptive de mission",
    [RequestType.RFDM]: "Rapport Financier de mission",
    DDA: "Demande d'achat (Détaillée)",
    [RequestType.BONPOUR]: "Bon pour",
    [RequestType.CONGE]: "Demande de congé",
    FORMATION: "Demande de formation",
    [RequestType.ACHAT]: "Demande d'achat (Simple)",
    MISSION: "Demande de mission",
    [RequestType.AUTRE]: "Autre demande",
  };

  const handleSaveFDM = async (formData: any): Promise<void> => {
    try {
      if (!user) {
        toast.error("Utilisateur non connecté. Veuillez vous reconnecter.");
        return;
      }

      setIsLoading(true);

      // Préparer les données selon le format attendu par l'API
      const fdmData: CreateFDMRequest = {
        nomProjet: formData.nomProjet,
        lieuMission: formData.lieuMission,
        dateDepart: formData.dateDepart,
        dateProbableRetour: formData.dateProbableRetour,
        dureeMission: formData.dureeMission,
        objectifMission: formData.objectifMission,
        perdieme: Number(formData.perdieme) || 0,
        transport: Number(formData.transport) || 0,
        bonEssence: Number(formData.bonEssence) || 0,
        peage: Number(formData.peage) || 0,
        laisserPasser: Number(formData.laisserPasser) || 0,
        hotel: Number(formData.hotel) || 0,
        divers: Number(formData.divers) || 0,
      };

      // Appel API via le service
      const result = await FicheDescriptiveMissionAPI.create(fdmData);

      console.log("✅ FDM créée avec succès:", result);

      toast.success("Fiche descriptive de mission créée avec succès", {
        description: `Référence: ${result.reference}`,
      });

      navigate("/user/demandes");
    } catch (error: any) {
      console.error("❌ Erreur lors de la création de la FDM:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création de la demande";

      toast.error("Erreur lors de l'enregistrement", {
        description: errorMessage,
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRFDM = async (formData: any): Promise<void> => {
    try {
      if (!user) {
        toast.error("Utilisateur non connecté. Veuillez vous reconnecter.");
        return;
      }
      setIsLoading(true);

      const payload: CreateRapportFinancierRequest = {
        objet: formData.objet,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        hotelDejeuner: Number(formData.hotelDejeuner) || 0,
        telephone: Number(formData.telephone) || 0,
        transport: Number(formData.transport) || 0,
        indemnites: Number(formData.indemnites) || 0,
        laisserPasser: Number(formData.laisserPasser) || 0,
        coutDivers: Number(formData.coutDivers) || 0,
        montantRecu: Number(formData.montantRecu) || 0,
        montantDepense: Number(formData.montantDepense) || 0,
        commentaire: formData.commentaire,
      };

      const result = await RapportFinancierAPI.create(payload);

      toast.success("Rapport financier créé avec succès", {
        description: `Référence: ${result.reference}`,
      });
      navigate("/user/demandes");
    } catch (error: any) {
      console.error("❌ Erreur RFDM:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'enregistrement du rapport financier";
      toast.error("Erreur lors de l'enregistrement du rapport financier", {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDemandeAchat = async (formData: any): Promise<void> => {
    try {
      if (!user) {
        toast.error("Utilisateur non connecté. Veuillez vous reconnecter.");
        return;
      }
      setIsLoading(true);

      const payload: CreateDemandeAchatRequest = {
        destination: formData.destination,
        fournisseur: formData.fournisseur,
        service: formData.service,
        client: formData.client,
        montantProjet: Number(formData.montantProjet) || 0,
        commentaire: formData.commentaire,
        lignes: formData.lignes.map((ligne: any) => ({
          designation: ligne.designation,
          ligneReference: ligne.reference,
          prixUnitaire: Number(ligne.prixUnitaire) || 0,
          quantite: Number(ligne.quantite) || 0,
        })),
      };

      const result = await DemandeAchatAPI.create(payload);

      toast.success("Demande d'achat créée avec succès", {
        description: `Référence: ${result.reference}`,
      });
      navigate("/user/demandes");
    } catch (error: any) {
      console.error("❌ Erreur demande d'achat:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'enregistrement de la demande d'achat";
      toast.error("Erreur lors de l'enregistrement de la demande d'achat", {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBonPour = async (formData: any): Promise<void> => {
    try {
      if (!user) {
        toast.error("Utilisateur non connecté. Veuillez vous reconnecter.");
        return;
      }

      setIsLoading(true);

      // Préparer les données selon le format attendu par l'API
      const bonPourData: CreateBonPourRequest = {
        beneficiaire: formData.beneficiaire,
        motif: formData.motif,
        lignes: formData.lignes.map((ligne: any) => ({
          libelle: ligne.libelle,
          montant: Number(ligne.montant) || 0,
        })),
      };

      // Appel API via le service
      const result = await BonPourAPI.create(bonPourData);

      console.log("✅ Bon pour créé avec succès:", result);

      toast.success("Bon pour créé avec succès", {
        description: `Référence: ${result.reference}`,
      });

      navigate("/user/demandes");
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du bon pour:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création du bon pour";

      toast.error("Erreur lors de l'enregistrement", {
        description: errorMessage,
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormByType = () => {
    if (!selectedType) {
      return (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <p>Veuillez sélectionner un type de demande ci-dessus</p>
          </CardContent>
        </Card>
      );
    }

    switch (selectedType) {
      case RequestType.FDM:
        return (
          <MissionForm
            onSave={handleSaveFDM}
            isLoading={isLoading}
          />
        );

      case RequestType.RFDM:
        return (
          <RapportFinancierForm onSave={handleSaveRFDM} isLoading={isLoading} />
        );

      case "DDA":
        return (
          <DemandeAchatForm
            onSave={handleSaveDemandeAchat}
            isLoading={isLoading}
          />
        );

      case RequestType.BONPOUR:
        return (
          <BonPourForm
            onSave={handleSaveBonPour}
            isLoading={isLoading}
          />
        );

      case RequestType.CONGE:
      case "FORMATION":
      case RequestType.ACHAT:
      case "MISSION":
      case RequestType.AUTRE:
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-amber-600 font-medium">
                Formulaire pour "{typeLabels[selectedType]}" en cours de
                développement
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ce type de demande sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/user/demandes")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux demandes
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sélectionnez le type de demande et remplissez le formulaire
            correspondant
          </p>
        </div>
      </div>

      <Card className="flex-shrink-0 mb-6">
        <CardHeader>
          <CardTitle>Type de demande</CardTitle>
          <CardDescription>
            Choisissez le type de demande que vous souhaitez créer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="requestType">Type de demande *</Label>
            <Select
              value={selectedType}
              onValueChange={(value: RequestTypeUI) => setSelectedType(value)}
            >
              <SelectTrigger id="requestType" className="mt-1">
                <SelectValue placeholder="Sélectionner un type de demande" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(typeLabels).map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeLabels[type as RequestTypeUI]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="pb-6">{renderFormByType()}</div>
      </div>
    </div>
  );
}
