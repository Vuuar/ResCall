/*
  # Create calendar integrations table

  1. New Tables
    - `calendar_integrations`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, foreign key to professionals)
      - `provider` (text)
      - `google_calendar_connected` (boolean)
      - `outlook_calendar_connected` (boolean)
      - `calendly_connected` (boolean)
      - `calendly_url` (text)
      - `sync_two_way` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `calendar_integrations` table
    - Add policy for authenticated users to manage their own calendar integrations
*/

CREATE TABLE IF NOT EXISTS calendar_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  provider text DEFAULT 'none',
  google_calendar_connected boolean DEFAULT false,
  outlook_calendar_connected boolean DEFAULT false,
  calendly_connected boolean DEFAULT false,
  calendly_url text,
  sync_two_way boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar integrations"
  ON calendar_integrations
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can insert their own calendar integrations"
  ON calendar_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can update their own calendar integrations"
  ON calendar_integrations
  FOR UPDATE
  USING (auth.uid() = professional_id);
