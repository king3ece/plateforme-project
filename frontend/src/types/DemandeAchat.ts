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
  prixTotal?: number; // Calculé automatiquement côté backend
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

  // Nouveaux champs pour gestion financière
  remise?: number;
  prixTotalEffectif: number;
  tva: number;
  ttc: number;
  appliquerTva: boolean;

  // Champs de livraison
  delaiLivraison?: string;
  lieuLivraison?: string;
  conditionPaiement?: string;

  // Fichiers
  fichierProforma?: string;
  fichierBonCommande?: string;

  // Statuts
  commander: boolean;
  commentaire?: string;
  lignes: LigneDemandeAchat[];
  dateReglement?: string | null;
  regler: boolean;

  // Champs audit
  createDate?: string;
  lastModified?: string;
  createdBy?: number;
  lastModifiedBy?: number;
  delete?: boolean;
}

export interface CreateDemandeAchatRequest {
  destination: string;
  fournisseur: string;
  service: string;
  client: string;
  montantProjet?: number;
  commentaire?: string;
  lignes: LigneDemandeAchat[];

  // Champs financiers optionnels
  remise?: number;
  appliquerTva?: boolean;

  // Champs de livraison optionnels
  delaiLivraison?: string;
  lieuLivraison?: string;
  conditionPaiement?: string;

  // Fichiers optionnels
  fichierProforma?: string;
}

export interface UpdateDemandeAchatRequest extends CreateDemandeAchatRequest {
  reference: string;
}
