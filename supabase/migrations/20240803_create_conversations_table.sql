/*
  # Create conversations table

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, references professionals.id)
      - `client_id` (uuid, optional)
      - `client_name` (text, optional)
      - `client_phone` (text)
      - `status` (text) - active, completed, archived
      - `last_message` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `appointment_id` (uuid, optional)
  2. Security
    - Enable RLS on `conversations` table
    - Add policy for professionals to read/update their own conversations
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) NOT NULL,
  client_id uuid,
  client_name text,
  client_phone text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  last_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  appointment_id uuid
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for professionals to read their own conversations
CREATE POLICY "Professionals can read their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = professional_id);

-- Create policy for professionals to insert their own conversations
CREATE POLICY "Professionals can insert their own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = professional_id);

-- Create policy for professionals to update their own conversations
CREATE POLICY "Professionals can update their own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = professional_id);

-- Create policy for professionals to delete their own conversations
CREATE POLICY "Professionals can delete their own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = professional_id);
