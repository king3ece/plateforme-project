import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { statisticsAPI, UserDashboardStats } from '../../api/statistics';
import { useAuth } from '../../hooks/useAuth';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("UserDashboard - Chargement des statistiques...");
      const statistics = await statisticsAPI.getUserDashboardStats();
      console.log("Statistiques chargees:", statistics);
      setStats(statistics);
    } catch (error: any) {
      console.error("Erreur lors du chargement des statistiques:", error);
      console.error("Details de l'erreur:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });

      let errorMessage = "Erreur lors du chargement des statistiques";

      if (error?.response?.status === 401) {
        errorMessage = "Session expiree. Veuillez vous reconnecter.";
      } else if (error?.response?.status === 403) {
        errorMessage = "Acces non autorise.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Service non disponible.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des taux et ratios
  const tauxValidation = stats && stats.totalDemandes > 0
    ? Math.round((stats.totalValidees / stats.totalDemandes) * 100)
    : 0;

  const tauxRejet = stats && stats.totalDemandes > 0
    ? Math.round((stats.totalRejetees / stats.totalDemandes) * 100)
    : 0;

  const tauxEnCours = stats && stats.totalDemandes > 0
    ? Math.round(((stats.totalEnAttente + stats.totalACorreiger) / stats.totalDemandes) * 100)
    : 0;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <div className="text-red-600 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p>{error}</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.lastName} {user?.name}
        </h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de vos demandes</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total des demandes */}
        <StatCard
          title="Total des demandes"
          value={stats?.totalDemandes || 0}
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          description="Nombre total de demandes effectuees"
          loading={loading}
        />

        {/* Demandes validees */}
        <StatCard
          title="Demandes validees"
          value={stats?.totalValidees || 0}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          description="Demandes approuvees avec succes"
          loading={loading}
        />

        {/* Demandes en attente */}
        <StatCard
          title="En attente de validation"
          value={stats?.totalEnAttente || 0}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          description="Demandes en cours de traitement"
          loading={loading}
        />

        {/* Demandes rejetees */}
        <StatCard
          title="Demandes rejetees"
          value={stats?.totalRejetees || 0}
          icon={XCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          description="Demandes refusees"
          loading={loading}
        />

        {/* Demandes a corriger */}
        <StatCard
          title="A corriger"
          value={stats?.totalACorreiger || 0}
          icon={AlertCircle}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          description="Demandes necessitant des corrections"
          loading={loading}
        />

        {/* Taux de validation */}
        <StatCard
          title="Taux de validation"
          value={`${tauxValidation}%`}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          description="Pourcentage de demandes validees"
          loading={loading}
        />
      </div>

      {/* Statistiques par type de demande */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Details par type de demande</h2>

        {/* FDM - Fiches Descriptives de Mission */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Fiches Descriptives de Mission (FDM)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-blue-600">{loading ? '...' : stats?.fdmTotal || 0}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{loading ? '...' : stats?.fdmEnAttente || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Validees</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats?.fdmValidees || 0}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rejetees</p>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats?.fdmRejetees || 0}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">A corriger</p>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats?.fdmACorreiger || 0}</p>
            </div>
          </div>
        </div>

        {/* BonPour */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Bons Pour
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-purple-600">{loading ? '...' : stats?.bonPourTotal || 0}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{loading ? '...' : stats?.bonPourEnAttente || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Validees</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats?.bonPourValidees || 0}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rejetees</p>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats?.bonPourRejetees || 0}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">A corriger</p>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats?.bonPourACorreiger || 0}</p>
            </div>
          </div>
        </div>

        {/* RFDM - Rapports Financiers */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-teal-600" />
            Rapports Financiers de Mission (RFDM)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-teal-600">{loading ? '...' : stats?.rfdmTotal || 0}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{loading ? '...' : stats?.rfdmEnAttente || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Validees</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats?.rfdmValidees || 0}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rejetees</p>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats?.rfdmRejetees || 0}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">A corriger</p>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats?.rfdmACorreiger || 0}</p>
            </div>
          </div>
        </div>

        {/* DDA - Demandes d'Achat */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Demandes d'Achat (DDA)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-indigo-600">{loading ? '...' : stats?.ddaTotal || 0}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{loading ? '...' : stats?.ddaEnAttente || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Validees</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats?.ddaValidees || 0}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rejetees</p>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats?.ddaRejetees || 0}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">A corriger</p>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats?.ddaACorreiger || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse et ratios */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-gray-700" />
          Analyse de vos demandes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Taux de validation */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-gray-600">Taux de validation</span>
            </div>
            <span className="font-semibold text-green-600 text-lg">
              {loading ? '...' : `${tauxValidation}%`}
            </span>
          </div>

          {/* Taux de rejet */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
              <span className="text-gray-600">Taux de rejet</span>
            </div>
            <span className="font-semibold text-red-600 text-lg">
              {loading ? '...' : `${tauxRejet}%`}
            </span>
          </div>

          {/* Taux en cours */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              <span className="text-gray-600">Taux en cours</span>
            </div>
            <span className="font-semibold text-orange-600 text-lg">
              {loading ? '...' : `${tauxEnCours}%`}
            </span>
          </div>
        </div>

        {/* Statistiques supplementaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Demandes en cours</span>
            <span className="font-semibold text-gray-900">
              {loading ? '...' : (stats?.totalEnAttente || 0) + (stats?.totalACorreiger || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Demandes traitees</span>
            <span className="font-semibold text-gray-900">
              {loading ? '...' : (stats?.totalValidees || 0) + (stats?.totalRejetees || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Type le plus utilise</span>
            <span className="font-semibold text-gray-900">
              {loading ? '...' :
                stats ? (() => {
                  const types = [
                    { name: 'FDM', count: stats.fdmTotal },
                    { name: 'BonPour', count: stats.bonPourTotal },
                    { name: 'RFDM', count: stats.rfdmTotal },
                    { name: 'DDA', count: stats.ddaTotal }
                  ];
                  const max = types.reduce((prev, current) =>
                    (current.count > prev.count) ? current : prev
                  );
                  return max.count > 0 ? max.name : 'Aucun';
                })() : 'N/A'
              }
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Corrections necessaires</span>
            <span className="font-semibold text-yellow-600">
              {loading ? '...' : stats?.totalACorreiger || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Message d'encouragement ou d'alerte */}
      {stats && !loading && (
        <div className={`rounded-lg p-6 ${
          tauxValidation >= 80
            ? 'bg-green-50 border border-green-200'
            : tauxRejet >= 50
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start">
            {tauxValidation >= 80 ? (
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3" />
            ) : tauxRejet >= 50 ? (
              <AlertCircle className="h-6 w-6 text-red-600 mt-1 mr-3" />
            ) : (
              <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-3" />
            )}
            <div>
              <h3 className={`font-semibold ${
                tauxValidation >= 80
                  ? 'text-green-900'
                  : tauxRejet >= 50
                  ? 'text-red-900'
                  : 'text-blue-900'
              }`}>
                {tauxValidation >= 80
                  ? 'Excellent travail !'
                  : tauxRejet >= 50
                  ? 'Attention aux rejets'
                  : 'Continuez comme ca'}
              </h3>
              <p className={`text-sm mt-1 ${
                tauxValidation >= 80
                  ? 'text-green-700'
                  : tauxRejet >= 50
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {tauxValidation >= 80
                  ? `Vous avez un excellent taux de validation de ${tauxValidation}%. Vos demandes sont bien preparees.`
                  : tauxRejet >= 50
                  ? `Votre taux de rejet est eleve (${tauxRejet}%). N'hesitez pas a demander de l'aide pour ameliorer vos demandes.`
                  : `Vous avez ${stats.totalEnAttente + stats.totalACorreiger} demande(s) en cours de traitement. Pensez a verifier regulierement leur statut.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
