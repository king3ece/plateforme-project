import { User } from './User';
import { TypeProcessus } from './Workflow';

export interface traitement {
    id: number;
    FicheDescriptiveDeMissionId: number;
    traiteur: User;
    Decision: ChoixDecision
}

export enum ChoixDecision{
     VALIDER = 'VALIDER',
    REJETER = 'REJETER',
    A_CORRIGER = 'A_CORRIGER'
}

// export interface Demande {
//   id: number;
//   userId: number;
//   user?: User;
//   typeDemande: TypeDemande;
//   typeProcessusId: number;
//   typeProcessus?: TypeProcessus;
//   statut: StatutDemande;
//   dateDebut?: string;
//   dateFin?: string;
//   motif: string;
//   piecesJointes?: string[];
//   createdAt?: string;
//   updatedAt?: string;
//   traitements?: Traitement[];
// }

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

export interface TraiterDemandeDTO {
  demandeId: number;
  statut: 'VALIDEE' | 'REJETEE';
  commentaire?: string;
}
