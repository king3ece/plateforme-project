// import axiosInstance from './axios';
// import { User, CreateUserDTO, UpdateUserDTO } from '../types/User';

// export const usersAPI = {
//   getAll: async (): Promise<User[]> => {
//     const response = await axiosInstance.get<User[]>('/users');
//     return response.data;
//   },

//   getById: async (id: number): Promise<User> => {
//     const response = await axiosInstance.get<User>(`/users/${id}`);
//     return response.data;
//   },

//   create: async (data: CreateUserDTO): Promise<User> => {
//     const response = await axiosInstance.post<User>('/auth/register', data);
//     return response.data;
//   },

//   update: async (id: number, data: UpdateUserDTO): Promise<User> => {
//     const response = await axiosInstance.put<User>(`/users/${id}`, data);
//     return response.data;
//   },

//   delete: async (id: number): Promise<void> => {
//     await axiosInstance.delete(`/users/${id}`);
//   },
// };

import axiosInstance from "./axios";
import { User, CreateUserDTO, UpdateUserDTO } from "../types/User";

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

export const usersAPI = {
  getAll: async (page = 0, size = 30): Promise<User[]> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<User>>
      >(`/users/not-deleted?page=${page}&size=${size}`);
      console.log("✅ Response complète:", response.data);
      console.log("✅ Users récupérés:", response.data.object.content);

      return response.data.object.content;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }
  },

  getByRef: async (reference: string): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(
      `/users/${reference}`
    );
    return response.data.object;
  },

  create: async (data: CreateUserDTO): Promise<User> => {
    const response = await axiosInstance.post<ApiResponse<User>>(
      "/auth/register",
      data
    );
    return response.data.object;
  },

  update: async (
    data: UpdateUserDTO & { reference: string }
  ): Promise<User> => {
    // Build payload to match backend User structure
    const payload: any = {
      reference: data.reference,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      // include roles if present (backend uses getRoles)
      ...(data.role ? { roles: data.role } : {}),
      // include password only when provided
      ...(data.password ? { password: data.password } : {}),
    };

    // Backend expects a nested 'poste' object with a 'reference' field
    if (data.posteRef !== undefined) {
      payload.poste = data.posteRef ? { reference: data.posteRef } : null;
    }

    console.debug("API PUT /users payload:", payload);

    const response = await axiosInstance.put<ApiResponse<User>>("/users", payload);
    return response.data.object;
  },

  delete: async (reference: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(
      `/users/delete-user/${reference}`
    );
  },
};

// // api/users.ts
// import axiosInstance from "./axios";
// import { User, CreateUserDTO, UpdateUserDTO } from "../types/User";

// interface ApiResponse<T> {
//   code: number;
//   message: string;
//   object: T;
// }

// interface PaginatedResponse<T> {
//   content: T[];
//   totalElements: number;
//   totalPages: number;
//   size: number;
//   number: number;
//   pageable: any;
//   last: boolean;
//   first: boolean;
//   numberOfElements: number;
//   empty: boolean;
// }

// export const usersAPI = {
//   // ✅ Récupérer tous les utilisateurs
//   getAll: async (page = 0, size = 30): Promise<User[]> => {
//     try {
//       const response = await axiosInstance.get<
//         ApiResponse<PaginatedResponse<User>>
//       >(`/users/not-deleted?page=${page}&size=${size}`);
//       console.log("✅ Response complète:", response.data);
//       console.log("✅ Users récupérés:", response.data.object.content);

//       return response.data.object.content;
//     } catch (error) {
//       console.error("❌ Error fetching Users:", error);
//       throw error;
//     }
//   },

//   // ✅ Récupérer un utilisateur par référence (corrigé)
//   getByRef: async (reference: string): Promise<User> => {
//     const response = await axiosInstance.get<ApiResponse<User>>(
//       `/users/${reference}` // ✅ Corrigé : une seule accolade
//     );
//     return response.data.object;
//   },

//   // ✅ Créer un utilisateur
//   create: async (data: CreateUserDTO): Promise<User> => {
//     const response = await axiosInstance.post<ApiResponse<User>>(
//       "/auth/register",
//       data
//     );
//     return response.data.object;
//   },

//   // ✅ Mettre à jour un utilisateur (avec poste)
//   update: async (
//     data: UpdateUserDTO & { reference: string }
//   ): Promise<User> => {
//     // Construction du payload pour l'update
//     const payload = {
//       reference: data.reference,
//       name: data.name,
//       lastName: data.lastName,
//       email: data.email,
//       ...(data.password && { password: data.password }), // Inclure password seulement s'il existe
//       ...(data.posteRef !== undefined && { posteRef: data.posteRef }), // Inclure posteRef (même si null)
//       ...(data.role && { role: data.role }), // Inclure role si présent
//     };

//     console.log("📤 Payload update:", payload);

//     const response = await axiosInstance.put<ApiResponse<User>>(
//       "/users",
//       payload
//     );
//     return response.data.object;
//   },

//   // ✅ Supprimer un utilisateur (soft delete)
//   delete: async (reference: string): Promise<void> => {
//     await axiosInstance.delete<ApiResponse<void>>(`/users/${reference}`);
//   },

//   // ✅ Bonus : Assigner un poste à un utilisateur
//   assignPoste: async (
//     userReference: string,
//     posteReference: string | null
//   ): Promise<User> => {
//     const response = await axiosInstance.put<ApiResponse<User>>("/users", {
//       reference: userReference,
//       posteRef: posteReference,
//     });
//     return response.data.object;
//   },
// };
