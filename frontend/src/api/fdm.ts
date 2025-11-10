import axiosInstance from "./axios";
import { 
  FicheDescriptiveMission, 
  CreateFDMRequest, 
  UpdateFDMRequest,
  TraitementFicheDescriptiveMission 
} from "../types/Fdm";

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

export const FicheDescriptiveMissionAPI = {
  getAll: async (page = 0, size = 30): Promise<FicheDescriptiveMission[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<FicheDescriptiveMission>>
      >(`/fdms/not-deleted?page=${page}&size=${size}`);
      console.log("✅ Response complète FDM:", response.data);
      console.log("✅ FDM récupérées:", response.data.object.content);

      return response.data.object.content;
    } catch (error) {
      console.error("❌ Error fetching FDM:", error);
      throw error;
    }
  },

  getMyRequests: async (page = 0, size = 30): Promise<FicheDescriptiveMission[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<FicheDescriptiveMission>>
      >(`/fdms/my-requests?page=${page}&size=${size}`);
      return response.data.object.content;
    } catch (error) {
      console.error("Error fetching my requests:", error);
      throw error;
    }
  },

  getPendingValidations: async (page = 0, size = 30): Promise<FicheDescriptiveMission[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<FicheDescriptiveMission>>
      >(`/fdms/pending-validations?page=${page}&size=${size}`);
      return response.data.object.content;
    } catch (error) {
      console.error("Error fetching pending validations:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.get<ApiResponse<FicheDescriptiveMission>>(
      `/fdms/${id}`
    );
    return response.data.object;
  },

  getByRef: async (reference: string): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.get<ApiResponse<FicheDescriptiveMission>>(
      `/fdms/${reference}`
    );
    return response.data.object;
  },

  create: async (data: CreateFDMRequest): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.post<ApiResponse<FicheDescriptiveMission>>(
      "/fdms/add-fdm",
      data
    );
    return response.data.object;
  },

  update: async (fdm: UpdateFDMRequest): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.put<ApiResponse<FicheDescriptiveMission>>(
      "/fdm",
      fdm
    );
    return response.data.object;
  },

  traiter: async (
    id: number,
    data: { decision: 'VALIDER' | 'REJETER' | 'A_CORRIGER'; commentaire?: string }
  ): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      `/fdms/${id}/traiter`,
      data
    );
  },

  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/fdms/${reference}`);
  },

  reglerFDM: async (id: number, regler: boolean): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.put<ApiResponse<FicheDescriptiveMission>>(
      "/fdm",
      { id, regler }
    );
    return response.data.object;
  },
};