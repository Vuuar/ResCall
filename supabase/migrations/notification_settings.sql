/*
  # Create notification settings table

  1. New Tables
    - `notification_settings`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, foreign key to professionals)
      - `email_new_appointment` (boolean)
      - `email_appointment_reminder` (boolean)
      - `email_appointment_cancelled` (boolean)
      - `whatsapp_new_appointment` (boolean)
      - `whatsapp_appointment_reminder` (boolean)
      - `whatsapp_appointment_cancelled` (boolean)
      - `sms_new_appointment` (boolean)
      - `sms_appointment_reminder` (boolean)
      - `sms_appointment_cancelled` (boolean)
      - `reminder_time` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `notification_settings` table
    - Add policy for authenticated users to manage their own notification settings
*/

CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  email_new_appointment boolean DEFAULT true,
  email_appointment_reminder boolean DEFAULT true,
  email_appointment_cancelled boolean DEFAULT true,
  whatsapp_new_appointment boolean DEFAULT true,
  whatsapp_appointment_reminder boolean DEFAULT true,
  whatsapp_appointment_cancelled boolean DEFAULT true,
  sms_new_appointment boolean DEFAULT false,
  sms_appointment_reminder boolean DEFAULT false,
  sms_appointment_cancelled boolean DEFAULT false,
  reminder_time text DEFAULT '24',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification settings"
  ON notification_settings
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings
  FOR UPDATE
  USING (auth.uid() = professional_id);
