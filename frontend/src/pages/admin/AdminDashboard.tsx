import React, { useEffect, useState } from 'react';
import { Users, Briefcase, Building2, FolderTree, CheckCircle } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { usersAPI } from '../../api/users';
import { postesAPI } from '../../api/postes';
import { subdivisionsAPI } from '../../api/subdivisions';
import { typeSubdivisionsAPI } from '../../api/typeSubdivision';

interface DashboardStats {
  totalUsers: number;
  enabledUsers: number;
  totalPostes: number;
  totalSubdivisions: number;
  totalTypeSubdivisions: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    enabledUsers: 0,
    totalPostes: 0,
    totalSubdivisions: 0,
    totalTypeSubdivisions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Récupérer toutes les données en parallèle
        const [users, postes, subdivisions, typeSubdivisions] = await Promise.all([
          usersAPI.getAll(0, 1000), // Récupérer tous les utilisateurs
          postesAPI.getAll(0, 1000),
          subdivisionsAPI.getAll(0, 1000),
          typeSubdivisionsAPI.getAll(0, 1000)
        ]);

        // Calculer les statistiques
        const enabledUsersCount = users.filter(user => user.enable || user.isEnabled).length;

        setStats({
          totalUsers: users.length,
          enabledUsers: enabledUsersCount,
          totalPostes: postes.length,
          totalSubdivisions: subdivisions.length,
          totalTypeSubdivisions: typeSubdivisions.length
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble des statistiques de la plateforme</p>
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Utilisateurs totaux */}
        <StatCard
          title="Utilisateurs totaux"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          description="Nombre total d'utilisateurs dans le système"
          loading={loading}
        />

        {/* Utilisateurs activés */}
        <StatCard
          title="Comptes activés"
          value={stats.enabledUsers}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          description="Utilisateurs avec un compte activé"
          loading={loading}
        />

        {/* Postes totaux */}
        <StatCard
          title="Postes totaux"
          value={stats.totalPostes}
          icon={Briefcase}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          description="Nombre total de postes définis"
          loading={loading}
        />

        {/* Subdivisions totales */}
        <StatCard
          title="Subdivisions totales"
          value={stats.totalSubdivisions}
          icon={Building2}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          description="Nombre total de subdivisions"
          loading={loading}
        />

        {/* Types de subdivision */}
        <StatCard
          title="Types de subdivision"
          value={stats.totalTypeSubdivisions}
          icon={FolderTree}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-100"
          description="Nombre de types de subdivision définis"
          loading={loading}
        />

        {/* Taux d'activation */}
        <StatCard
          title="Taux d'activation"
          value={stats.totalUsers > 0 ? `${Math.round((stats.enabledUsers / stats.totalUsers) * 100)}%` : '0%'}
          icon={CheckCircle}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          description="Pourcentage d'utilisateurs avec compte activé"
          loading={loading}
        />
      </div>

      {/* Section supplémentaire - Statistiques détaillées */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé de la plateforme</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Utilisateurs désactivés</span>
            <span className="font-semibold text-gray-900">
              {loading ? '...' : stats.totalUsers - stats.enabledUsers}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Ratio Postes/Utilisateurs</span>
            <span className="font-semibold text-gray-900">
              {loading ? '...' : stats.totalUsers > 0 ? (stats.totalPostes / stats.totalUsers).toFixed(2) : '0'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Ratio Subdivisions/Types</span>
            <span className="font-semibold text-gray-900">
              {loading ? '...' : stats.totalTypeSubdivisions > 0 ? (stats.totalSubdivisions / stats.totalTypeSubdivisions).toFixed(2) : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};