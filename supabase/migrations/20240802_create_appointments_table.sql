/*
  # Create appointments table

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, references professionals.id)
      - `client_id` (uuid, optional)
      - `client_name` (text)
      - `client_phone` (text)
      - `client_email` (text, optional)
      - `service_id` (uuid, optional)
      - `service_name` (text, optional)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `status` (text) - pending, confirmed, cancelled, completed, no_show
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `conversation_id` (uuid, optional)
  2. Security
    - Enable RLS on `appointments` table
    - Add policy for professionals to read/update their own appointments
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) NOT NULL,
  client_id uuid,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  service_id uuid,
  service_name text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  conversation_id uuid
);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy for professionals to read their own appointments
CREATE POLICY "Professionals can read their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = professional_id);

-- Create policy for professionals to insert their own appointments
CREATE POLICY "Professionals can insert their own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = professional_id);

-- Create policy for professionals to update their own appointments
CREATE POLICY "Professionals can update their own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = professional_id);

-- Create policy for professionals to delete their own appointments
CREATE POLICY "Professionals can delete their own appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = professional_id);