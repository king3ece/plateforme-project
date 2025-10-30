import { User } from "./User";

/**
 * Tout les processus lié à FDM. Créer une demande, Traitement de la demande
 */
// Représente un traitement lié à une FDM
export interface TraitementFicheDescriptiveMission {
  id: number;
  reference: string;
  traiteur: User;
  statut: "EN_ATTENTE" | "VALIDÉ" | "REJETÉ";
  commentaire?: string;
  dateTraitement: string; // ISO string
}

export interface FicheDescriptiveMission {
  id: number;
  reference: string;
  dateEmission: string; // ISO string
  favorable?: boolean;
  traite?: boolean;

  // Relations
  typeProcessusId: number;
  validateurSuivantId?: number;
  utilisateurId: number; // emetteur
  traitementPrecedentId?: number;

  // Infos mission
  nomProjet: string;
  lieuMission: string;
  dateDepart: string; // format YYYY-MM-DD
  dateProbableRetour: string; // format YYYY-MM-DD
  dureeMission: number;
  objectifMission: string;

  // Estimations financières
  perdieme: number;
  transport: number;
  bonEssence: number;
  peage: number;
  laisserPasser: number;
  hotel: number;
  divers: number;
  totalEstimatif: number;

  // Suivi administratif
  dateReglement?: string;
  regler: boolean;
  createDate: string;
  createBy: string;
  lastModified: string;
  lastModifiedBy: string;
  isDelete: boolean;
}

export interface CreateFDMRequest {
  utilisateurId: number;
  typeProcessusId: number;
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
  validateurSuivantId?: number;
}
