export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  max_participants?: number;
  current_participants: number;
  is_public: boolean;
  registration_deadline?: string;
  tags: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  participants?: EventParticipant[];
  event_title?: string; // Pour les jointures
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  maxParticipants?: number;
  isPublic?: boolean;
  registrationDeadline?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  recipient_id: string;
  status: 'invited' | 'confirmed' | 'declined' | 'attended' | 'no_show';
  invited_at: string;
  responded_at?: string;
  attended_at?: string;
  notes?: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
}

export interface EventStats {
  total: number;
  active: number;
  draft: number;
  completed: number;
  upcoming: number;
  total_participants: number;
}