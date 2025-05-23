// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Application Configuration
export const APP_NAME = process.env.REACT_APP_APP_NAME || 'EventSync';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const EVENT_STATUS_LABELS = {
  [EVENT_STATUS.DRAFT]: 'Brouillon',
  [EVENT_STATUS.ACTIVE]: 'Actif',
  [EVENT_STATUS.COMPLETED]: 'Terminé',
  [EVENT_STATUS.CANCELLED]: 'Annulé',
};

export const EVENT_STATUS_COLORS = {
  [EVENT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [EVENT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [EVENT_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
  [EVENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
};

// Message Status
export const MESSAGE_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

export const MESSAGE_STATUS_LABELS = {
  [MESSAGE_STATUS.DRAFT]: 'Brouillon',
  [MESSAGE_STATUS.SCHEDULED]: 'Programmé',
  [MESSAGE_STATUS.SENDING]: 'En cours d\'envoi',
  [MESSAGE_STATUS.SENT]: 'Envoyé',
  [MESSAGE_STATUS.FAILED]: 'Échec',
};

export const MESSAGE_STATUS_COLORS = {
  [MESSAGE_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [MESSAGE_STATUS.SCHEDULED]: 'bg-yellow-100 text-yellow-800',
  [MESSAGE_STATUS.SENDING]: 'bg-blue-100 text-blue-800',
  [MESSAGE_STATUS.SENT]: 'bg-green-100 text-green-800',
  [MESSAGE_STATUS.FAILED]: 'bg-red-100 text-red-800',
};

// Message Types
export const MESSAGE_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
} as const;

export const MESSAGE_TYPE_LABELS = {
  [MESSAGE_TYPES.EMAIL]: 'Email',
  [MESSAGE_TYPES.SMS]: 'SMS',
  [MESSAGE_TYPES.PUSH]: 'Notification Push',
};

// Participant Status
export const PARTICIPANT_STATUS = {
  INVITED: 'invited',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
  ATTENDED: 'attended',
  NO_SHOW: 'no_show',
} as const;

export const PARTICIPANT_STATUS_LABELS = {
  [PARTICIPANT_STATUS.INVITED]: 'Invité',
  [PARTICIPANT_STATUS.CONFIRMED]: 'Confirmé',
  [PARTICIPANT_STATUS.DECLINED]: 'Décliné',
  [PARTICIPANT_STATUS.ATTENDED]: 'Présent',
  [PARTICIPANT_STATUS.NO_SHOW]: 'Absent',
};

export const PARTICIPANT_STATUS_COLORS = {
  [PARTICIPANT_STATUS.INVITED]: 'bg-gray-100 text-gray-800',
  [PARTICIPANT_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [PARTICIPANT_STATUS.DECLINED]: 'bg-red-100 text-red-800',
  [PARTICIPANT_STATUS.ATTENDED]: 'bg-blue-100 text-blue-800',
  [PARTICIPANT_STATUS.NO_SHOW]: 'bg-yellow-100 text-yellow-800',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  RECIPIENTS: '/recipients',
  MESSAGES: '/messages',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_TITLE_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_SUBJECT_LENGTH: 500,
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  FULL: 'EEEE dd MMMM yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  NOT_FOUND: 'La ressource demandée n\'a pas été trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Les données saisies ne sont pas valides.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Événement créé avec succès',
  EVENT_UPDATED: 'Événement mis à jour avec succès',
  EVENT_DELETED: 'Événement supprimé avec succès',
  RECIPIENT_CREATED: 'Destinataire ajouté avec succès',
  RECIPIENT_UPDATED: 'Destinataire mis à jour avec succès',
  RECIPIENT_DELETED: 'Destinataire supprimé avec succès',
  MESSAGE_SENT: 'Message envoyé avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
} as const;