import { User } from './User';
import { TypeProcessus } from './Workflow';

export enum StatutDemande {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  VALIDEE = 'VALIDEE',
  REJETEE = 'REJETEE'
}

export enum TypeDemande {
  // Fiche descriptive de mission
  FDM = 'FDM',
  // Demande d'achat
  ACHAT = 'ACHAT',
  // Rapport financier de mission
  RFDM = 'RFDM',
  // Bon pour
  BON_POUR = 'BON_POUR',
  PERMISSION = 'PERMISSION',
  CONGE = 'CONGE',
  AUTRE = 'AUTRE'
}

export interface Demande {
  id: number;
  userId: number;
  user?: User;
  typeDemande: TypeDemande;
  typeProcessusId: number;
  typeProcessus?: TypeProcessus;
  statut: StatutDemande;
  dateDebut?: string;
  dateFin?: string;
  motif: string;
  piecesJointes?: string[];
  createdAt?: string;
  updatedAt?: string;
  traitements?: Traitement[];
}

export interface Traitement {
  id: number;
  demandeId: number;
  validateurId: number;
  validateur?: User;
  ordre: number;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  commentaire?: string;
  dateTraitement?: string;
  createdAt?: string;
}

export interface CreateDemandeDTO {
  typeDemande: TypeDemande;
  typeProcessusId: number;
  dateDebut?: string;
  dateFin?: string;
  motif: string;
  piecesJointes?: File[];
}

export interface TraiterDemandeDTO {
  demandeId: number;
  statut: 'VALIDEE' | 'REJETEE';
  commentaire?: string;
}
