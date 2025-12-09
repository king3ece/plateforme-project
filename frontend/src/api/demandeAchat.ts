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
  /**
   * Récupère toutes les demandes d'achat non supprimées
   */
  getAll: async (page = 0, size = 30): Promise<DemandeAchat[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<DemandeAchat>>
      >(`/ddas/not-deleted?page=${page}&size=${size}`);
      console.log("✅ Response complète DEAC:", response.data);
      console.log("✅ DEAC récupérées:", response.data.object.content);

      return response.data.object.content;
    } catch (error) {
      console.error("❌ Error fetching DEAC:", error);
      throw error;
    }
  },

  /**
   * Récupère les demandes d'achat de l'utilisateur connecté
   */
  getMyRequests: async (page = 0, size = 30): Promise<DemandeAchat[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<DemandeAchat>>
      >(`/ddas/my-requests?page=${page}&size=${size}`);
      return response.data.object.content;
    } catch (error) {
      console.error("Error fetching my DEAC requests:", error);
      throw error;
    }
  },

  /**
   * Récupère les demandes d'achat en attente de validation
   */
  getPendingValidations: async (page = 0, size = 30): Promise<DemandeAchat[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<DemandeAchat>>
      >(`/ddas/pending-validations?page=${page}&size=${size}`);
      return response.data.object.content;
    } catch (error) {
      console.error("Error fetching pending DEAC validations:", error);
      throw error;
    }
  },

  /**
   * Récupère une demande d'achat par sa référence
   */
  getByRef: async (reference: string): Promise<DemandeAchat> => {
    const response = await axiosInstance.get<ApiResponse<DemandeAchat>>(
      `/ddas/${reference}`
    );
    return response.data.object;
  },

  /**
   * Crée une nouvelle demande d'achat
   */
  create: async (data: CreateDemandeAchatRequest): Promise<DemandeAchat> => {
    const response = await axiosInstance.post<ApiResponse<DemandeAchat>>(
      "/ddas/add-dda",
      data
    );
    return response.data.object;
  },

  /**
   * Met à jour une demande d'achat existante
   */
  update: async (data: UpdateDemandeAchatRequest): Promise<DemandeAchat> => {
    const response = await axiosInstance.put<ApiResponse<DemandeAchat>>(
      "/ddas",
      data
    );
    return response.data.object;
  },

  /**
   * Traite une demande d'achat (validation, rejet, correction)
   */
  traiter: async (
    id: number,
    data: { decision: TraitementDecision; commentaire?: string }
  ): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      `/ddas/${id}/traiter`,
      data
    );
  },

  /**
   * Supprime une demande d'achat (soft delete)
   */
  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/ddas/${reference}`);
  },

  /**
   * Génère un bon de commande pour une demande approuvée
   */
  genererBonCommande: async (id: number): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      `/ddas/${id}/generer-bon-commande`
    );
  },

  /**
   * Confirme qu'une commande a été passée
   */
  confirmerCommande: async (id: number, commander: boolean): Promise<void> => {
    await axiosInstance.post<ApiResponse<string>>(
      `/ddas/${id}/confirmer-commande`,
      { commander }
    );
  },

  /**
   * Marque une demande d'achat comme réglée
   */
  reglerDDA: async (id: number, regler: boolean): Promise<DemandeAchat> => {
    const response = await axiosInstance.put<ApiResponse<DemandeAchat>>(
      "/ddas",
      { id, regler }
    );
    return response.data.object;
  },
};
