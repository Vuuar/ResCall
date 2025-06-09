/*
  # Create professionals table

  1. New Tables
    - `professionals`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `full_name` (text)
      - `phone` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `subscription_tier` (text)
      - `trial_ends_at` (timestamptz)
      - `profile_image_url` (text)
      - `business_name` (text)
      - `business_type` (text)
      - `timezone` (text)
      - `language` (text)
      - `address` (text)
      - `city` (text)
      - `country` (text)
      - `postal_code` (text)
  2. Security
    - Enable RLS on `professionals` table
    - Add policy for professionals to read/update their own data
*/

CREATE TABLE IF NOT EXISTS professionals (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  subscription_tier text DEFAULT 'free_trial',
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  profile_image_url text,
  business_name text,
  business_type text,
  timezone text DEFAULT 'Europe/Paris',
  language text DEFAULT 'fr',
  address text,
  city text,
  country text,
  postal_code text
);

-- Enable Row Level Security
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read their own data"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own data"
  ON professionals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
