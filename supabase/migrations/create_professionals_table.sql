/*
  # Create professionals table

  1. New Tables
    - `professionals`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `business_name` (text)
      - `phone_number` (text)
      - `subscription_tier` (text, nullable)
      - `subscription_status` (text, nullable)
      - `trial_ends_at` (timestamptz, nullable)
      - `stripe_customer_id` (text, nullable)
      - `stripe_subscription_id` (text, nullable)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `professionals` table
    - Add policy for authenticated users to read/update their own data
*/

CREATE TABLE IF NOT EXISTS professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  business_name text NOT NULL,
  phone_number text,
  subscription_tier text,
  subscription_status text,
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON professionals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
