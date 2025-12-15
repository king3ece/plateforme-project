import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import React from 'react';

interface ValidatorRouteProps {
  children: React.ReactNode;
}

export const ValidatorRoute: React.FC<ValidatorRouteProps> = ({ children }) => {
  const { user, isValidator, isLoading } = useAuth();

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur n'est pas validateur, rediriger vers le dashboard
  if (!isValidator) {
    return <Navigate to="/user" replace />;
  }

  // L'utilisateur est validateur, afficher le contenu
  return <>{children}</>;
};
