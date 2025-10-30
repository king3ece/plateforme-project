import { Subdivision } from './Subdivision';


export interface Poste {
    id: number;
    reference: string;
    code: string;
    libelle: string;
    subdivision?:{
      id: number;
      reference: string;
      code: string; 
      libelle: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePosteDTO {
  code: string;
  libelle: string;
}

export interface UpdatePosteDTO {
  reference: string; // ✅ Obligatoire pour l'update
  code: string;
  libelle: string;
}


// export interface UpdatePosteDTO {
//   code?: string;
//   libelle?: string;
// }