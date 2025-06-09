/*
  # Initial Schema Setup

  1. New Tables
    - `availability_schedule` - Stores weekly availability for professionals
    - `time_offs` - Stores time off periods for professionals
    - `services` - Stores service offerings for professionals
    - `clients` - Stores client information
    - `professional_settings` - Stores professional settings for messaging and scheduling
    - `subscriptions` - Stores subscription information
    - `invoices` - Stores invoice information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Availability Schedule Table
CREATE TABLE IF NOT EXISTS availability_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time,
  end_time time,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (professional_id, day_of_week)
);

ALTER TABLE availability_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own availability"
  ON availability_schedule
  USING (auth.uid() = professional_id);

-- Time Offs Table
CREATE TABLE IF NOT EXISTS time_offs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE time_offs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own time offs"
  ON time_offs
  USING (auth.uid() = professional_id);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  duration integer NOT NULL, -- in minutes
  price numeric(10, 2),
  color text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own services"
  ON services
  USING (auth.uid() = professional_id);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  appointment_count integer DEFAULT 0,
  last_appointment timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (professional_id, phone)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own clients"
  ON clients
  USING (auth.uid() = professional_id);

-- Professional Settings Table
CREATE TABLE IF NOT EXISTS professional_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  welcome_message text NOT NULL,
  confirmation_message text NOT NULL,
  reminder_message text NOT NULL,
  reminder_time integer NOT NULL DEFAULT 24, -- in hours
  voice_enabled boolean DEFAULT false,
  voice_greeting text,
  appointment_buffer integer DEFAULT 15, -- in minutes
  calendar_integration text DEFAULT 'none',
  calendar_sync_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (professional_id)
);

ALTER TABLE professional_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON professional_settings
  USING (auth.uid() = professional_id);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL CHECK (tier IN ('basic', 'pro', 'premium')),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  USING (auth.uid() = professional_id);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'open', 'void')),
  invoice_url text,
  invoice_pdf text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
  ON invoices
  USING (auth.uid() = professional_id);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_phone text NOT NULL,
  client_name text,
  status text NOT NULL CHECK (status IN ('active', 'closed')),
  last_message text,
  appointment_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations"
  ON conversations
  USING (auth.uid() = professional_id);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'voice')),
  voice_url text,
  voice_transcript text,
  direction text NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations"
  ON messages
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE professional_id = auth.uid()
    )
  );

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  service_type text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own appointments"
  ON appointments
  USING (auth.uid() = professional_id);

-- Users Table Extension
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free_trial';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
