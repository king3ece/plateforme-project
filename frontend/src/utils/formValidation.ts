/**
 * Form validation utilities for displaying error messages in red
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates FDM (Fiche Descriptive de Mission) form data
 */
export const validateFDMForm = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.nomProjet?.trim()) {
    errors.push({
      field: "nomProjet",
      message: "Le nom du projet est obligatoire",
    });
  }

  if (!data.lieuMission?.trim()) {
    errors.push({
      field: "lieuMission",
      message: "Le lieu de la mission est obligatoire",
    });
  }

  if (!data.dateDepart?.trim()) {
    errors.push({
      field: "dateDepart",
      message: "La date de départ est obligatoire",
    });
  }

  if (!data.dateProbableRetour?.trim()) {
    errors.push({
      field: "dateProbableRetour",
      message: "La date probable de retour est obligatoire",
    });
  }

  if (!data.dureeMission?.toString().trim()) {
    errors.push({
      field: "dureeMission",
      message: "La durée de la mission est obligatoire",
    });
  }

  if (!data.objectifMission?.trim()) {
    errors.push({
      field: "objectifMission",
      message: "L'objectif de la mission est obligatoire",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates RFDM (Rapport Financier de Mission) form data
 */
export const validateRFDMForm = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.objet?.trim()) {
    errors.push({ field: "objet", message: "L'objet est obligatoire" });
  }

  if (!data.dateDebut?.trim()) {
    errors.push({
      field: "dateDebut",
      message: "La date de début est obligatoire",
    });
  }

  if (!data.dateFin?.trim()) {
    errors.push({
      field: "dateFin",
      message: "La date de fin est obligatoire",
    });
  }

  if (data.montantDepense === undefined || data.montantDepense === null) {
    errors.push({
      field: "montantDepense",
      message: "Le montant dépensé est obligatoire",
    });
  }

  if (data.montantRecu === undefined || data.montantRecu === null) {
    errors.push({
      field: "montantRecu",
      message: "Le montant reçu est obligatoire",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates Demande d'Achat (DDA) form data
 */
export const validateDDAForm = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.destination?.trim()) {
    errors.push({
      field: "destination",
      message: "La destination est obligatoire",
    });
  }

  if (!data.fournisseur?.trim()) {
    errors.push({
      field: "fournisseur",
      message: "Le fournisseur est obligatoire",
    });
  }

  if (!data.service?.trim()) {
    errors.push({ field: "service", message: "Le service est obligatoire" });
  }

  if (!data.client?.trim()) {
    errors.push({ field: "client", message: "Le client est obligatoire" });
  }

  if (
    data.montantProjet === undefined ||
    data.montantProjet === null ||
    data.montantProjet <= 0
  ) {
    errors.push({
      field: "montantProjet",
      message: "Le montant du projet doit être supérieur à 0",
    });
  }

  if (!data.lignes || data.lignes.length === 0) {
    errors.push({
      field: "lignes",
      message: "Au moins une ligne est obligatoire",
    });
  } else {
    data.lignes.forEach((ligne: any, index: number) => {
      if (!ligne.designation?.trim()) {
        errors.push({
          field: `lignes[${index}].designation`,
          message: `Ligne ${index + 1}: La désignation est obligatoire`,
        });
      }

      if (!ligne.reference?.trim()) {
        errors.push({
          field: `lignes[${index}].reference`,
          message: `Ligne ${index + 1}: La référence est obligatoire`,
        });
      }

      if (
        ligne.quantite === undefined ||
        ligne.quantite === null ||
        ligne.quantite <= 0
      ) {
        errors.push({
          field: `lignes[${index}].quantite`,
          message: `Ligne ${index + 1}: La quantité doit être supérieure à 0`,
        });
      }

      if (
        ligne.prixUnitaire === undefined ||
        ligne.prixUnitaire === null ||
        ligne.prixUnitaire < 0
      ) {
        errors.push({
          field: `lignes[${index}].prixUnitaire`,
          message: `Ligne ${index + 1}: Le prix unitaire doit être positif`,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates Bon Pour form data
 */
export const validateBonPourForm = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.numero?.trim()) {
    errors.push({ field: "numero", message: "Le numéro est obligatoire" });
  }

  if (!data.designation?.trim()) {
    errors.push({
      field: "designation",
      message: "La désignation est obligatoire",
    });
  }

  if (
    data.montant === undefined ||
    data.montant === null ||
    data.montant <= 0
  ) {
    errors.push({
      field: "montant",
      message: "Le montant doit être supérieur à 0",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (
  errors: ValidationError[],
  field: string
): string | null => {
  const error = errors.find((e) => e.field === field);
  return error?.message || null;
};

/**
 * Check if a field has an error
 */
export const hasFieldError = (
  errors: ValidationError[],
  field: string
): boolean => {
  return errors.some((e) => e.field === field);
};
