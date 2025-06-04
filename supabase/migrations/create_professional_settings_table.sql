/*
  # Create professional settings table

  1. New Tables
    - `professional_settings`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, foreign key to professionals.id)
      - `welcome_message` (text)
      - `confirmation_message` (text)
      - `reminder_message` (text)
      - `reminder_time` (integer)
      - `voice_enabled` (boolean)
      - `voice_greeting` (text)
      - `appointment_buffer` (integer)
      - `calendar_integration` (text)
      - `calendar_sync_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `professional_settings` table
    - Add policy for authenticated users to read/update their own settings
*/

CREATE TABLE IF NOT EXISTS professional_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  welcome_message text NOT NULL,
  confirmation_message text NOT NULL,
  reminder_message text NOT NULL,
  reminder_time integer NOT NULL DEFAULT 24,
  voice_enabled boolean NOT NULL DEFAULT false,
  voice_greeting text,
  appointment_buffer integer NOT NULL DEFAULT 15,
  calendar_integration text NOT NULL DEFAULT 'none',
  calendar_sync_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE professional_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON professional_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can update own settings"
  ON professional_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can insert own settings"
  ON professional_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = professional_id);
