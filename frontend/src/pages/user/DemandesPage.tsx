// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { demandesAPI } from '../../api/demandes';
// import { Demande, StatutDemande } from '../../types/Demande';
// import { FicheDescriptiveMission, UpdateFDMRequest, CreateFDMRequest } from '../../types/Fdm';
// import { Button } from '../../components/ui/button';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
// import { Badge } from '../../components/ui/badge';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
// import { Plus, Eye } from 'lucide-react';
// import { toast } from 'sonner';

// export const DemandesPage = () => {
//   const [demandes, setDemandes] = useState<Demande[]>([]);
//   const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     loadDemandes();
//   }, []);

//   const loadDemandes = async () => {
//     setIsLoading(true);
//     try {
//       const data = await demandesAPI.getMesDemandes();
//       setDemandes(data);
//     } catch (error) {
//       toast.error('Erreur lors du chargement des demandes');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getStatutBadge = (statut: StatutDemande) => {
//     const variants: Record<StatutDemande, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
//       [StatutDemande.EN_ATTENTE]: { variant: 'secondary', label: 'En attente' },
//       [StatutDemande.EN_COURS]: { variant: 'default', label: 'En cours' },
//       [StatutDemande.VALIDEE]: { variant: 'outline', label: 'Validée' },
//       [StatutDemande.REJETEE]: { variant: 'destructive', label: 'Rejetée' },
//     };

//     const config = variants[statut];
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   const handleViewDetails = (demande: Demande) => {
//     setSelectedDemande(demande);
//     setIsDetailOpen(true);
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
//         <h1>Mes Demandes</h1>
//         <Link to="/user/demandes/new">
//           <Button>
//             <Plus className="h-4 w-4 mr-2" />
//             Nouvelle Demande
//           </Button>
//         </Link>
//       </div>

//       <div className="bg-white rounded-lg border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Type</TableHead>
//               <TableHead>Date de création</TableHead>
//               <TableHead>Période</TableHead>
//               <TableHead>Statut</TableHead>
//               {/* <TableHead>Processus</TableHead> */}
//               {/* <TableHead className="text-right">Actions</TableHead> */}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {demandes.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                   Aucune demande trouvée
//                 </TableCell>
//               </TableRow>
//             ) : (
//               demandes.map((demande) => (
//                 <TableRow key={demande.id}>
//                   <TableCell>{demande.typeDemande}</TableCell>
//                   <TableCell>
//                     {new Date(demande.createdAt || '').toLocaleDateString()}
//                   </TableCell>
//                   <TableCell>
//                     {demande.dateDebut && demande.dateFin
//                       ? `${new Date(demande.dateDebut).toLocaleDateString()} - ${new Date(demande.dateFin).toLocaleDateString()}`
//                       : '-'}
//                   </TableCell>
//                   <TableCell>{getStatutBadge(demande.statut)}</TableCell>
//                   <TableCell>{demande.typeProcessus?.libelle || '-'}</TableCell>
//                   <TableCell className="text-right">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleViewDetails(demande)}
//                     >
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Détails de la demande</DialogTitle>
//           </DialogHeader>
//           {selectedDemande && (
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-muted-foreground text-sm">Type</p>
//                   <p>{selectedDemande.typeDemande}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground text-sm">Statut</p>
//                   {getStatutBadge(selectedDemande.statut)}
//                 </div>
//                 {selectedDemande.dateDebut && (
//                   <div>
//                     <p className="text-muted-foreground text-sm">Date début</p>
//                     <p>{new Date(selectedDemande.dateDebut).toLocaleDateString()}</p>
//                   </div>
//                 )}
//                 {selectedDemande.dateFin && (
//                   <div>
//                     <p className="text-muted-foreground text-sm">Date fin</p>
//                     <p>{new Date(selectedDemande.dateFin).toLocaleDateString()}</p>
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <p className="text-muted-foreground text-sm">Motif</p>
//                 <p className="mt-1">{selectedDemande.motif}</p>
//               </div>

//               {selectedDemande.traitements && selectedDemande.traitements.length > 0 && (
//                 <div>
//                   <p className="text-muted-foreground text-sm mb-2">Historique de validation</p>
//                   <div className="space-y-2">
//                     {selectedDemande.traitements
//                       .sort((a, b) => a.ordre - b.ordre)
//                       .map((traitement) => (
//                         <div
//                           key={traitement.id}
//                           className="flex items-center justify-between p-3 border rounded-lg"
//                         >
//                           <div className="flex items-center gap-3">
//                             <Badge variant="outline">{traitement.ordre}</Badge>
//                             <div>
//                               <p>
//                                 {traitement.validateur?.lastName} {traitement.validateur?.name}
//                               </p>
//                               {traitement.commentaire && (
//                                 <p className="text-muted-foreground text-sm">
//                                   {traitement.commentaire}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                           <Badge
//                             variant={
//                               traitement.statut === 'VALIDEE'
//                                 ? 'outline'
//                                 : traitement.statut === 'REJETEE'
//                                 ? 'destructive'
//                                 : 'secondary'
//                             }
//                           >
//                             {traitement.statut}
//                           </Badge>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { FicheDescriptiveMission } from "../../types/Fdm";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";

type StatutFDM = "EN_ATTENTE" | "VALIDÉ" | "REJETÉ";

export const FDMPage = () => {
  const [fdms, setFdms] = useState<FicheDescriptiveMission[]>([]);
  const [selectedFDM, setSelectedFDM] =
    useState<FicheDescriptiveMission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFDMs();
  }, []);

  const loadFDMs = async () => {
    setIsLoading(true);
    try {
      const data = await FicheDescriptiveMissionAPI.getAll();
      setFdms(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des FDM");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatutBadge = (statut: StatutFDM) => {
    const variants: Record<
      StatutFDM,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      EN_ATTENTE: { variant: "secondary", label: "En attente" },
      VALIDÉ: { variant: "outline", label: "Validée" },
      REJETÉ: { variant: "destructive", label: "Rejetée" },
    };

    const config = variants[statut];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getReglementBadge = (regler: boolean) => {
    return (
      <Badge variant={regler ? "outline" : "secondary"}>
        {regler ? "Réglée" : "Non réglée"}
      </Badge>
    );
  };

  const handleViewDetails = (fdm: FicheDescriptiveMission) => {
    setSelectedFDM(fdm);
    setIsDetailOpen(true);
  };

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
        <h1>Mes Fiches Descriptives de Mission</h1>
        <Link to="/user/demandes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Demande
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Date départ</TableHead>
              <TableHead>Date retour</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Total estimatif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Règlement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fdms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucune FDM trouvée
                </TableCell>
              </TableRow>
            ) : (
              fdms.map((fdm) => (
                <TableRow key={fdm.id}>
                  <TableCell className="font-medium">{fdm.nomProjet}</TableCell>
                  <TableCell>{fdm.lieuMission}</TableCell>
                  <TableCell>
                    {new Date(fdm.dateDepart).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    {new Date(fdm.dateProbableRetour).toLocaleDateString(
                      "fr-FR"
                    )}
                  </TableCell>
                  <TableCell>{fdm.dureeMission} jour(s)</TableCell>
                  <TableCell className="font-semibold">
                    {fdm.totalEstimatif.toLocaleString("fr-FR")} CFA
                  </TableCell>
                  <TableCell>
                    {fdm.traitementPrecedent ? (
                      getStatutBadge(fdm.traitementPrecedent.statut)
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getReglementBadge(fdm.regler)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(fdm)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la Fiche Descriptive de Mission
            </DialogTitle>
          </DialogHeader>
          {selectedFDM && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Nom du projet
                    </p>
                    <p className="font-medium">{selectedFDM.nomProjet}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Lieu de mission
                    </p>
                    <p className="font-medium">{selectedFDM.lieuMission}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Date de départ
                    </p>
                    <p>
                      {new Date(selectedFDM.dateDepart).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Date probable de retour
                    </p>
                    <p>
                      {new Date(
                        selectedFDM.dateProbableRetour
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Durée de mission
                    </p>
                    <p>{selectedFDM.dureeMission} jour(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Émetteur</p>
                    <p>
                      {selectedFDM.emetteur.lastName}{" "}
                      {selectedFDM.emetteur.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Objectif */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Objectif de la mission</h3>
                <p className="text-sm">{selectedFDM.objectifMission}</p>
              </div>

              {/* Estimations financières */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Estimations financières</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Per diem</span>
                    <span className="font-medium">
                      {selectedFDM.perdieme.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Transport</span>
                    <span className="font-medium">
                      {selectedFDM.transport.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Bon essence</span>
                    <span className="font-medium">
                      {selectedFDM.bonEssence.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Péage</span>
                    <span className="font-medium">
                      {selectedFDM.peage.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Laisser-passer</span>
                    <span className="font-medium">
                      {selectedFDM.laisserPasser.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Hôtel</span>
                    <span className="font-medium">
                      {selectedFDM.hotel.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Divers</span>
                    <span className="font-medium">
                      {selectedFDM.divers.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span className="font-semibold">Total estimatif</span>
                    <span className="font-bold text-blue-700">
                      {selectedFDM.totalEstimatif.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Statut et traitement */}
              <div>
                <h3 className="font-semibold mb-3">Statut et règlement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Statut</p>
                    {selectedFDM.traitementPrecedent ? (
                      getStatutBadge(selectedFDM.traitementPrecedent.statut)
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Règlement</p>
                    {getReglementBadge(selectedFDM.regler)}
                  </div>
                  {selectedFDM.dateReglement && (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Date de règlement
                      </p>
                      <p>
                        {new Date(selectedFDM.dateReglement).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Commentaire du traitement */}
                {selectedFDM.traitementPrecedent?.commentaire && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">
                      Commentaire du validateur
                    </p>
                    <p className="text-sm">
                      {selectedFDM.traitementPrecedent.commentaire}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Traité par:{" "}
                      {selectedFDM.traitementPrecedent.traiteur.lastName}{" "}
                      {selectedFDM.traitementPrecedent.traiteur.name}
                      {" - "}
                      {new Date(
                        selectedFDM.traitementPrecedent.dateTraitement
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { demandesAPI } from "../../api/demandes";
// import { FicheDescriptiveMissionAPI } from "../../api/fdm";
// import { Demande, StatutDemande } from "../../types/Demande";
// import {
//   FicheDescriptiveMission,
//   TraitementFicheDescriptiveMission,
// } from "../../types/Fdm";
// import { Button } from "../../components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/table";
// import { Badge } from "../../components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "../../components/ui/dialog";
// import { Plus, Eye } from "lucide-react";
// import { toast } from "sonner";
// import { TypeDemande } from "../../types/Demande";

// type DemandeUnified = {
//   id: number;
//   type: TypeDemande;
//   titre: string;
//   periode: string;
//   info: string;
//   statut: any;
//   dateCreation?: Date;
//   data: Demande | FicheDescriptiveMission;
// };

// export const DemandesPage = () => {
//   const [unifiedDemandes, setUnifiedDemandes] = useState<DemandeUnified[]>([]);
//   const [selectedItem, setSelectedItem] = useState<DemandeUnified | null>(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     loadAllDemandes();
//   }, []);

//   const loadAllDemandes = async () => {
//     setIsLoading(true);
//     try {
//       // Charger toutes les demandes (classiques et FDM)
//       const [demandesData, fdmsData] = await Promise.all([
//         demandesAPI.getMesDemandes(),
//         FicheDescriptiveMissionAPI.getAll(),
//       ]);

//       // Transformer les demandes classiques
//       const demandesUnified: DemandeUnified[] = fdmsData.map((d) => ({
//         id: d.id,
//         type: "FicheDescriptiveMission" as TypeDemande,
//         titre: d.typeDemande,
//         periode:
//           d.dateDebut && d.dateFin
//             ? `${new Date(d.dateDebut).toLocaleDateString(
//                 "fr-FR"
//               )} - ${new Date(d.dateFin).toLocaleDateString("fr-FR")}`
//             : "-",
//         info: d.typeProcessus?.libelle || d.motif?.substring(0, 50) || "-",
//         statut: d.statut,
//         dateCreation: d.createdAt,
//         data: d,
//       }));

//       // Transformer les FDM
//       const fdmsUnified: DemandeUnified[] = fdmsData.map((f) => ({
//         id: f.id,
//         type: "FDM",
//         titre: f.nomProjet,
//         periode: `${new Date(f.dateDepart).toLocaleDateString(
//           "fr-FR"
//         )} - ${new Date(f.dateProbableRetour).toLocaleDateString("fr-FR")}`,
//         info: `${f.lieuMission} - ${f.totalEstimatif.toLocaleString(
//           "fr-FR"
//         )} CFA`,
//         statut: f.traitementPrecedent?.statut || "EN_ATTENTE",
//         dateCreation: f.dateDepart, // Utiliser dateDepart comme référence
//         data: f,
//       }));

//       // Fusionner et trier par date (les plus récentes en premier)
//       const unified = [...demandesUnified, ...fdmsUnified].sort((a, b) => {
//         const dateA = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
//         const dateB = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
//         return dateB - dateA;
//       });

//       setUnifiedDemandes(unified);
//     } catch (error) {
//       toast.error("Erreur lors du chargement des demandes");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getTypeBadge = (type: TypeDemande) => {
//     const colors: Record<TypeDemande, string> = {
//       FDM: "bg-blue-100 text-blue-800",
//       RFDM: "bg-green-100 text-green-800",
//       DDA: "bg-purple-100 text-purple-800",
//       BONPOUR: "bg-orange-100 text-orange-800",
//       AUTRE: "bg-gray-100 text-gray-800",
//     };

//     return <Badge className={colors[type] || colors.AUTRE}>{type}</Badge>;
//   };

//   const getStatutBadge = (item: DemandeUnified) => {
//     const statut = item.statut;

//     // Pour les demandes classiques
//     if (Object.values(StatutDemande).includes(statut)) {
//       const variants: Record<
//         StatutDemande,
//         {
//           variant: "default" | "secondary" | "destructive" | "outline";
//           label: string;
//         }
//       > = {
//         [StatutDemande.EN_ATTENTE]: {
//           variant: "secondary",
//           label: "En attente",
//         },
//         [StatutDemande.EN_COURS]: { variant: "default", label: "En cours" },
//         [StatutDemande.VALIDEE]: { variant: "outline", label: "Validée" },
//         [StatutDemande.REJETEE]: { variant: "destructive", label: "Rejetée" },
//       };
//       const config = variants[statut as StatutDemande];
//       return <Badge variant={config.variant}>{config.label}</Badge>;
//     }

//     // Pour les FDM
//     const variants = {
//       EN_ATTENTE: { variant: "secondary" as const, label: "En attente" },
//       VALIDÉ: { variant: "outline" as const, label: "Validée" },
//       REJETÉ: { variant: "destructive" as const, label: "Rejetée" },
//     };

//     const config = variants[statut] || variants.EN_ATTENTE;
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   const handleViewDetails = (item: DemandeUnified) => {
//     setSelectedItem(item);
//     setIsDetailOpen(true);
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
//         <h1 className="text-2xl font-bold">Mes Demandes</h1>
//         <Link to="/user/demandes/new">
//           <Button>
//             <Plus className="h-4 w-4 mr-2" />
//             Nouvelle Demande
//           </Button>
//         </Link>
//       </div>

//       <div className="bg-white rounded-lg border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Type</TableHead>
//               <TableHead>Titre/Objet</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Période</TableHead>
//               <TableHead>Information</TableHead>
//               <TableHead>Statut</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {unifiedDemandes.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={7}
//                   className="text-center py-8 text-muted-foreground"
//                 >
//                   Aucune demande trouvée
//                 </TableCell>
//               </TableRow>
//             ) : (
//               unifiedDemandes.map((item) => (
//                 <TableRow key={`${item.type}-${item.id}`}>
//                   <TableCell>{getTypeBadge(item.type)}</TableCell>
//                   <TableCell className="font-medium">{item.titre}</TableCell>
//                   <TableCell>
//                     {item.dateCreation
//                       ? new Date(item.dateCreation).toLocaleDateString("fr-FR")
//                       : "-"}
//                   </TableCell>
//                   <TableCell>{item.periode}</TableCell>
//                   <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
//                     {item.info}
//                   </TableCell>
//                   <TableCell>{getStatutBadge(item)}</TableCell>
//                   <TableCell className="text-right">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleViewDetails(item)}
//                     >
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
//         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               Détails de la demande - {selectedItem?.type}
//             </DialogTitle>
//           </DialogHeader>
//           {selectedItem && (
//             <>
//               {selectedItem.type === "FDM" ? (
//                 <FDMDetails
//                   fdm={selectedItem.data as FicheDescriptiveMission}
//                 />
//               ) : (
//                 <DemandeDetails demande={selectedItem.data as Demande} />
//               )}
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// // Composant pour afficher les détails d'une demande classique
// const DemandeDetails = ({ demande }: { demande: Demande }) => {
//   const getStatutBadge = (statut: StatutDemande) => {
//     const variants: Record<
//       StatutDemande,
//       {
//         variant: "default" | "secondary" | "destructive" | "outline";
//         label: string;
//       }
//     > = {
//       [StatutDemande.EN_ATTENTE]: { variant: "secondary", label: "En attente" },
//       [StatutDemande.EN_COURS]: { variant: "default", label: "En cours" },
//       [StatutDemande.VALIDEE]: { variant: "outline", label: "Validée" },
//       [StatutDemande.REJETEE]: { variant: "destructive", label: "Rejetée" },
//     };
//     const config = variants[statut];
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <p className="text-muted-foreground text-sm">Type</p>
//           <p className="font-medium">{demande.typeDemande}</p>
//         </div>
//         <div>
//           <p className="text-muted-foreground text-sm">Statut</p>
//           {getStatutBadge(demande.statut)}
//         </div>
//         {demande.dateDebut && (
//           <div>
//             <p className="text-muted-foreground text-sm">Date début</p>
//             <p>{new Date(demande.dateDebut).toLocaleDateString("fr-FR")}</p>
//           </div>
//         )}
//         {demande.dateFin && (
//           <div>
//             <p className="text-muted-foreground text-sm">Date fin</p>
//             <p>{new Date(demande.dateFin).toLocaleDateString("fr-FR")}</p>
//           </div>
//         )}
//         {demande.typeProcessus && (
//           <div>
//             <p className="text-muted-foreground text-sm">Processus</p>
//             <p>{demande.typeProcessus.libelle}</p>
//           </div>
//         )}
//       </div>

//       <div>
//         <p className="text-muted-foreground text-sm">Motif</p>
//         <p className="mt-1 text-sm">{demande.motif}</p>
//       </div>

//       {demande.traitements && demande.traitements.length > 0 && (
//         <div className="border-t pt-4">
//           <p className="text-muted-foreground text-sm mb-3 font-semibold">
//             Historique de validation
//           </p>
//           <div className="space-y-2">
//             {demande.traitements
//               .sort((a, b) => a.ordre - b.ordre)
//               .map((traitement: TraitementFicheDescriptiveMission) => (
//                 <div
//                   key={traitement.id}
//                   className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <Badge variant="outline">{traitement.ordre}</Badge>
//                     <div>
//                       <p className="font-medium">
//                         {traitement.validateur?.lastName}{" "}
//                         {traitement.validateur?.name}
//                       </p>
//                       {traitement.commentaire && (
//                         <p className="text-muted-foreground text-sm mt-1">
//                           {traitement.commentaire}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                   <Badge
//                     variant={
//                       traitement.statut === "VALIDEE"
//                         ? "outline"
//                         : traitement.statut === "REJETEE"
//                         ? "destructive"
//                         : "secondary"
//                     }
//                   >
//                     {traitement.statut}
//                   </Badge>
//                 </div>
//               ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Composant pour afficher les détails d'une FDM
// const FDMDetails = ({ fdm }: { fdm: FicheDescriptiveMission }) => (
//   <div className="space-y-6">
//     {/* Informations générales */}
//     <div className="border-b pb-4">
//       <h3 className="font-semibold mb-3 text-blue-700">
//         Informations générales
//       </h3>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <p className="text-muted-foreground text-sm">Nom du projet</p>
//           <p className="font-medium">{fdm.nomProjet}</p>
//         </div>
//         <div>
//           <p className="text-muted-foreground text-sm">Lieu de mission</p>
//           <p className="font-medium">{fdm.lieuMission}</p>
//         </div>
//         <div>
//           <p className="text-muted-foreground text-sm">Date de départ</p>
//           <p>{new Date(fdm.dateDepart).toLocaleDateString("fr-FR")}</p>
//         </div>
//         <div>
//           <p className="text-muted-foreground text-sm">
//             Date probable de retour
//           </p>
//           <p>{new Date(fdm.dateProbableRetour).toLocaleDateString("fr-FR")}</p>
//         </div>
//         <div>
//           <p className="text-muted-foreground text-sm">Durée de mission</p>
//           <p className="font-medium">{fdm.dureeMission} jour(s)</p>
//         </div>
//         <div>
//           <p className="text-muted-foreground text-sm">Émetteur</p>
//           <p>
//             {fdm.emetteur.lastName} {fdm.emetteur.name}
//           </p>
//         </div>
//       </div>
//     </div>

//     {/* Objectif */}
//     <div className="border-b pb-4">
//       <h3 className="font-semibold mb-3 text-blue-700">
//         Objectif de la mission
//       </h3>
//       <p className="text-sm bg-gray-50 p-3 rounded-lg">{fdm.objectifMission}</p>
//     </div>

//     {/* Estimations financières */}
//     <div className="border-b pb-4">
//       <h3 className="font-semibold mb-3 text-blue-700">
//         Estimations financières
//       </h3>
//       <div className="grid grid-cols-2 gap-3">
//         <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//           <span className="text-sm">Per diem</span>
//           <span className="font-medium">
//             {fdm.perdieme.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//         <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//           <span className="text-sm">Transport</span>
//           <span className="font-medium">
//             {fdm.transport.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//         <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//           <span className="text-sm">Bon essence</span>
//           <span className="font-medium">
//             {fdm.bonEssence.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//         <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//           <span className="text-sm">Péage</span>
//           <span className="font-medium">
//             {fdm.peage.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//         <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//           <span className="text-sm">Laisser-passer</span>
//           <span className="font-medium">
//             {fdm.laisserPasser.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//         <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//           <span className="text-sm">Hôtel</span>
//           <span className="font-medium">
//             {fdm.hotel.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//         <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//           <span className="text-sm">Divers</span>
//           <span className="font-medium">
//             {fdm.divers.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//         <div className="flex justify-between items-center p-3 bg-blue-100 rounded">
//           <span className="font-semibold">Total estimatif</span>
//           <span className="font-bold text-blue-700">
//             {fdm.totalEstimatif.toLocaleString("fr-FR")} CFA
//           </span>
//         </div>
//       </div>
//     </div>

//     {/* Statut et traitement */}
//     <div>
//       <h3 className="font-semibold mb-3 text-blue-700">Statut et règlement</h3>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <p className="text-muted-foreground text-sm">Statut</p>
//           <Badge
//             variant={
//               fdm.traitementPrecedent?.statut === "VALIDÉ"
//                 ? "outline"
//                 : fdm.traitementPrecedent?.statut === "REJETÉ"
//                 ? "destructive"
//                 : "secondary"
//             }
//           >
//             {fdm.traitementPrecedent?.statut || "En attente"}
//           </Badge>
//         </div>
//         <div>
//           <p className="text-muted-foreground text-sm">Règlement</p>
//           <Badge variant={fdm.regler ? "outline" : "secondary"}>
//             {fdm.regler ? "Réglée" : "Non réglée"}
//           </Badge>
//         </div>
//         {fdm.dateReglement && (
//           <div>
//             <p className="text-muted-foreground text-sm">Date de règlement</p>
//             <p>{new Date(fdm.dateReglement).toLocaleDateString("fr-FR")}</p>
//           </div>
//         )}
//       </div>

//       {fdm.traitementPrecedent?.commentaire && (
//         <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
//           <p className="text-muted-foreground text-sm mb-1 font-semibold">
//             Commentaire du validateur
//           </p>
//           <p className="text-sm">{fdm.traitementPrecedent.commentaire}</p>
//           <p className="text-xs text-muted-foreground mt-2">
//             Traité par: {fdm.traitementPrecedent.traiteur.lastName}{" "}
//             {fdm.traitementPrecedent.traiteur.name}
//             {" - "}
//             {new Date(
//               fdm.traitementPrecedent.dateTraitement
//             ).toLocaleDateString("fr-FR")}
//           </p>
//         </div>
//       )}
//     </div>
//   </div>
// );
