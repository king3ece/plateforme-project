import { User } from "./User";

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
  statut: "EN_ATTENTE" | "VALIDÉ" | "REJETÉ";
  commentaire?: string;
  dateTraitement: string; // ISO string
}

export interface BonPour {
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

  // Infos bon pour
  beneficiaire: string;
  motif: string;
  montantTotal: number;

  // Lignes
  lignes: LigneBonPour[];

  // Suivi administratif
  dateReglement?: string;
  regler: boolean;
  createDate: string;
  createBy: string;
  lastModified: string;
  lastModifiedBy: string;
  isDelete: boolean;
}

export interface CreateBonPourRequest {
  utilisateurId: number;
  typeProcessusId: number;
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
  validateurSuivantId?: number;
}
