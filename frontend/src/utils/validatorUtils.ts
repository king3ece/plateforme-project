import axiosInstance from '../api/axios';

/**
 * Interface pour les validateurs
 */
export interface Validateur {
  id: number;
  ordre: number;
  reference?: string;
  typeProcessus?: {
    id: number;
    code: string;
    libelle: string;
  };
  user?: {
    id: number;
    name: string;
    lastName: string;
    email: string;
  };
  subdivision?: {
    id: number;
    libelle: string;
    code: string;
  };
}

/**
 * Interface pour la réponse de l'API
 */
interface ApiResponse<T> {
  code: number;
  message: string;
  object: T;
}

/**
 * Vérifie si l'utilisateur courant est validateur
 * en appelant l'API backend
 */
export async function checkIsValidator(): Promise<boolean> {
  try {
        const response = await axiosInstance.get<ApiResponse<{ isValidator: boolean }>>('/validateurs/is-validator');
        const isValidator = response.data.object.isValidator ?? false;
        return isValidator;
  } catch (error) {
    console.error('❌ validatorUtils - Erreur lors de la vérification du validateur:', error);
    return false;
  }
}

/**
 * Récupère tous les rôles de validateur de l'utilisateur courant
 */
export async function getMyValidatorRoles(): Promise<{
  validateurs: Validateur[];
  count: number;
  isValidator: boolean;
}> {
  try {
    const response = await axiosInstance.get<ApiResponse<{
      validateurs: Validateur[];
      count: number;
      isValidator: boolean;
    }>>('/validateurs/my-validations');

    return response.data.object;
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles validateur:', error);
    return {
      validateurs: [],
      count: 0,
      isValidator: false
    };
  }
}

/**
 * Compte le nombre total de demandes en attente de validation
 * pour tous les types (FDM, BONPOUR, RFDM, DDA)
 */
export async function getTotalPendingValidationsCount(): Promise<number> {
  try {
    const types = ['fdms', 'bonpours', 'rfdms', 'ddas'];

    const responses = await Promise.all(
      types.map(async (type) => {
        try {
          const response = await axiosInstance.get(`/${type}/pending-validations?page=0&size=1`);
          return response.data.object?.totalElements ?? 0;
        } catch {
          return 0;
        }
      })
    );

    return responses.reduce((total, count) => total + count, 0);
  } catch (error) {
    console.error('Erreur lors du comptage des validations:', error);
    return 0;
  }
}

/**
 * Vérifie si l'utilisateur a des demandes en attente de validation
 * pour un type de demande spécifique
 */
export async function hasPendingValidations(
  type: 'fdm' | 'bonpour' | 'rfdm' | 'dda'
): Promise<boolean> {
  try {
    const endpoint = getValidationEndpoint(type);
    const response = await axiosInstance.get(`${endpoint}/pending-validations?page=0&size=1`);
    const totalElements = response.data.object?.totalElements ?? 0;
    return totalElements > 0;
  } catch (error) {
    console.error(`Erreur lors de la vérification des validations ${type}:`, error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur a des demandes en attente (tous types)
 */
export async function hasAnyPendingValidations(): Promise<boolean> {
  try {
    const count = await getTotalPendingValidationsCount();
    return count > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des validations:', error);
    return false;
  }
}

/**
 * Obtient le nombre de demandes en attente pour chaque type
 */
export async function getPendingValidationsByType(): Promise<{
  fdm: number;
  bonpour: number;
  rfdm: number;
  dda: number;
  total: number;
}> {
  try {
    const [fdm, bonpour, rfdm, dda] = await Promise.all([
      getPendingCountForType('fdm'),
      getPendingCountForType('bonpour'),
      getPendingCountForType('rfdm'),
      getPendingCountForType('dda'),
    ]);

    return {
      fdm,
      bonpour,
      rfdm,
      dda,
      total: fdm + bonpour + rfdm + dda,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des validations par type:', error);
    return {
      fdm: 0,
      bonpour: 0,
      rfdm: 0,
      dda: 0,
      total: 0,
    };
  }
}

/**
 * Obtient le nombre de demandes en attente pour un type spécifique
 */
async function getPendingCountForType(type: 'fdm' | 'bonpour' | 'rfdm' | 'dda'): Promise<number> {
  try {
    const endpoint = getValidationEndpoint(type);
    const response = await axiosInstance.get(`${endpoint}/pending-validations?page=0&size=1`);
    return response.data.object?.totalElements ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Obtient l'endpoint API pour un type de demande
 */
function getValidationEndpoint(type: string): string {
  switch (type) {
    case 'fdm':
      return '/fdms';
    case 'bonpour':
      return '/bonpours';
    case 'rfdm':
      return '/rfdms';
    case 'dda':
      return '/ddas';
    default:
      return '/fdms';
  }
}

/**
 * Rafraîchit le statut de validateur et le nombre de demandes en attente
 */
export async function refreshValidatorStatus(): Promise<{
  isValidator: boolean;
  pendingCount: number;
  hasPending: boolean;
}> {
  try {
    const [isValidator, pendingCount] = await Promise.all([
      checkIsValidator(),
      getTotalPendingValidationsCount(),
    ]);

    return {
      isValidator,
      pendingCount,
      hasPending: pendingCount > 0,
    };
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du statut validateur:', error);
    return {
      isValidator: false,
      pendingCount: 0,
      hasPending: false,
    };
  }
}
