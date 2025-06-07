export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  business_name?: string;
  business_type?: string;
  subscription_tier: 'free_trial' | 'basic' | 'premium' | 'enterprise';
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Appointment {
  id: string;
  professional_id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  service_id?: string;
  service_name?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  professional_id: string;
  client_id?: string;
  client_name?: string;
  client_phone: string;
  status: 'active' | 'closed';
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  total_conversations: number;
  conversion_rate: number;
}
