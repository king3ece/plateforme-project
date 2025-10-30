import axiosInstance from './axios';
import { Demande, CreateDemandeDTO, TraiterDemandeDTO } from '../types/Demande';

export const demandesAPI = {
  getAll: async (): Promise<Demande[]> => {
    const response = await axiosInstance.get<Demande[]>('/demandes');
    return response.data;
  },

  getMesDemandes: async (): Promise<Demande[]> => {
    const response = await axiosInstance.get<Demande[]>('/demandes/mes-demandes');
    return response.data;
  },

  getDemandesAValider: async (): Promise<Demande[]> => {
    const response = await axiosInstance.get<Demande[]>('/demandes/a-valider');
    return response.data;
  },

  getById: async (id: number): Promise<Demande> => {
    const response = await axiosInstance.get<Demande>(`/demandes/${id}`);
    return response.data;
  },

  create: async (data: CreateDemandeDTO): Promise<Demande> => {
    const formData = new FormData();
    formData.append('typeDemande', data.typeDemande);
    formData.append('typeProcessusId', data.typeProcessusId.toString());
    formData.append('motif', data.motif);
    if (data.dateDebut) formData.append('dateDebut', data.dateDebut);
    if (data.dateFin) formData.append('dateFin', data.dateFin);
    
    if (data.piecesJointes && data.piecesJointes.length > 0) {
      data.piecesJointes.forEach((file) => {
        formData.append('piecesJointes', file);
      });
    }

    const response = await axiosInstance.post<Demande>('/demandes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  traiter: async (data: TraiterDemandeDTO): Promise<Demande> => {
    const response = await axiosInstance.post<Demande>(`/demandes/${data.demandeId}/traiter`, {
      statut: data.statut,
      commentaire: data.commentaire,
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/demandes/${id}`);
  },
};
