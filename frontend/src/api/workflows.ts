import axiosInstance from './axios';
import { TypeProcessus, Validateur, CreateTypeProcessusDTO, CreateValidateurDTO, UpdateValidateurDTO } from '../types/Workflow';

interface ApiResponse<T> {
  code: number;
  message: string;
  object: T;
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

export const workflowsAPI = {
  // ============ TYPE PROCESSUS ============

  // Récupérer tous les types de processus (avec pagination)
  getAllTypeProcessus: async (page = 0, size = 30): Promise<TypeProcessus[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<TypeProcessus>>>(
        `/type_processus/not-deleted?page=${page}&size=${size}`
      );
      return response.data.object.content;
    } catch (error) {
      console.error('❌ Error fetching type processus:', error);
      throw error;
    }
  },

  // Récupérer un type de processus par référence
  getTypeProcessusByRef: async (reference: string): Promise<TypeProcessus> => {
    const response = await axiosInstance.get<ApiResponse<TypeProcessus>>(
      `/type_processus/${reference}`
    );
    return response.data.object;
  },

  // Créer un type de processus
  createTypeProcessus: async (data: CreateTypeProcessusDTO): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      '/type_processus/add-type_processus',
      data
    );
  },

  // Mettre à jour un type de processus
  updateTypeProcessus: async (data: TypeProcessus): Promise<void> => {
    await axiosInstance.put<ApiResponse<string>>(
      '/type_processus',
      data
    );
  },

  // Supprimer un type de processus (soft delete) par référence
  deleteTypeProcessus: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<string>>(
      `/type_processus/${reference}`
    );
  },

  // ============ VALIDATEURS ============

  // Récupérer tous les validateurs (avec pagination)
  getAllValidateurs: async (page = 0, size = 30): Promise<Validateur[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Validateur>>>(
        `/validateurs/not-deleted?page=${page}&size=${size}`
      );
      return response.data.object.content;
    } catch (error) {
      console.error('❌ Error fetching validateurs:', error);
      throw error;
    }
  },

  // Récupérer un validateur par référence
  getValidateurByRef: async (reference: string): Promise<Validateur> => {
    const response = await axiosInstance.get<ApiResponse<Validateur>>(
      `/validateurs/${reference}`
    );
    return response.data.object;
  },

  // Récupérer les validateurs d'un type de processus spécifique (triés par ordre)
  getValidateursByProcessus: async (typeProcessusId: number): Promise<Validateur[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Validateur[]>>(
        `/validateurs/processus/${typeProcessusId}`
      );
      return response.data.object;
    } catch (error) {
      console.error('❌ Error fetching validateurs by processus:', error);
      throw error;
    }
  },

  // Créer un validateur
  createValidateur: async (data: CreateValidateurDTO): Promise<void> => {
    // Transformation pour le backend: le backend attend des objets, pas des IDs
    const payload = {
      ordre: data.ordre,
      typeProcessus: { id: data.typeProcessusId },
      user: data.userId ? { id: data.userId } : null,
      subdivision: data.subdivisionId ? { id: data.subdivisionId } : null,
    };

    await axiosInstance.post<ApiResponse<string>>(
      '/validateurs/add-validateur',
      payload
    );
  },

  // Mettre à jour un validateur
  updateValidateur: async (data: Validateur): Promise<void> => {
    await axiosInstance.put<ApiResponse<string>>(
      '/validateurs',
      data
    );
  },

  // Supprimer un validateur (soft delete) par référence
  deleteValidateur: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<string>>(
      `/validateurs/${reference}`
    );
  },
};
