/*
  # Create time_off table

  1. New Tables
    - `time_off`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, foreign key to professionals.id)
      - `title` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `all_day` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `time_off` table
    - Add policies for authenticated users to manage their own time off periods
*/

CREATE TABLE IF NOT EXISTS time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  title text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own time_off"
  ON time_off
  FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Users can insert own time_off"
  ON time_off
  FOR INSERT
  TO authenticated
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Users can update own time_off"
  ON time_off
  FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Users can delete own time_off"
  ON time_off
  FOR DELETE
  TO authenticated
  USING (professional_id = auth.uid());
