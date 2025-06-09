export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  professional_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  professional_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}
