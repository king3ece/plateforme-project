export const validators = {
  email: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'L\'email est requis';
    if (!emailRegex.test(email)) return 'Email invalide';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Le mot de passe est requis';
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    return null;
  },

  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `${fieldName} est requis`;
    return null;
  },

  dateRange: (dateDebut: string, dateFin: string): string | null => {
    if (!dateDebut || !dateFin) return 'Les deux dates sont requises';
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (debut > fin) return 'La date de début doit être antérieure à la date de fin';
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) return `${fieldName} doit contenir au moins ${min} caractères`;
    return null;
  },
};
