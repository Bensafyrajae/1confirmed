// -----------------------------
// Auth Types
// -----------------------------
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// -----------------------------
// Event Types
// -----------------------------
export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  maxParticipants?: number;
  currentParticipants: number;
  isPublic: boolean;
  registrationDeadline?: string;
  tags: string[];
  metadata: Record<string, any>;
  participants?: EventParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  recipientId: string;
  status: 'invited' | 'confirmed' | 'declined' | 'attended';
  invitedAt: string;
  respondedAt?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  status?: 'draft' | 'active';
  maxParticipants?: number;
  isPublic?: boolean;
  registrationDeadline?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// -----------------------------
// Recipient Types
// -----------------------------
export interface Recipient {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  position?: string;
  tags: string[];
  notes?: string;
  isActive: boolean;
  optOut: boolean;
  optOutDate?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipientData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  position?: string;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
}

// -----------------------------
// Message Types
// -----------------------------
export interface Message {
  id: string;
  userId: string;
  eventId?: string;
  subject: string;
  content: string;
  messageType: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  metadata: Record<string, any>;
  eventTitle?: string;
  sends?: MessageSend[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageSend {
  id: string;
  messageId: string;
  recipientId: string;
  recipientEmail: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  eventId?: string;
  subject: string;
  content: string;
  messageType?: 'email' | 'sms' | 'whatsapp' | 'push';
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageData {
  recipientIds: string[];
}

// -----------------------------
// API Response Types
// -----------------------------
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  offset: number;
}

// -----------------------------
// Stats Types
// -----------------------------
export interface Stats {
  events?: {
    total: number;
    active: number;
    draft: number;
    completed: number;
    upcoming: number;
    totalParticipants: number;
  };
  recipients?: {
    total: number;
    active: number;
    optedOut: number;
    withCompany: number;
  };
  messages?: {
    totalMessages: number;
    sentMessages: number;
    draftMessages: number;
    scheduledMessages: number;
    totalRecipients: number;
    successfulSends: number;
    failedSends: number;
  };
}

// -----------------------------
// UI & Misc Types
// -----------------------------
export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export interface FilterOptions {
  status?: string;
  eventId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  messageType?: string;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: FilterOptions;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface SelectOption {
  value: string;
  label: string;
}

// -----------------------------
// Dashboard & Notifications
// -----------------------------
export interface DashboardData {
  stats: Stats;
  upcomingEvents: Event[];
  recentMessages: Message[];
  recentRecipients: Recipient[];
  activityFeed: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'event_created' | 'message_sent' | 'recipient_added' | 'event_updated';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// -----------------------------
// WhatsApp Integration
// -----------------------------
export interface WhatsAppConfig {
  apiKey: string;
  baseUrl: string;
  templateId?: string;
}

export interface WhatsAppMessage {
  to: string;
  templateName?: string;
  parameters?: string[];
  message?: string;
  media?: {
    type: 'image' | 'document' | 'video';
    url: string;
    caption?: string;
  };
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}
