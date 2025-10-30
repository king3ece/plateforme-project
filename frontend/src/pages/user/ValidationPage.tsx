import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import {
  RequestType,
  RequestPriority,
  RequestStatus,
} from "../../types/request";

interface Request {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  dynamicFields?: Record<string, any>;
  attachments?: string[];
}

// Données de test - À remplacer par un appel API
const mockRequests: Request[] = [
  {
    id: "1",
    title: "Demande de congé annuel",
    description:
      "Je souhaite prendre mes congés annuels pour raisons personnelles",
    type: RequestType.CONGE,
    priority: RequestPriority.MEDIUM,
    status: RequestStatus.PENDING,
    createdAt: "2024-01-15T10:30:00",
    createdBy: {
      id: "u1",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@example.com",
    },
    dynamicFields: {
      startDate: "2024-02-01",
      endDate: "2024-02-15",
    },
  },
  {
    id: "2",
    title: "Formation TypeScript",
    description:
      "Besoin d'une formation avancée en TypeScript pour améliorer mes compétences",
    type: RequestType.FORMATION,
    priority: RequestPriority.HIGH,
    status: RequestStatus.PENDING,
    createdAt: "2024-01-16T14:20:00",
    createdBy: {
      id: "u2",
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
    },
    dynamicFields: {
      trainingTitle: "TypeScript avancé et patterns",
    },
  },
  {
    id: "3",
    title: "Achat de matériel informatique",
    description:
      "Besoin d'un nouvel ordinateur portable pour remplacer l'ancien",
    type: RequestType.ACHAT,
    priority: RequestPriority.URGENT,
    status: RequestStatus.PENDING,
    createdAt: "2024-01-17T09:00:00",
    createdBy: {
      id: "u3",
      firstName: "Pierre",
      lastName: "Dubois",
      email: "pierre.dubois@example.com",
    },
    dynamicFields: {
      amount: 1500,
    },
  },
];

export function ValidationPage() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  const typeLabels: Record<RequestType, string> = {
    [RequestType.FDM]: "Fiche descriptive de mission",
    [RequestType.RFDM]: "Rapport Financier de mission",
    [RequestType.DDA]: "Demande d'achat",
    [RequestType.BONPOUR]: "Bon pour",
    [RequestType.CONGE]: "Congé",
    [RequestType.FORMATION]: "Formation",
    [RequestType.ACHAT]: "Achat",
    [RequestType.MISSION]: "Mission",
    [RequestType.AUTRE]: "Autre",
  };

  const priorityLabels: Record<RequestPriority, string> = {
    [RequestPriority.LOW]: "Faible",
    [RequestPriority.MEDIUM]: "Moyenne",
    [RequestPriority.HIGH]: "Élevée",
    [RequestPriority.URGENT]: "Urgente",
  };

  const statusLabels: Record<RequestStatus, string> = {
    [RequestStatus.DRAFT]: "Brouillon",
    [RequestStatus.PENDING]: "En attente",
    [RequestStatus.APPROVED]: "Approuvée",
    [RequestStatus.REJECTED]: "Rejetée",
    [RequestStatus.IN_PROGRESS]: "En cours",
    [RequestStatus.COMPLETED]: "Terminée",
    [RequestStatus.CANCELLED]: "Annulée",
  };

  const priorityColors: Record<RequestPriority, string> = {
    [RequestPriority.LOW]: "bg-gray-100 text-gray-700",
    [RequestPriority.MEDIUM]: "bg-blue-100 text-blue-700",
    [RequestPriority.HIGH]: "bg-orange-100 text-orange-700",
    [RequestPriority.URGENT]: "bg-red-100 text-red-700",
  };

  const statusColors: Record<RequestStatus, string> = {
    [RequestStatus.DRAFT]: "bg-gray-100 text-gray-700",
    [RequestStatus.PENDING]: "bg-yellow-100 text-yellow-700",
    [RequestStatus.APPROVED]: "bg-green-100 text-green-700",
    [RequestStatus.REJECTED]: "bg-red-100 text-red-700",
    [RequestStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700",
    [RequestStatus.COMPLETED]: "bg-purple-100 text-purple-700",
    [RequestStatus.CANCELLED]: "bg-gray-100 text-gray-700",
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${request.createdBy.firstName} ${request.createdBy.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || request.type === filterType;
    const matchesPriority =
      filterPriority === "all" || request.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const handleApprove = async (request: Request) => {
    try {
      setIsProcessing(true);

      // TODO: Remplacer par l'appel API réel
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id ? { ...r, status: RequestStatus.APPROVED } : r
        )
      );

      toast.success(`Demande "${request.title}" approuvée avec succès`);
      setShowDetailsDialog(false);
    } catch (error) {
      toast.error("Erreur lors de l'approbation de la demande");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (request: Request) => {
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

      // TODO: Remplacer par l'appel API réel avec le commentaire
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Commentaire de rejet:", rejectComment);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: RequestStatus.REJECTED }
            : r
        )
      );

      toast.success(`Demande "${selectedRequest.title}" rejetée`);
      setShowRejectDialog(false);
      setRejectComment("");
    } catch (error) {
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderDynamicFields = (request: Request) => {
    if (!request.dynamicFields) return null;

    const fields = [];

    switch (request.type) {
      case RequestType.CONGE:
        fields.push(
          <div key="dates" className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Date de début
              </Label>
              <p className="text-sm mt-1">
                {new Date(request.dynamicFields.startDate).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Date de fin
              </Label>
              <p className="text-sm mt-1">
                {new Date(request.dynamicFields.endDate).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
            </div>
          </div>
        );
        break;

      case RequestType.FORMATION:
        fields.push(
          <div key="training">
            <Label className="text-sm font-medium text-gray-500">
              Titre de la formation
            </Label>
            <p className="text-sm mt-1">
              {request.dynamicFields.trainingTitle}
            </p>
          </div>
        );
        break;

      case RequestType.ACHAT:
        fields.push(
          <div key="amount">
            <Label className="text-sm font-medium text-gray-500">
              Montant estimé
            </Label>
            <p className="text-sm mt-1 font-semibold">
              {request.dynamicFields.amount.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        );
        break;

      case RequestType.MISSION:
        fields.push(
          <div key="mission" className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Destination
              </Label>
              <p className="text-sm mt-1">
                {request.dynamicFields.missionDestination}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Date de début
                </Label>
                <p className="text-sm mt-1">
                  {new Date(request.dynamicFields.startDate).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Date de fin
                </Label>
                <p className="text-sm mt-1">
                  {new Date(request.dynamicFields.endDate).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              </div>
            </div>
          </div>
        );
        break;
    }

    return fields.length > 0 ? (
      <div className="space-y-3 pt-4 border-t">{fields}</div>
    ) : null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Validation des demandes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Consultez et traitez les demandes en attente de validation
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card className="flex-shrink-0 mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="sr-only">
                Rechercher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Rechercher par titre, description ou demandeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filterType" className="sr-only">
                Filtrer par type
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de demande" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.values(RequestType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {typeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterPriority" className="sr-only">
                Filtrer par priorité
              </Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  {Object.values(RequestPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <div className="flex-1 overflow-y-auto pr-2">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Aucune demande trouvée avec les filtres actuels
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
                        <Badge className={priorityColors[request.priority]}>
                          {priorityLabels[request.priority]}
                        </Badge>
                        <Badge className={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                        <Badge variant="outline">
                          {typeLabels[request.type]}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Par {request.createdBy.firstName}{" "}
                        {request.createdBy.lastName} •{" "}
                        {formatDate(request.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {request.description}
                  </p>
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
                    {request.status === RequestStatus.PENDING && (
                      <>
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
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog détails */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={priorityColors[selectedRequest.priority]}>
                  {priorityLabels[selectedRequest.priority]}
                </Badge>
                <Badge className={statusColors[selectedRequest.status]}>
                  {statusLabels[selectedRequest.status]}
                </Badge>
                <Badge variant="outline">
                  {typeLabels[selectedRequest.type]}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Titre
                </Label>
                <p className="text-base font-semibold mt-1">
                  {selectedRequest.title}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Description
                </Label>
                <p className="text-sm mt-1">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Demandeur
                  </Label>
                  <p className="text-sm mt-1">
                    {selectedRequest.createdBy.firstName}{" "}
                    {selectedRequest.createdBy.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedRequest.createdBy.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Date de création
                  </Label>
                  <p className="text-sm mt-1">
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>

              {renderDynamicFields(selectedRequest)}

              {selectedRequest.attachments &&
                selectedRequest.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Pièces jointes
                    </Label>
                    <div className="mt-2 space-y-2">
                      {selectedRequest.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer"
                        >
                          📎 {attachment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Fermer
            </Button>
            {selectedRequest?.status === RequestStatus.PENDING && (
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

      {/* Dialog rejet avec commentaire */}
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
                  {selectedRequest.title}
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
