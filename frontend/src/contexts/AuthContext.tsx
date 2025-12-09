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
import { checkIsValidator, getTotalPendingValidationsCount } from "../utils/validatorUtils";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isValidator: boolean;  // ✅ Nouveau
    pendingValidationsCount: number;  // ✅ Nouveau
    login: (credentials: LoginDTO) => Promise<void>;
    logout: () => void;
    isAdmin: () => boolean;
    refreshValidatorStatus: () => Promise<void>;  // ✅ Nouveau
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    isValidator: false,
    pendingValidationsCount: 0,
    login: async () => {},
    logout: () => {},
    isAdmin: () => false,
    refreshValidatorStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidator, setIsValidator] = useState(false);  // ✅ Nouveau
    const [pendingValidationsCount, setPendingValidationsCount] = useState(0);  // ✅ Nouveau

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

    // ✅ Vérifier le statut validateur quand l'utilisateur est chargé
    useEffect(() => {
        if (user && token) {
            console.log('🔍 AuthContext - Chargement du statut validateur pour user:', user.id);

            // Vérifier le statut validateur
            const loadValidatorStatus = async () => {
                try {
                    console.log('🔍 AuthContext - Appel checkIsValidator...');
                    const [validatorStatus, pendingCount] = await Promise.all([
                        checkIsValidator(),
                        getTotalPendingValidationsCount()
                    ]);

                    console.log('✅ AuthContext - Résultat:', { validatorStatus, pendingCount });
                    setIsValidator(validatorStatus);
                    setPendingValidationsCount(pendingCount);
                } catch (error) {
                    console.error("❌ Erreur lors de la vérification du statut validateur:", error);
                    setIsValidator(false);
                    setPendingValidationsCount(0);
                }
            };

            loadValidatorStatus();
        } else {
            console.log('🔍 AuthContext - user ou token manquant:', { user: !!user, token: !!token });
        }
    }, [user?.id, token]); // Dépendre seulement de l'ID du user

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

    // ✅ Vérifier le statut validateur et compter les demandes en attente
    const refreshValidatorStatus = async () => {
        try {
            const [validatorStatus, pendingCount] = await Promise.all([
                checkIsValidator(),
                getTotalPendingValidationsCount()
            ]);

            setIsValidator(validatorStatus);
            setPendingValidationsCount(pendingCount);
        } catch (error) {
            console.error("Erreur lors de la vérification du statut validateur:", error);
            setIsValidator(false);
            setPendingValidationsCount(0);
        }
    };

    // 🔹 Déconnexion
    const logout = () => {
        setUser(null);
        setToken(null);
        setIsValidator(false);
        setPendingValidationsCount(0);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // ✅ Vérifier si l'utilisateur est admin (avec compatibilité role/roles)
    const isAdmin = () => {
        const role = (user as any)?.roles ?? (user as any)?.role;
        return role === UserRole.ADMIN;
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isValidator,
            pendingValidationsCount,
            login,
            logout,
            isAdmin,
            refreshValidatorStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};
