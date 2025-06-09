/*
  # Create voice settings table

  1. New Tables
    - `voice_settings`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, foreign key to professionals)
      - `welcome_message` (text)
      - `use_tts` (boolean)
      - `voice_type` (text)
      - `custom_audio_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `voice_settings` table
    - Add policy for authenticated users to manage their own voice settings
*/

CREATE TABLE IF NOT EXISTS voice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  welcome_message text,
  use_tts boolean DEFAULT true,
  voice_type text DEFAULT 'female',
  custom_audio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE voice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own voice settings"
  ON voice_settings
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can insert their own voice settings"
  ON voice_settings
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can update their own voice settings"
  ON voice_settings
  FOR UPDATE
  USING (auth.uid() = professional_id);
