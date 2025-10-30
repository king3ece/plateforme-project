// import axiosInstance from './axios';
// import { Subdivision, CreateSubdivisionDTO, UpdateSubdivisionDTO } from '../types/Subdivision';
//
// export const subdivisionsAPI = {
//   getAll: async (): Promise<Subdivision[]> => {
//     const response = await axiosInstance.get<Subdivision[]>('/subdivisions');
//     return response.data;
//   },
//
//   getById: async (id: number): Promise<Subdivision> => {
//     const response = await axiosInstance.get<Subdivision>(`/subdivisions/${id}`);
//     return response.data;
//   },
//
//   create: async (data: CreateSubdivisionDTO): Promise<Subdivision> => {
//     const response = await axiosInstance.post<Subdivision>('/subdivisions', data);
//     return response.data;
//   },
//
//   update: async (id: number, data: UpdateSubdivisionDTO): Promise<Subdivision> => {
//     const response = await axiosInstance.put<Subdivision>(`/subdivisions/${id}`, data);
//     return response.data;
//   },
//
//   delete: async (id: number): Promise<void> => {
//     await axiosInstance.delete(`/subdivisions/${id}`);
//   },
// };

import axiosInstance from "./axios";
import {
  Subdivision,
  CreateSubdivisionDTO,
  UpdateSubdivisionDTO,
} from "../types/Subdivision";
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

export const subdivisionsAPI = {
  // ✅ Récupérer tous les subdivisions - Route et accès corrigés
  getAll: async (page = 0, size = 30): Promise<Subdivision[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<Subdivision>>
      >(`/subdivisions/not-deleted?page=${page}&size=${size}`);
      console.log("✅ Response complète:", response.data);
      console.log("✅ Subdivisions récupérés:", response.data.object.content);

      // ✅ Accès correct : response.data.object.content
      return response.data.object.content;
    } catch (error) {
      console.error("❌ Error fetching subdivisions:", error);
      throw error;
    }
  },

  // ✅ Récupérer une subdivision par référence
  getByReference: async (reference: string): Promise<Subdivision> => {
    const response = await axiosInstance.get<ApiResponse<Subdivision>>(
      `/subdivisions/get-subdivision/${reference}`
    );
    return response.data.object; // ✅ Changé de .data à .object
  },

  // ✅ Créer une subdivision
  create: async (subdivision: CreateSubdivisionDTO): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      "/subdivisions/add-subdivision",
      subdivision
    );
  },

  // ✅ Mettre à jour une subdivision
  update: async (subdivision: UpdateSubdivisionDTO): Promise<void> => {
    await axiosInstance.put<ApiResponse<string>>("/subdivisions", subdivision);
  },

  // ✅ Supprimer une subdivision (soft delete) par référence
  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<string>>(
      `/subdivisions/delete-subdivision/${reference}`
    );
  },
};
