import React from "react";
import { Search, Bell, User } from "lucide-react";
import { Input } from "../ui/input";

interface DashboardHeaderProps {
  userName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName =
    userName || `${user.name || "Jean"} ${user.lastName || "Dupont"}`;
  const subdivision = user.subdivision;

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Titre */}
        <h1 className="text-xl font-bold text-gray-900">
          Système de Gestion des Demandes
        </h1>

        {/* Barre de recherche et profil */}
        <div className="flex items-center space-x-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 w-64 h-10 border-gray-300"
            />
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profil utilisateur */}
          <div className="group relative flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">
                {displayName}
              </span>
              {subdivision && (
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  🏛️ {subdivision.libelle}
                  {subdivision.typeSubdivision && (
                    <span> • {subdivision.typeSubdivision.libelle}</span>
                  )}
                </div>
              )}
            </div>

            {/* Tooltip au survol */}
            {subdivision && (
              <div className="absolute bottom-full mb-2 left-0 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block whitespace-nowrap">
                <div>{subdivision.libelle}</div>
                {subdivision.typeSubdivision && (
                  <div className="text-gray-300">
                    Type: {subdivision.typeSubdivision.libelle}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
