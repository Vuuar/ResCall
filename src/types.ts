export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    appointments: number;
    services: number;
    staff: number;
    voice_messages: boolean;
    calendar_integration: boolean;
    analytics: boolean;
  };
  recommended?: boolean; // <-- propriété optionnelle ajoutée
}


export interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  subscription_tier?: string;
  trial_ends_at?: string;
  business_name?: string;
  stripe_customer_id?: string;
  subscription_status?: string; // <-- Ajoute cette ligne
  // autres propriétés selon besoin
}


export interface Appointment {
  id: string;
  client_name: string;
  client_phone?: string; // <-- Ajoute cette ligne
  services?: { name: string; color: string }[];
  service_type?: string;
  start_time: string | Date;
  end_time: string | Date;
  status: string;
  // autres propriétés selon besoin
}

export interface Conversation {
  id: string;
  client_name: string;
  client_phone?: string;
  updated_at?: string;
  appointment_id?: string;
  created_at?: string; // <-- Cette ligne doit être présente
  messages?: { content: string; sender: 'client' | 'professional'; timestamp: string }[];
  status?: string;
}

export interface Stats {
  total_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  total_conversations: number;
  conversion_rate: number;
  // autres propriétés selon besoin
}

export interface ProfessionalSettings {
  id: string;
  company_name?: string;
  phone_number?: string;
  address?: string;
  welcome_message?: string;
  confirmation_message?: string;
  reminder_message?: string;
  reminder_time?: number;
  voice_enabled?: boolean;      // <-- Ajoute cette ligne
  voice_greeting?: string;      // <-- Ajoute cette ligne
  appointment_buffer?: number;  // <-- Ajoute cette ligne
  updated_at?: string;          // <-- Ajoute cette ligne si besoin
  // autres propriétés selon besoin
}





