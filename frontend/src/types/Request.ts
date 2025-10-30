// export enum RequestType {
//   FDM = "FDM",
//   RFDM = "RFDM",
//   DDA = "DDA",
//   BONPOUR = "BONPOUR",
//   CONGE = "CONGE",
//   FORMATION = "FORMATION",
//   ACHAT = "ACHAT",
//   MISSION = "MISSION",
//   AUTRE = "AUTRE",
// }

// export enum RequestPriority {
//   LOW = "LOW",
//   MEDIUM = "MEDIUM",
//   HIGH = "HIGH",
//   URGENT = "URGENT",
// }

// export enum RequestStatus {

//   DRAFT = "DRAFT",
//   IN_PROGRESS = "IN_PROGRESS",
//   COMPLETED = "COMPLETED",
//   CANCELLED = "CANCELLED",
//   PENDING = "PENDING",
//   APPROVED = "APPROVED",
//   REJECTED = "REJECTED",
// }

// export interface CreateRequestPayload {
//   title: string;
//   description: string;
//   type: RequestType;
//   priority: RequestPriority;
//   attachments?: File[];
//   dynamicFields?: Record<string, any>;
// }

// Énumération des types de demandes
export enum RequestType {
  FDM = "FDM", // Fiche Descriptive de Mission
  RFDM = "RFDM", // Rapport Financier De Mission
  DDA = "DDA", // Demande D'Achat
  BONPOUR = "BONPOUR", // Bon Pour
  CONGE = "CONGE",
  FORMATION = "FORMATION",
  ACHAT = "ACHAT",
  MISSION = "MISSION",
  AUTRE = "AUTRE",
}

// Énumération des priorités
export enum RequestPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

// Énumération des statuts
export enum RequestStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Interface pour créer une demande
export interface CreateRequestPayload {
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  attachments?: File[];
  dynamicFields?: Record<string, any>;
}

// Interface pour une demande complète
export interface Request {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  dynamicFields?: Record<string, any>;
  attachments?: string[];
  comments?: RequestComment[];
  workflow?: {
    currentStep: number;
    totalSteps: number;
    currentValidator?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

// Interface pour les commentaires
export interface RequestComment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  type: "APPROVAL" | "REJECTION" | "COMMENT";
}

// Types spécifiques pour chaque formulaire
export interface MissionFormData {
  missionDescription: string;
  missionObject: string;
  startDate: string;
  endDate: string;
  hotelAndMeal?: string;
  phone?: string;
  transport?: string;
  fuel?: string;
  toll?: string;
  missionAllowance?: string;
  passFee?: string;
  otherCost?: string;
  amountReceived?: string;
  amountSpent?: string;
  balance?: string;
  comments?: string;
  files: File[];
}

export interface RapportFinancierData {
  objet: string;
  dateDebut: string;
  dateFin: string;
  hotelDejeuner?: number;
  telephone?: number;
  transport?: number;
  indemnites?: number;
  laisserPasser?: number;
  coutDivers?: number;
  montantRecu?: number;
  montantDepense?: number;
  commentaire?: string;
  fichiers: File[];
}

export interface LigneAchat {
  reference: string;
  designation: string;
  prixUnitaire: number;
  quantite: number;
}

export interface DemandeAchatData {
  destination: string;
  fournisseur: string;
  service: string;
  client: string;
  montantProjet?: number;
  prixTotal?: number;
  commentaire?: string;
  lignes: LigneAchat[];
  fichiers: File[];
}

export interface LigneBonPour {
  libelle: string;
  montant: number;
}

export interface BonPourData {
  montantTotal?: number;
  lignes: LigneBonPour[];
  fichiers: File[];
}
