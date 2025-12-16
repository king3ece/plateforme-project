import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Restreint l'accès aux validateurs (ou admins).
 */
export const ValidatorRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isValidator, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isValidator && !isAdmin()) {
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
};
