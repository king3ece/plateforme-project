import { User } from "./User";
import { Subdivision } from "./Subdivision";

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
  subdivisionId?: number;
  userId?: number;
}

export interface UpdateValidateurDTO {
  reference: string;
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
