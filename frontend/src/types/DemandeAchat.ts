import { User } from "./User";
import { TypeProcessus, Validateur } from "./Workflow";
import { TraitementDecision } from "./Fdm";

export interface LigneDemandeAchat {
  id?: number;
  reference?: string;
  designation: string;
  ligneReference?: string;
  prixUnitaire: number;
  quantite: number;
}

export interface TraitementDemandeAchat {
  id: number;
  reference: string;
  traiteur: User;
  decision: TraitementDecision;
  commentaire?: string;
  dateTraitement: string;
}

export interface DemandeAchat {
  id: number;
  reference: string;
  dateEmission: string;
  favorable: boolean;
  traite: boolean;
  emetteur: User;
  typeProcessus?: TypeProcessus;
  validateurSuivant?: Validateur | null;
  traitementPrecedent?: TraitementDemandeAchat | null;

  destination: string;
  fournisseur: string;
  service: string;
  client: string;
  montantProjet?: number;
  prixTotal: number;
  commentaire?: string;
  lignes: LigneDemandeAchat[];
  dateReglement?: string | null;
  regler: boolean;
}

export interface CreateDemandeAchatRequest {
  destination: string;
  fournisseur: string;
  service: string;
  client: string;
  montantProjet?: number;
  commentaire?: string;
  lignes: LigneDemandeAchat[];
}

export interface UpdateDemandeAchatRequest extends CreateDemandeAchatRequest {
  reference: string;
}
