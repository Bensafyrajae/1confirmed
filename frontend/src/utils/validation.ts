import { VALIDATION_RULES } from '@/utils/constants';

// Types pour la validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Fonction principale de validation
export const validate = (data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    const error = validateField(value, rule, field);
    
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validation d'un champ individuel
export const validateField = (value: any, rule: ValidationRule, fieldName: string): string | null => {
  // Vérification required
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${fieldName} est requis`;
  }

  // Si la valeur est vide et non requise, pas d'autres validations
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Vérification longueur minimale
  if (rule.minLength && value.length < rule.minLength) {
    return `${fieldName} doit contenir au moins ${rule.minLength} caractères`;
  }

  // Vérification longueur maximale
  if (rule.maxLength && value.length > rule.maxLength) {
    return `${fieldName} ne peut pas dépasser ${rule.maxLength} caractères`;
  }

  // Vérification pattern
  if (rule.pattern && !rule.pattern.test(value)) {
    return `${fieldName} n'est pas dans un format valide`;
  }

  // Validation personnalisée
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

// Validateurs spécialisés
export const validators = {
  email: (email: string): string | null => {
    if (!email) return 'Email requis';
    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      return 'Format d\'email invalide';
    }
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Mot de passe requis';
    if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      return `Le mot de passe doit contenir au moins ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} caractères`;
    }
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Confirmation du mot de passe requise';
    if (password !== confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  },

  required: (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} est requis`;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value && value.length < min) {
      return `${fieldName} doit contenir au moins ${min} caractères`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value && value.length > max) {
      return `${fieldName} ne peut pas dépasser ${max} caractères`;
    }
    return null;
  },

  url: (url: string): string | null => {
    if (!url) return null;
    try {
      new URL(url);
      return null;
    } catch {
      return 'URL invalide';
    }
  },

  phone: (phone: string): string | null => {
    if (!phone) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Numéro de téléphone invalide';
    }
    return null;
  },

  date: (date: string): string | null => {
    if (!date) return null;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    return null;
  },

  futureDate: (date: string): string | null => {
    if (!date) return null;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    if (dateObj <= new Date()) {
      return 'La date doit être dans le futur';
    }
    return null;
  },

  pastDate: (date: string): string | null => {
    if (!date) return null;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    if (dateObj >= new Date()) {
      return 'La date doit être dans le passé';
    }
    return null;
  },

  number: (value: any): string | null => {
    if (value === '' || value === null || value === undefined) return null;
    if (isNaN(Number(value))) {
      return 'Doit être un nombre valide';
    }
    return null;
  },

  positiveNumber: (value: any): string | null => {
    const numberError = validators.number(value);
    if (numberError) return numberError;
    if (value !== '' && Number(value) <= 0) {
      return 'Doit être un nombre positif';
    }
    return null;
  },

  integer: (value: any): string | null => {
    const numberError = validators.number(value);
    if (numberError) return numberError;
    if (value !== '' && !Number.isInteger(Number(value))) {
      return 'Doit être un nombre entier';
    }
    return null;
  },
};

// Schémas de validation prédéfinis
export const validationSchemas = {
  login: {
    email: { required: true, pattern: VALIDATION_RULES.EMAIL_REGEX },
    password: { required: true, minLength: VALIDATION_RULES.MIN_PASSWORD_LENGTH },
  },

  register: {
    email: { required: true, pattern: VALIDATION_RULES.EMAIL_REGEX },
    password: { required: true, minLength: VALIDATION_RULES.MIN_PASSWORD_LENGTH },
    firstName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    lastName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    companyName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
  },

  event: {
    title: { required: true, maxLength: VALIDATION_RULES.MAX_TITLE_LENGTH },
    description: { maxLength: VALIDATION_RULES.MAX_DESCRIPTION_LENGTH },
    eventDate: { required: true, custom: validators.futureDate },
    location: { maxLength: 500 },
  },

  recipient: {
    email: { required: true, pattern: VALIDATION_RULES.EMAIL_REGEX },
    firstName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    lastName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    company: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    position: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    phone: { custom: validators.phone },
  },

  message: {
    subject: { required: true, maxLength: VALIDATION_RULES.MAX_SUBJECT_LENGTH },
    content: { required: true, maxLength: VALIDATION_RULES.MAX_DESCRIPTION_LENGTH },
    scheduledAt: { custom: validators.futureDate },
  },

  profile: {
    firstName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    lastName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
    companyName: { maxLength: VALIDATION_RULES.MAX_NAME_LENGTH },
  },

  changePassword: {
    currentPassword: { required: true },
    newPassword: { required: true, minLength: VALIDATION_RULES.MIN_PASSWORD_LENGTH },
    confirmPassword: { required: true },
  },
};

// Hook personnalisé pour la validation en temps réel
export const useValidation = (schema: Record<string, ValidationRule>) => {
  const validateForm = (data: Record<string, any>) => {
    return validate(data, schema);
  };

  const validateSingleField = (fieldName: string, value: any) => {
    if (schema[fieldName]) {
      const error = validateField(value, schema[fieldName], fieldName);
      return error;
    }
    return null;
  };

  return {
    validateForm,
    validateSingleField,
  };
};