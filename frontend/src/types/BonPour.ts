import { User } from "./User";
import { TraitementDecision } from "./Fdm";
import { TypeProcessus, Validateur } from "./Workflow";

/**
 * Tout les processus lié au Bon Pour. Créer une demande, Traitement de la demande
 */

// Représente une ligne de bon pour
export interface LigneBonPour {
  id?: number;
  reference?: string;
  libelle: string;
  montant: number;
  createDate?: string;
  createBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isDelete?: boolean;
}

// Représente un traitement lié à un Bon Pour
export interface TraitementBonPour {
  id: number;
  reference: string;
  traiteur: User;
  decision: TraitementDecision;
  commentaire?: string;
  dateTraitement: string;
}

export interface BonPour {
  id: number;
  reference: string;
  dateEmission: string;
  favorable: boolean;
  traite: boolean;

  emetteur: User;
  typeProcessus?: TypeProcessus;
  validateurSuivant?: Validateur | null;
  traitementPrecedent?: TraitementBonPour | null;

  beneficiaire: string;
  motif: string;
  montantTotal: number;

  lignes: LigneBonPour[];

  dateReglement?: string | null;
  regler: boolean;
  createDate?: string;
  createBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  delete?: boolean;
}

export interface CreateBonPourRequest {
  beneficiaire: string;
  motif: string;
  lignes: LigneBonPour[];
}

export interface UpdateBonPourRequest {
  id: number;
  beneficiaire?: string;
  motif?: string;
  lignes?: LigneBonPour[];
  regler?: boolean;
  favorable?: boolean;
  traite?: boolean;
}
