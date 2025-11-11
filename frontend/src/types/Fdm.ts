import { User } from "./User";
import { TypeProcessus, Validateur } from "./Workflow";

export type TraitementDecision = "VALIDER" | "REJETER" | "A_CORRIGER";

/**
 * Traitement réalisé sur une FDM (avis d'un validateur)
 */
export interface TraitementFicheDescriptiveMission {
  id: number;
  reference: string;
  traiteur: User;
  decision: TraitementDecision;
  commentaire?: string;
  dateTraitement: string;
}

export interface FicheDescriptiveMission {
  id: number;
  reference: string;
  dateEmission: string;
  favorable: boolean;
  traite: boolean;

  emetteur: User;
  typeProcessus?: TypeProcessus;
  validateurSuivant?: Validateur | null;
  traitementPrecedent?: TraitementFicheDescriptiveMission | null;

  nomProjet: string;
  lieuMission: string;
  dateDepart: string;
  dateProbableRetour: string;
  dureeMission: number;
  objectifMission: string;

  perdieme: number;
  transport: number;
  bonEssence: number;
  peage: number;
  laisserPasser: number;
  hotel: number;
  divers: number;
  totalEstimatif: number;

  dateReglement?: string | null;
  regler: boolean;
  createDate?: string;
  lastModified?: string;
  createdBy?: number;
  lastModifiedBy?: number;
  delete?: boolean;
}

export interface CreateFDMRequest {
  nomProjet: string;
  lieuMission: string;
  dateDepart: string;
  dateProbableRetour: string;
  dureeMission: number;
  objectifMission: string;
  perdieme: number;
  transport: number;
  bonEssence: number;
  peage: number;
  laisserPasser: number;
  hotel: number;
  divers: number;
}

export interface UpdateFDMRequest {
  id: number;
  nomProjet?: string;
  lieuMission?: string;
  dateDepart?: string;
  dateProbableRetour?: string;
  dureeMission?: number;
  objectifMission?: string;
  perdieme?: number;
  transport?: number;
  bonEssence?: number;
  peage?: number;
  laisserPasser?: number;
  hotel?: number;
  divers?: number;
  regler?: boolean;
  favorable?: boolean;
  traite?: boolean;
}
