import { TypeSubdivision } from "./TypeSubdivision";

export interface Subdivision {
  id: number;
  reference: string;
  code: string;
  libelle: string;
  typeSubdivision: TypeSubdivision;
  // ✅ Si vous voulez inclure les infos de typeSubdivision dans une subdivision
  // typeSubdivision?: {
  //   id: number;
  //   reference: string;
  //   code: string;
  //   libelle: string;
  // };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubdivisionDTO {
  code: string;
  libelle: string;
  typeSubdivisionReference: string;
}

export interface UpdateSubdivisionDTO {
  reference: string; // ✅ Obligatoire pour l'update
  code: string;
  libelle: string;
  typeSubdivisionReference?: string;
}
