import { Subdivision } from "./Subdivision";

export interface TypeSubdivision {
  id: number;
  reference: string;
  code: string;
  libelle: string;
  // subdivision: Subdivision;
  createdAt?: string;   
  updatedAt?: string;
}

export interface CreateTypeSubdivisionDTO {
  code: string;
  libelle: string;
}

export interface UpdateTypeSubdivisionDTO {
  reference: string; // Obligatoire pour identifier l'entité à modifier
  code: string;
  libelle: string;
}

