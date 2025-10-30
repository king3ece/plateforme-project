import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/User';
import React from 'react'
interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Also accept backend `roles` property (enum) for compatibility
  if (requiredRole && (user as any).roles !== undefined && (user as any).roles !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
