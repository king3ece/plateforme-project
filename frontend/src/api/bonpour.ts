import axiosInstance from "./axios";
import {
  BonPour,
  CreateBonPourRequest,
  UpdateBonPourRequest,
  TraitementBonPour
} from "../types/BonPour";
import { ApiResponse, PaginatedResponse, Decision, TraitementRequest } from "../types/api";

export const BonPourAPI = {
  getAll: async (page = 0, size = 30): Promise<BonPour[]> => {
    const response = await axiosInstance.get<
      ApiResponse<PaginatedResponse<BonPour>>
    >(`/bonpours/not-deleted?page=${page}&size=${size}`);
    return response.data.object.content;
  },

  getMyRequests: async (page = 0, size = 30): Promise<BonPour[]> => {
    const response = await axiosInstance.get<
      ApiResponse<PaginatedResponse<BonPour>>
    >(`/bonpours/my-requests?page=${page}&size=${size}`);
    return response.data.object.content;
  },

  getPendingValidations: async (page = 0, size = 30): Promise<BonPour[]> => {
    const response = await axiosInstance.get<
      ApiResponse<PaginatedResponse<BonPour>>
    >(`/bonpours/pending-validations?page=${page}&size=${size}`);
    return response.data.object.content;
  },

  getById: async (id: number): Promise<BonPour> => {
    const response = await axiosInstance.get<ApiResponse<BonPour>>(
      `/bonpours/${id}`
    );
    return response.data.object;
  },

  getByRef: async (reference: string): Promise<BonPour> => {
    const response = await axiosInstance.get<ApiResponse<BonPour>>(
      `/bonpours/${reference}`
    );
    return response.data.object;
  },

  create: async (data: CreateBonPourRequest): Promise<BonPour> => {
    const response = await axiosInstance.post<ApiResponse<BonPour>>(
      "/bonpours/add-bonpour",
      data
    );
    return response.data.object;
  },

  update: async (bonPour: UpdateBonPourRequest): Promise<BonPour> => {
    const response = await axiosInstance.put<ApiResponse<BonPour>>(
      "/bonpours",
      bonPour
    );
    return response.data.object;
  },

  traiter: async (
    id: number,
    data: TraitementRequest
  ): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      `/bonpours/${id}/traiter`,
      data
    );
  },

  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/bonpours/${reference}`);
  },

  reglerBonPour: async (id: number, regler: boolean): Promise<BonPour> => {
    const response = await axiosInstance.put<ApiResponse<BonPour>>(
      "/bonpours",
      { id, regler }
    );
    return response.data.object;
  },
};
