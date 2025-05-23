export interface Recipient {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company?: string;
  position?: string;
  tags: string[];
  notes?: string;
  is_active: boolean;
  opt_out: boolean;
  opt_out_date?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateRecipientRequest {
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

export interface RecipientStats {
  total: number;
  active: number;
  opted_out: number;
  with_company: number;
}