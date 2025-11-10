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
  createDate?: string;
  lastModified?: string;
  createdBy?: number;
  lastModifiedBy?: number;
}

export interface Validateur {
  id: number;
  reference: string;
  typeProcessusId: number;
  ordre: number;
  subdivisionId?: number;
  userId?: number;
  user?: User;
  subdivision?: Subdivision;
  typeProcessus?: TypeProcessus;
}

export interface CreateTypeProcessusDTO {
  code: string;
  libelle: string;
}

export interface CreateValidateurDTO {
  typeProcessusId: number;
  ordre: number;
  subdivisionId?: number; // Optionnel car peut être null dans le backend
  userId?: number;
}

export interface UpdateValidateurDTO {
  reference: string; // Obligatoire pour identifier l'entité à modifier
  ordre?: number;
  userId?: number;
  typeProcessusId?: number;
  subdivisionId?: number;
}

export interface UpdateTypeProcessusDTO {
  reference: string; // Obligatoire pour identifier l'entité à modifier
  libelle?: string;
  code?: string;
}
