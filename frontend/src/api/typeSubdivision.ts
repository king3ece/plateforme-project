import axiosInstance from "./axios";
import {
  TypeSubdivision,
  CreateTypeSubdivisionDTO,
  UpdateTypeSubdivisionDTO,
} from "../types/TypeSubdivision";

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

export const typeSubdivisionsAPI = {
  getAll: async (page = 0, size = 30): Promise<TypeSubdivision[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<TypeSubdivision>>
      >(`/type_subdivisions/not-deleted?page=${page}&size=${size}`);

      // Defensive logging to help debug UI where list is empty
      console.debug("typeSubdivisions.getAll response:", response.data);

      // Normal expected path
      if (
        response?.data?.object &&
        Array.isArray(response.data.object.content)
      ) {
        return response.data.object.content as TypeSubdivision[];
      }

      // If backend returns directly an array or a different shape, try to handle it
      if (Array.isArray((response as any).data)) {
        return (response as any).data as TypeSubdivision[];
      }

      // Fallback to empty array instead of throwing so the UI can render and show a message
      console.warn(
        "Unexpected response shape when fetching type subdivisions, returning empty array",
        response.data
      );
      return [];
    } catch (error: unknown) {
      console.error(
        "Erreur lors de la récupération des types de subdivision :",
        error
      );
      throw error;
    }
  },

  getByReference: async (reference: string): Promise<TypeSubdivision> => {
    const response = await axiosInstance.get<ApiResponse<TypeSubdivision>>(
      `/type_subdivisions/get-type_subdivision/${reference}`
    );
    return response.data.object;
  },

  create: async (typeSubdivision: CreateTypeSubdivisionDTO): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      "/type_subdivisions/add-type_subdivision",
      typeSubdivision
    );
  },

  update: async (typeSubdivision: UpdateTypeSubdivisionDTO): Promise<void> => {
    await axiosInstance.put<ApiResponse<string>>(
      "/type_subdivisions",
      typeSubdivision
    );
  },

  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<string>>(
      `/type_subdivisions/delete-type_subdivision/${reference}`
    );
  },
};
