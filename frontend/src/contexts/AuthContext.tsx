// import React, { createContext, useState, useEffect } from 'react';
// import { User, UserRole } from '../types/User';
// import { authAPI, LoginDTO } from '../api/auth';
// import axiosInstance from "../api/axios";
//
// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   isLoading: boolean;
//   login: (credentials: LoginDTO) => Promise<void>;
//   logout: () => void;
//   isAdmin: () => boolean;
// }
//
// export const AuthContext = createContext<AuthContextType>({
//   user: null,
//   token: null,
//   isLoading: true,
//   login: async () => {},
//   logout: () => {},
//   isAdmin: () => false,
// });
//
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//
//   // useEffect(() => {
//   //   const storedToken = localStorage.getItem('token');
//   //   const storedUser = localStorage.getItem('user');
//   //
//   //   if (storedToken && storedUser) {
//   //     setToken(storedToken);
//   //     setUser(JSON.parse(storedUser));
//   //   }
//   //   setIsLoading(false);
//   // }, []);
//
//     // Appelé automatiquement si un token existe déjà
//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (token) fetchCurrentUser();
//     }, []);
//
//     const fetchCurrentUser = async () => {
//         try {
//             const res = await axiosInstance.get<User>("/users/me");
//             setUser(res.data);
//         } catch {
//             localStorage.removeItem("token");
//         }
//     };
//
//
//     const login = async (credentials: LoginDTO) => {
//     try {
//       const response = await authAPI.login(credentials);
//       setToken(response.token);
//       setUser(response.user);
//       localStorage.setItem('token', response.token);
//       localStorage.setItem('user', JSON.stringify(response.user));
//     } catch (error) {
//       throw error;
//     }
//   };
//
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   };
//
//   const isAdmin = () => {
//     return user?.role === UserRole.ADMIN;
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { User, UserRole } from "../types/User";
import { authAPI, LoginDTO } from "../api/auth";
import axiosInstance from "../api/axios";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: LoginDTO) => Promise<void>;
    logout: () => void;
    isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: async () => {},
    logout: () => {},
    isAdmin: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🔹 Charger le token et le user depuis localStorage au démarrage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            fetchCurrentUser(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    // 🔹 Récupérer l'utilisateur connecté via /users/me
    const fetchCurrentUser = async (tokenParam?: string) => {
        try {
            const res = await axiosInstance.get<User>("/users/me", {
                headers: {
                    Authorization: `Bearer ${tokenParam || token}`,
                },
            });
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
        } catch (error) {
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 Login + stockage du token + récupération du user
    const login = async (credentials: LoginDTO) => {
        const res = await authAPI.login(credentials);
        localStorage.setItem("token", res.token);
        setToken(res.token);
        await fetchCurrentUser(res.token);
    };

    // 🔹 Déconnexion
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const isAdmin = () => user?.role === UserRole.ADMIN;
    // Ensure compatibility with backend which may return `roles` enum
    const isAdminNormalized = () => {
        const role = (user as any)?.roles ?? (user as any)?.role;
        return role === UserRole.ADMIN;
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
