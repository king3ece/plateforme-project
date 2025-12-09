// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { statisticsAPI, UserDashboardStats } from "../../api/statistics";
// import { useAuth } from "../../hooks/useAuth";
// import { StatCard } from "../../components/dashboard/StatCard";
// import { FileText, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp } from "lucide-react";

// export const UserDashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<UserDashboardStats | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setIsLoading(true);
//     try {
//       const statistics = await statisticsAPI.getUserDashboardStats();
//       setStats(statistics);
//     } catch (error) {
//       console.error("Erreur lors du chargement des statistiques", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1>
//             Bienvenue, {user?.lastName} {user?.name}
//           </h1>
//           <p className="text-muted-foreground">
//             Voici un aperçu de vos demandes
//           </p>
//         </div>
//         {/* <Link to="/user/demandes/new">
//           <Button>
//             <Plus className="h-4 w-4 mr-2" />
//             Nouvelle Demande
//           </Button>
//         </Link> */}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <Card key={stat.label}>
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm">{stat.label}</CardTitle>
//                 <div className={`p-2 rounded-lg ${stat.bgColor}`}>
//                   <Icon className={`h-5 w-5 ${stat.color}`} />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className={`${stat.color}`}>{stat.value}</div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <div className="flex justify-between items-center">
//               <CardTitle>Mes Dernières Demandes</CardTitle>
//               <Link to="/user/demandes">
//                 <Button variant="ghost" size="sm">
//                   Voir tout
//                 </Button>
//               </Link>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {mesDemandes.length === 0 ? (
//               <p className="text-muted-foreground text-center py-8">
//                 Aucune demande
//               </p>
//             ) : (
//               <div className="space-y-3">
//                 {mesDemandes.slice(0, 5).map((demande) => (
//                   <div
//                     key={demande.id}
//                     className="flex items-center justify-between p-3 border rounded-lg"
//                   >
//                     <div>
//                       <p>{demande.typeDemande}</p>
//                       <p className="text-muted-foreground text-sm">
//                         {new Date(demande.createdAt || "").toLocaleDateString()}
//                       </p>
//                     </div>
//                     <span
//                       className={`px-2 py-1 rounded-full text-sm ${
//                         demande.statut === StatutDemande.VALIDEE
//                           ? "bg-green-100 text-green-700"
//                           : demande.statut === StatutDemande.REJETEE
//                           ? "bg-red-100 text-red-700"
//                           : "bg-blue-100 text-blue-700"
//                       }`}
//                     >
//                       {demande.statut}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <div className="flex justify-between items-center">
//               <CardTitle>Demandes à Valider</CardTitle>
//               <Link to="/user/validations">
//                 <Button variant="ghost" size="sm">
//                   Voir tout
//                 </Button>
//               </Link>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {demandesAValider.length === 0 ? (
//               <p className="text-muted-foreground text-center py-8">
//                 Aucune demande à valider
//               </p>
//             ) : (
//               <div className="space-y-3">
//                 {demandesAValider.slice(0, 5).map((demande) => (
//                   <div
//                     key={demande.id}
//                     className="flex items-center justify-between p-3 border rounded-lg"
//                   >
//                     <div>
//                       <p>{demande.typeDemande}</p>
//                       <p className="text-muted-foreground text-sm">
//                         Par {demande.user?.lastName} {demande.user?.name}
//                       </p>
//                     </div>
//                     <Link to="/user/validations">
//                       <Button size="sm">Traiter</Button>
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { statisticsAPI, UserDashboardStats } from "../../api/statistics";
import { useAuth } from "../../hooks/useAuth";
import { StatCard } from "../../components/dashboard/StatCard";
import { FileText, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp } from "lucide-react";

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const statistics = await statisticsAPI.getUserDashboardStats();
      setStats(statistics);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.lastName} {user?.name}
        </h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de vos demandes</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total des demandes"
          value={stats.totalDemandes}
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          description="Nombre total de demandes effectuées"
          loading={isLoading}
        />

        <StatCard
          title="En attente"
          value={stats.totalEnAttente}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          description="Demandes en cours de validation"
          loading={isLoading}
        />

        <StatCard
          title="Validées"
          value={stats.totalValidees}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          description="Demandes approuvées"
          loading={isLoading}
        />

        <StatCard
          title="Rejetées"
          value={stats.totalRejetees}
          icon={XCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          description="Demandes refusées"
          loading={isLoading}
        />

        <StatCard
          title="À corriger"
          value={stats.totalACorreiger}
          icon={AlertCircle}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          description="Demandes nécessitant des corrections"
          loading={isLoading}
        />
      </div>

      {/* Statistiques par type de demande */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails par type de demande</h2>

        {/* FDM */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Fiches Descriptives de Mission (FDM)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total FDM"
              value={stats.fdmTotal}
              icon={FileText}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
              loading={isLoading}
            />
            <StatCard
              title="En attente"
              value={stats.fdmEnAttente}
              icon={Clock}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              loading={isLoading}
            />
            <StatCard
              title="Validées"
              value={stats.fdmValidees}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              loading={isLoading}
            />
            <StatCard
              title="Rejetées"
              value={stats.fdmRejetees}
              icon={XCircle}
              iconColor="text-red-600"
              iconBgColor="bg-red-100"
              loading={isLoading}
            />
            <StatCard
              title="À corriger"
              value={stats.fdmACorreiger}
              icon={AlertCircle}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-100"
              loading={isLoading}
            />
          </div>
        </div>

        {/* BonPour */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Bons Pour</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Bons Pour"
              value={stats.bonPourTotal}
              icon={FileText}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
              loading={isLoading}
            />
            <StatCard
              title="En attente"
              value={stats.bonPourEnAttente}
              icon={Clock}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              loading={isLoading}
            />
            <StatCard
              title="Validées"
              value={stats.bonPourValidees}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              loading={isLoading}
            />
            <StatCard
              title="Rejetées"
              value={stats.bonPourRejetees}
              icon={XCircle}
              iconColor="text-red-600"
              iconBgColor="bg-red-100"
              loading={isLoading}
            />
            <StatCard
              title="À corriger"
              value={stats.bonPourACorreiger}
              icon={AlertCircle}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-100"
              loading={isLoading}
            />
          </div>
        </div>

        {/* RFDM */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Rapports Financiers de Mission (RFDM)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total RFDM"
              value={stats.rfdmTotal}
              icon={FileText}
              iconColor="text-teal-600"
              iconBgColor="bg-teal-100"
              loading={isLoading}
            />
            <StatCard
              title="En attente"
              value={stats.rfdmEnAttente}
              icon={Clock}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              loading={isLoading}
            />
            <StatCard
              title="Validées"
              value={stats.rfdmValidees}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              loading={isLoading}
            />
            <StatCard
              title="Rejetées"
              value={stats.rfdmRejetees}
              icon={XCircle}
              iconColor="text-red-600"
              iconBgColor="bg-red-100"
              loading={isLoading}
            />
            <StatCard
              title="À corriger"
              value={stats.rfdmACorreiger}
              icon={AlertCircle}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-100"
              loading={isLoading}
            />
          </div>
        </div>

        {/* DDA */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Demandes d'Achat (DDA)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total DDA"
              value={stats.ddaTotal}
              icon={FileText}
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100"
              loading={isLoading}
            />
            <StatCard
              title="En attente"
              value={stats.ddaEnAttente}
              icon={Clock}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              loading={isLoading}
            />
            <StatCard
              title="Validées"
              value={stats.ddaValidees}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              loading={isLoading}
            />
            <StatCard
              title="Rejetées"
              value={stats.ddaRejetees}
              icon={XCircle}
              iconColor="text-red-600"
              iconBgColor="bg-red-100"
              loading={isLoading}
            />
            <StatCard
              title="À corriger"
              value={stats.ddaACorreiger}
              icon={AlertCircle}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-100"
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Taux de validation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Taux de validation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Taux de validation</span>
            <span className="font-semibold text-green-600">
              {stats.totalDemandes > 0
                ? `${Math.round((stats.totalValidees / stats.totalDemandes) * 100)}%`
                : '0%'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Taux de rejet</span>
            <span className="font-semibold text-red-600">
              {stats.totalDemandes > 0
                ? `${Math.round((stats.totalRejetees / stats.totalDemandes) * 100)}%`
                : '0%'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Demandes en cours</span>
            <span className="font-semibold text-orange-600">
              {stats.totalEnAttente + stats.totalACorreiger}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
