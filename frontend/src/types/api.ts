/**
 * Types communs pour les réponses API
 */

export interface ApiResponse<T> {
  code: number;
  message: string;
  object: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  pageable: any;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export type Decision = 'VALIDER' | 'REJETER' | 'A_CORRIGER';

export interface TraitementRequest {
  decision: Decision;
  commentaire?: string;
}
