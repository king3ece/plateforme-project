import axiosInstance from "./axios";
import {
  Demande,
  CreateDemandeDTO,
  TraiterDemandeDTO,
  TypeDemande,
} from "../types/Demande";

export const demandesAPI = {
  getAll: async (): Promise<Demande[]> => {
    const response = await axiosInstance.get<Demande[]>("/demandes");
    return response.data;
  },

  getMesDemandes: async (): Promise<Demande[]> => {
    const response = await axiosInstance.get<Demande[]>(
      "/demandes/mes-demandes"
    );
    return response.data;
  },

  getDemandesAValider: async (): Promise<Demande[]> => {
    const response = await axiosInstance.get<Demande[]>("/demandes/a-valider");
    return response.data;
  },

  getById: async (id: number): Promise<Demande> => {
    const response = await axiosInstance.get<Demande>(`/demandes/${id}`);
    return response.data;
  },

  create: async (data: CreateDemandeDTO): Promise<Demande> => {
    // Two-step flow: 1) create demande (JSON) via specific endpoint, 2) upload files to /{type}/{ref}/pieces-jointes
    let createUrl = "";
    if (data.typeDemande === TypeDemande.FDM) createUrl = "/fdms/add-fdm";
    else if (data.typeDemande === TypeDemande.ACHAT)
      createUrl = "/ddas/add-dda";
    else createUrl = "/demandes"; // fallback

    const payload: any = {
      typeDemande: data.typeDemande,
      typeProcessusId: data.typeProcessusId,
      motif: data.motif,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
    };

    // Create demande
    const createRes = await axiosInstance.post<any>(createUrl, payload);
    // backend returns ResponseModel with object
    const created: any = createRes.data?.object ?? createRes.data;

    // If there are files, upload them to the specific pieces-jointes endpoint
    if (data.piecesJointes && data.piecesJointes.length > 0) {
      const formData = new FormData();
      data.piecesJointes.forEach((file) => formData.append("files", file));

      const parentRef = created.reference || created.ref || created.id;
      if (parentRef) {
        const uploadUrl =
          data.typeDemande === TypeDemande.FDM
            ? `/fdms/${parentRef}/pieces-jointes`
            : `/ddas/${parentRef}/pieces-jointes`;
        await axiosInstance.post(uploadUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    }

    return created as Demande;
  },

  traiter: async (data: TraiterDemandeDTO): Promise<Demande> => {
    const response = await axiosInstance.post<Demande>(
      `/demandes/${data.demandeId}/traiter`,
      {
        statut: data.statut,
        commentaire: data.commentaire,
      }
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/demandes/${id}`);
  },
};
