import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { demandesAPI } from "../../api/demandes";
import { Demande, StatutDemande } from "../../types/Demande";
import { useAuth } from "../../hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FileText, CheckCircle, Clock, XCircle, Plus } from "lucide-react";

export const UserDashboard = () => {
  const { user } = useAuth();
  const [mesDemandes, setMesDemandes] = useState<Demande[]>([]);
  const [demandesAValider, setDemandesAValider] = useState<Demande[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [demandes, aValider] = await Promise.all([
        demandesAPI.getMesDemandes(),
        demandesAPI.getDemandesAValider(),
      ]);
      setMesDemandes(demandes);
      setDemandesAValider(aValider);
    } catch (error) {
      console.error("Erreur lors du chargement des données", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatutCount = (statut: StatutDemande) => {
    return mesDemandes.filter((d) => d.statut === statut).length;
  };

  const stats = [
    {
      label: "En attente",
      value:
        getStatutCount(StatutDemande.EN_ATTENTE) +
        getStatutCount(StatutDemande.EN_COURS),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Validées",
      value: getStatutCount(StatutDemande.VALIDEE),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Rejetées",
      value: getStatutCount(StatutDemande.REJETEE),
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "À valider",
      value: demandesAValider.length,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>
            Bienvenue, {user?.lastName} {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de vos demandes
          </p>
        </div>
        {/* <Link to="/user/demandes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Demande
          </Button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mes Dernières Demandes</CardTitle>
              <Link to="/user/demandes">
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {mesDemandes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune demande
              </p>
            ) : (
              <div className="space-y-3">
                {mesDemandes.slice(0, 5).map((demande) => (
                  <div
                    key={demande.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p>{demande.typeDemande}</p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(demande.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        demande.statut === StatutDemande.VALIDEE
                          ? "bg-green-100 text-green-700"
                          : demande.statut === StatutDemande.REJETEE
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {demande.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Demandes à Valider</CardTitle>
              <Link to="/user/validations">
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {demandesAValider.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune demande à valider
              </p>
            ) : (
              <div className="space-y-3">
                {demandesAValider.slice(0, 5).map((demande) => (
                  <div
                    key={demande.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p>{demande.typeDemande}</p>
                      <p className="text-muted-foreground text-sm">
                        Par {demande.user?.lastName} {demande.user?.name}
                      </p>
                    </div>
                    <Link to="/user/validations">
                      <Button size="sm">Traiter</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
