import axiosInstance from "./axios";

export interface UserDashboardStats {
  // FDM
  fdmTotal: number;
  fdmEnAttente: number;
  fdmValidees: number;
  fdmRejetees: number;
  fdmACorreiger: number;

  // BonPour
  bonPourTotal: number;
  bonPourEnAttente: number;
  bonPourValidees: number;
  bonPourRejetees: number;
  bonPourACorreiger: number;

  // RFDM
  rfdmTotal: number;
  rfdmEnAttente: number;
  rfdmValidees: number;
  rfdmRejetees: number;
  rfdmACorreiger: number;

  // DDA
  ddaTotal: number;
  ddaEnAttente: number;
  ddaValidees: number;
  ddaRejetees: number;
  ddaACorreiger: number;

  // Global
  totalDemandes: number;
  totalEnAttente: number;
  totalValidees: number;
  totalRejetees: number;
  totalACorreiger: number;
}

export const statisticsAPI = {
  getUserDashboardStats: async (): Promise<UserDashboardStats> => {
    const response = await axiosInstance.get<{ code: number; message: string; object: UserDashboardStats }>(
      "/statistics/user/dashboard"
    );
    return response.data.object;
  },
};
