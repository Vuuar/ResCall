/*
  # Create professional_settings table

  1. New Tables
    - `professional_settings`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, foreign key to professionals.id)
      - `timezone` (text)
      - `appointment_buffer` (integer) - in minutes
      - `notification_preferences` (jsonb)
      - `booking_window_days` (integer) - how far in advance clients can book
      - `cancellation_policy` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `professional_settings` table
    - Add policies for authenticated users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS professional_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  timezone text NOT NULL DEFAULT 'UTC',
  appointment_buffer integer NOT NULL DEFAULT 15,
  notification_preferences jsonb NOT NULL DEFAULT '{"email": true, "sms": false, "whatsapp": true}'::jsonb,
  booking_window_days integer NOT NULL DEFAULT 30,
  cancellation_policy text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_professional_settings UNIQUE (professional_id)
);

ALTER TABLE professional_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own professional_settings"
  ON professional_settings
  FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Users can insert own professional_settings"
  ON professional_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Users can update own professional_settings"
  ON professional_settings
  FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Users can delete own professional_settings"
  ON professional_settings
  FOR DELETE
  TO authenticated
  USING (professional_id = auth.uid());
