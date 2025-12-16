import axiosInstance from "./axios";
import {
  RapportFinancierDeMission,
  CreateRapportFinancierRequest,
  UpdateRapportFinancierRequest,
} from "../types/Rfdm";
import { TraitementDecision } from "../types/Fdm";

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

export const RapportFinancierAPI = {
  getMyRequests: async (page = 0, size = 30): Promise<RapportFinancierDeMission[]> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<RapportFinancierDeMission>>>(
      `/rfdms/my-requests?page=${page}&size=${size}`
    );
    return response.data.object.content;
  },

  getPendingValidations: async (page = 0, size = 30): Promise<RapportFinancierDeMission[]> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<RapportFinancierDeMission>>>(
      `/rfdms/pending-validations?page=${page}&size=${size}`
    );
    return response.data.object.content;
  },

  getByRef: async (reference: string): Promise<RapportFinancierDeMission> => {
    const response = await axiosInstance.get<ApiResponse<RapportFinancierDeMission>>(
      `/rfdms/${reference}`
    );
    return response.data.object;
  },

  create: async (data: CreateRapportFinancierRequest): Promise<RapportFinancierDeMission> => {
    const response = await axiosInstance.post<ApiResponse<RapportFinancierDeMission>>(
      "/rfdms/add-rfdm",
      data
    );
    return response.data.object;
  },

  update: async (rapport: UpdateRapportFinancierRequest): Promise<RapportFinancierDeMission> => {
    const response = await axiosInstance.put<ApiResponse<RapportFinancierDeMission>>(
      "/rfdms",
      rapport
    );
    return response.data.object;
  },

  traiter: async (
    id: number,
    data: { decision: TraitementDecision; commentaire?: string }
  ): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(`/rfdms/${id}/traiter`, data);
  },

  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/rfdms/${reference}`);
  },
};
