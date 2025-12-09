import { Poste } from "./Poste";
import { Subdivision } from "./Subdivision";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: number;
  reference: string;
  name: string;
  lastName: string;
  email: string;
  // Backend may use `roles` (enum) or `role` — accept both
  role?: UserRole;
  roles?: UserRole;
  posteRef?: string | null;
  posteId?: number;
  poste?: Poste | null;
  subdivision?: Subdivision | null;
  createdAt?: string;
  updatedAt?: string;
  enable?: boolean; // valeur reçue du back (typo kept from backend)
  isEnabled?: boolean; // alias plus lisible
}

export interface CreateUserDTO {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  poste?: Poste;
  posteRef?: Poste["reference"];
}

export interface UpdateUserDTO {
  reference: string; // Obligatoire pour l'update
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  poste?: Poste;
  posteRef?: string;
}
