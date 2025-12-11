import axiosInstance from "./axios";
import {
  FicheDescriptiveMission,
  CreateFDMRequest,
  UpdateFDMRequest,
  TraitementDecision,
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
            
      return response.data.object.content;
    } catch (error) {
      console.error("❌ Error fetching FDM:", error);
      throw error;
    }
  },

  getMyRequests: async (
    page = 0,
    size = 30
  ): Promise<FicheDescriptiveMission[]> => {
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

  getPendingValidations: async (
    page = 0,
    size = 30
  ): Promise<FicheDescriptiveMission[]> => {
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

  getByRef: async (reference: string): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.get<
      ApiResponse<FicheDescriptiveMission>
    >(`/fdms/${reference}`);
    return response.data.object;
  },

  create: async (data: CreateFDMRequest): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.post<
      ApiResponse<FicheDescriptiveMission>
    >("/fdms/add-fdm", data);
    // Debug: surface the full API response to help diagnose null object issues
    console.debug("FDM create response:", response.data);
    // If backend returned a non-OK code, throw so callers handle it as an error
    if (response.data?.code && response.data.code !== 200) {
      const msg =
        response.data.message || "Erreur lors de la création de la FDM";
      const err = new Error(msg) as any;
      err.response = response;
      throw err;
    }
    return response.data.object;
  },

  update: async (fdm: UpdateFDMRequest): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.put<
      ApiResponse<FicheDescriptiveMission>
    >("/fdms", fdm);
    return response.data.object;
  },

  traiter: async (
    id: number,
    data: { decision: TraitementDecision; commentaire?: string }
  ): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(`/fdms/${id}/traiter`, data);
  },

  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/fdms/${reference}`);
  },

  reglerFDM: async (
    id: number,
    regler: boolean
  ): Promise<FicheDescriptiveMission> => {
    const response = await axiosInstance.put<
      ApiResponse<FicheDescriptiveMission>
    >("/fdms", { id, regler });
    return response.data.object;
  },
};
