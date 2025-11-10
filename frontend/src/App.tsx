import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./routes/PrivateRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { AdminLayout } from "./components/layout/AdminLayout";
import { UserLayout } from "./components/layout/UserLayout";
import { UserDashboard } from "./pages/user/UserDashboard";
import { FDMPage } from "./pages/user/DemandesPage";
// import { DemandesPage, FDMPage } from "./pages/user/DemandesPage";
import { RequestPage } from "./pages/user/RequestPage";
import { ValidationPage } from "./pages/user/ValidationPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { SubdivisionsPage } from "./pages/admin/SubdivisionsPage";
import { TypeSubdivisionsPage } from "./pages/admin/TypeSubdivisionsPage";
import { PostesPage } from "./pages/admin/PostesPage";
import { WorkflowsPage } from "./pages/admin/WorkflowsPage";
import { UserRole } from "./types/User";
import { Toaster } from "./components/ui/sonner";
import "./styles/globals.css";
import React from "react";

// Composant pour la redirection racine
const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = (user as any).roles ?? user.role;
    if (role === UserRole.ADMIN) {
      return <Navigate to="/admin/users" replace />;
    }
    return <Navigate to="/user" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route racine avec redirection intelligente */}
          <Route path="/" element={<RootRedirect />} />

          {/* Route de connexion */}
          <Route path="/login" element={<LoginPage />} />

          {/* Routes Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole={UserRole.ADMIN}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="subdivisions" element={<SubdivisionsPage />} />
            <Route
              path="type-subdivisions"
              element={<TypeSubdivisionsPage />}
            />
            <Route path="postes" element={<PostesPage />} />
            <Route path="workflows" element={<WorkflowsPage />} />
          </Route>

          {/* Routes User */}
          <Route
            path="/user"
            element={
              <PrivateRoute>
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="demandes" element={<FDMPage />} />
            <Route path="demandes/new" element={<RequestPage />} />
            <Route path="validations" element={<ValidationPage />} />
          </Route>

          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toaster pour les notifications */}
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}
