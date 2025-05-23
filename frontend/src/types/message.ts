export interface Message {
  id: string;
  user_id: string;
  event_id?: string;
  subject: string;
  content: string;
  message_type: 'email' | 'sms' | 'push';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  event_title?: string; // Pour les jointures
  sends?: MessageSend[];
}

export interface CreateMessageRequest {
  eventId?: string;
  subject: string;
  content: string;
  messageType?: 'email' | 'sms' | 'push';
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface MessageSend {
  id: string;
  message_id: string;
  recipient_id: string;
  recipient_email: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  tracking_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

export interface MessageStats {
  total_messages: number;
  sent_messages: number;
  draft_messages: number;
  scheduled_messages: number;
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
}