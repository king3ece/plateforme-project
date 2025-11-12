import axiosInstance from "./axios";
import {
  DemandeAchat,
  CreateDemandeAchatRequest,
  UpdateDemandeAchatRequest,
} from "../types/DemandeAchat";
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

export const DemandeAchatAPI = {
  getMyRequests: async (page = 0, size = 30): Promise<DemandeAchat[]> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<DemandeAchat>>>(
      `/ddas/my-requests?page=${page}&size=${size}`
    );
    return response.data.object.content;
  },

  getPendingValidations: async (page = 0, size = 30): Promise<DemandeAchat[]> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<DemandeAchat>>>(
      `/ddas/pending-validations?page=${page}&size=${size}`
    );
    return response.data.object.content;
  },

  create: async (data: CreateDemandeAchatRequest): Promise<DemandeAchat> => {
    const response = await axiosInstance.post<ApiResponse<DemandeAchat>>(
      "/ddas/add-dda",
      data
    );
    return response.data.object;
  },

  update: async (data: UpdateDemandeAchatRequest): Promise<DemandeAchat> => {
    const response = await axiosInstance.put<ApiResponse<DemandeAchat>>("/ddas", data);
    return response.data.object;
  },

  traiter: async (
    id: number,
    data: { decision: TraitementDecision; commentaire?: string }
  ): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(`/ddas/${id}/traiter`, data);
  },
};
