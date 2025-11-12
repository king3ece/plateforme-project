import { User } from "./User";
import { TypeProcessus, Validateur } from "./Workflow";
import { TraitementDecision } from "./Fdm";

export interface TraitementRapportFinancier {
  id: number;
  reference: string;
  traiteur: User;
  decision: TraitementDecision;
  commentaire?: string;
  dateTraitement: string;
}

export interface RapportFinancierDeMission {
  id: number;
  reference: string;
  dateEmission: string;
  favorable: boolean;
  traite: boolean;
  emetteur: User;
  typeProcessus?: TypeProcessus;
  validateurSuivant?: Validateur | null;
  traitementPrecedent?: TraitementRapportFinancier | null;

  objet: string;
  dateDebut: string;
  dateFin: string;
  hotelDejeuner: number;
  telephone: number;
  transport: number;
  indemnites: number;
  laisserPasser: number;
  coutDivers: number;
  totalDepenses: number;
  montantRecu: number;
  montantDepense: number;
  commentaire?: string;
  dateReglement?: string | null;
  regler: boolean;
}

export interface CreateRapportFinancierRequest {
  objet: string;
  dateDebut: string;
  dateFin: string;
  hotelDejeuner: number;
  telephone: number;
  transport: number;
  indemnites: number;
  laisserPasser: number;
  coutDivers: number;
  montantRecu: number;
  montantDepense: number;
  commentaire?: string;
}

export interface UpdateRapportFinancierRequest extends CreateRapportFinancierRequest {
  reference: string;
}
