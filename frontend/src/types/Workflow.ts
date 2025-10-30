import { User } from "./User";
import { Poste } from "./Poste";
import { Subdivision } from "./Subdivision";
import { TypeDemande } from "./Demande";
import { TypeSubdivision } from "./TypeSubdivision";

export interface TypeProcessus {
  id: number;
  reference: string;
  code: string;
  libelle: string;
  typeDemande: TypeDemande;
  subdivisionId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Validateur {
  id: number;
  reference: string;
  typeProcessusId: number;
  ordre: number;
  subdivisionId: number;
  userId?: number;
  posteId?: number;
  user?: User;
  poste?: Poste;
}

export interface CreateTypeProcessusDTO {
  code: string;
  libelle: string;
  subdivisions: Subdivision[];
  typeDemande: TypeDemande;
}

export interface CreateValidateurDTO {
  typeProcessusId: number;
  ordre: number;
  userId?: number;
  user?: User;
  posteId?: number;
  poste: Poste;
}

export interface UpdateValidateurDTO {
  ordre?: number;
  userId?: number;
  posteId?: number;
}

export interface UpdateTypeProcessusDTO {
  libelle?: string;
  code?: string;
  subdivision?: Subdivision[];
  // typeSubdivision?: TypeSubdivision[]
}
