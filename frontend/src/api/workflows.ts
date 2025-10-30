import axiosInstance from './axios';
import { TypeProcessus, Validateur, CreateTypeProcessusDTO, CreateValidateurDTO, UpdateValidateurDTO } from '../types/Workflow';

export const workflowsAPI = {
  // Type Processus
  getAllTypeProcessus: async (): Promise<TypeProcessus[]> => {
    const response = await axiosInstance.get<TypeProcessus[]>('/type-processus');
    return response.data;
  },

  getTypeProcessusById: async (id: number): Promise<TypeProcessus> => {
    const response = await axiosInstance.get<TypeProcessus>(`/type-processus/${id}`);
    return response.data;
  },

  createTypeProcessus: async (data: CreateTypeProcessusDTO): Promise<TypeProcessus> => {
    const response = await axiosInstance.post<TypeProcessus>('/type-processus', data);
    return response.data;
  },

  deleteTypeProcessus: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/type-processus/${id}`);
  },

  // Validateurs
  getValidateursByProcessus: async (typeProcessusId: number): Promise<Validateur[]> => {
    const response = await axiosInstance.get<Validateur[]>(`/validateurs/processus/${typeProcessusId}`);
    return response.data;
  },

  createValidateur: async (data: CreateValidateurDTO): Promise<Validateur> => {
    const response = await axiosInstance.post<Validateur>('/validateurs', data);
    return response.data;
  },

  updateValidateur: async (id: number, data: UpdateValidateurDTO): Promise<Validateur> => {
    const response = await axiosInstance.put<Validateur>(`/validateurs/${id}`, data);
    return response.data;
  },

  deleteValidateur: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/validateurs/${id}`);
  },
};
