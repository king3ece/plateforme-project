// import axiosInstance from './axios';
// import { Poste, CreatePosteDTO, UpdatePosteDTO } from '../types/Poste';
//
// export const postesAPI = {
//   getAll: async (): Promise<Poste[]> => {
//     const response = await axiosInstance.get<Poste[]>('/postes/not-deleted');
//     return response.data;
//   },
//
//   getById: async (id: number): Promise<Poste> => {
//     const response = await axiosInstance.get<Poste>(`/postes/{Ref}`);
//     return response.data;
//   },
//
//   create: async (data: CreatePosteDTO): Promise<Poste> => {
//     const response = await axiosInstance.post<Poste>('/postes/add-poste', data);
//     return response.data;
//   },
//
//   update: async (id: number, data: UpdatePosteDTO): Promise<Poste> => {
//     const response = await axiosInstance.put<Poste>(`/postes/update-post${id}`, data);
//     return response.data;
//   },
//
//   delete: async (id: number): Promise<void> => {
//     await axiosInstance.delete(`/postes/{Ref}`);
//   },
// };


// api/postes.ts
import axiosInstance from "./axios";
import { Poste, CreatePosteDTO, UpdatePosteDTO } from "../types/Poste";

// ✅ Interface correspondant à VOTRE réponse backend
interface ApiResponse<T> {
  code: number; // Pas "status"
  message: string;
  object: T; // Pas "data"
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  pageable: any;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export const postesAPI = {
  // ✅ Récupérer tous les postes - Route et accès corrigés
  getAll: async (page = 0, size = 30): Promise<Poste[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<Poste>>
      >(`/postes/not-deleted?page=${page}&size=${size}`);
      console.log("✅ Response complète:", response.data);
      console.log("✅ Postes récupérés:", response.data.object.content);

      // ✅ Accès correct : response.data.object.content
      return response.data.object.content;
    } catch (error) {
      console.error("❌ Error fetching postes:", error);
      throw error;
    }
  },

  // ✅ Récupérer un poste par référence
  getByReference: async (reference: string): Promise<Poste> => {
    const response = await axiosInstance.get<ApiResponse<Poste>>(
      `/postes/get-poste/${reference}`
    );
    return response.data.object; // ✅ Changé de .data à .object
  },

  // ✅ Créer un poste
  create: async (poste: CreatePosteDTO): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>("/postes/add-poste", poste);
  },

  // ✅ Mettre à jour un poste
  update: async (poste: UpdatePosteDTO): Promise<void> => {
    await axiosInstance.put<ApiResponse<string>>("/postes", poste);
  },

  // ✅ Supprimer un poste (soft delete) par référence
  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<string>>(
      `/postes/delete-poste/${reference}`
    );
  },
};
