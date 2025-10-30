import axiosInstance from './axios';
import { User } from '../types/User';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authAPI = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/authenticate', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/users/me');
    return response.data;
  },
};
