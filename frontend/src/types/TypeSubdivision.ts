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
  code: string;
  libelle: string;
}

