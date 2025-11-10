import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  MessageSquare,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { FicheDescriptiveMissionAPI } from "../../api/fdm";
import { FicheDescriptiveMission } from "../../types/Fdm";

export function ValidationPage() {
  const [requests, setRequests] = useState<FicheDescriptiveMission[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FicheDescriptiveMission | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPendingValidations();
  }, []);

  const loadPendingValidations = async () => {
    setIsLoading(true);
    try {
      const data = await FicheDescriptiveMissionAPI.getPendingValidations();
      setRequests(data);
    } catch (error) {
      console.error("Error loading pending validations:", error);
      toast.error("Erreur lors du chargement des demandes à valider");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.nomProjet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lieuMission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.objectifMission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${request.emetteur.lastName} ${request.emetteur.name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetails = (request: FicheDescriptiveMission) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const handleApprove = async (request: FicheDescriptiveMission) => {
    try {
      setIsProcessing(true);
      await FicheDescriptiveMissionAPI.traiter(request.id, {
        decision: "VALIDER",
        commentaire: "",
      });
      toast.success(`Demande "${request.nomProjet}" approuvée avec succès`);
      setShowDetailsDialog(false);
      await loadPendingValidations();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Erreur lors de l'approbation de la demande");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (request: FicheDescriptiveMission) => {
    setSelectedRequest(request);
    setRejectComment("");
    setShowDetailsDialog(false);
    setShowRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;

    if (!rejectComment.trim()) {
      toast.error("Veuillez fournir un commentaire pour le rejet");
      return;
    }

    try {
      setIsProcessing(true);
      await FicheDescriptiveMissionAPI.traiter(selectedRequest.id, {
        decision: "REJETER",
        commentaire: rejectComment,
      });
      toast.success(`Demande "${selectedRequest.nomProjet}" rejetée`);
      setShowRejectDialog(false);
      setRejectComment("");
      await loadPendingValidations();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Erreur lors du rejet de la demande");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Validation des demandes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Consultez et traitez les demandes en attente de validation
        </p>
      </div>

      <Card className="flex-shrink-0 mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="sr-only">
                Rechercher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Rechercher par projet, lieu, objectif ou demandeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-y-auto pr-2">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? "Aucune demande trouvée avec les critères de recherche" : "Aucune demande en attente de validation"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 pb-6">
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800">FDM</Badge>
                        <Badge variant="outline">
                          {request.typeProcessus?.libelle || "FDM"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{request.nomProjet}</CardTitle>
                      <CardDescription className="mt-1">
                        Par {request.emetteur.lastName}{" "}
                        {request.emetteur.name} •{" "}
                        {formatDate(request.dateDepart)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Lieu:</span> {request.lieuMission}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Période:</span>{" "}
                      {formatDate(request.dateDepart)} -{" "}
                      {formatDate(request.dateProbableRetour)} ({request.dureeMission} jours)
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Budget estimatif:</span>{" "}
                      {request.totalEstimatif.toLocaleString("fr-FR")} CFA
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Voir détails
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(request)}
                      disabled={isProcessing}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Fiche Descriptive de Mission</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Nom du projet
                    </p>
                    <p className="font-medium">{selectedRequest.nomProjet}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Lieu de mission
                    </p>
                    <p className="font-medium">{selectedRequest.lieuMission}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Date de départ
                    </p>
                    <p>{formatDate(selectedRequest.dateDepart)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Date probable de retour
                    </p>
                    <p>{formatDate(selectedRequest.dateProbableRetour)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Durée de mission
                    </p>
                    <p>{selectedRequest.dureeMission} jour(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Émetteur</p>
                    <p>
                      {selectedRequest.emetteur.lastName}{" "}
                      {selectedRequest.emetteur.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Objectif de la mission</h3>
                <p className="text-sm">{selectedRequest.objectifMission}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Estimations financières</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Per diem</span>
                    <span className="font-medium">
                      {selectedRequest.perdieme.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Transport</span>
                    <span className="font-medium">
                      {selectedRequest.transport.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Bon essence</span>
                    <span className="font-medium">
                      {selectedRequest.bonEssence.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Péage</span>
                    <span className="font-medium">
                      {selectedRequest.peage.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Laisser-passer</span>
                    <span className="font-medium">
                      {selectedRequest.laisserPasser.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Hôtel</span>
                    <span className="font-medium">
                      {selectedRequest.hotel.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Divers</span>
                    <span className="font-medium">
                      {selectedRequest.divers.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span className="font-semibold">Total estimatif</span>
                    <span className="font-bold text-blue-700">
                      {selectedRequest.totalEstimatif.toLocaleString("fr-FR")} CFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Fermer
            </Button>
            {selectedRequest && (
              <>
                <Button
                  variant="default"
                  onClick={() =>
                    selectedRequest && handleApprove(selectedRequest)
                  }
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    selectedRequest && handleReject(selectedRequest)
                  }
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir un commentaire expliquant le motif du rejet
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Demande</Label>
                <p className="text-sm mt-1 font-semibold">
                  {selectedRequest.nomProjet}
                </p>
              </div>

              <div>
                <Label htmlFor="rejectComment">
                  Commentaire <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectComment"
                  placeholder="Expliquez pourquoi cette demande est rejetée ou ce qui doit être corrigé..."
                  rows={4}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce commentaire sera visible par le demandeur
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectComment("");
              }}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isProcessing || !rejectComment.trim()}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
