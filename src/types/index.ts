export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at?: string;
  subscription_tier: 'free_trial' | 'basic' | 'premium' | 'enterprise';
  trial_ends_at?: string;
  profile_image_url?: string;
  business_name?: string;
  business_type?: string;
  timezone?: string;
  language?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
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
  updated_at?: string;
  conversation_id?: string;
}

export interface Conversation {
  id: string;
  professional_id: string;
  client_id?: string;
  client_name?: string;
  client_phone: string;
  status: 'active' | 'completed' | 'archived';
  last_message?: string;
  created_at: string;
  updated_at: string;
  appointment_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'professional' | 'client' | 'system' | 'ai';
  sender_id?: string;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface Service {
  id: string;
  professional_id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price?: number;
  currency?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  professional_id: string;
  name?: string;
  phone: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  last_appointment?: string;
  appointment_count?: number;
}

export interface Stats {
  total_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  total_conversations: number;
  conversion_rate: number;
}
