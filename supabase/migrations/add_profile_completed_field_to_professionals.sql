/*
  # Add profile_completed field to professionals table

  1. Changes
    - Add `profile_completed` boolean field to professionals table with default value of false
    - This field will be used to track whether a professional has completed their profile setup

  2. Purpose
    - Enable profile completion workflow
    - Allow redirecting professionals to complete their profile if needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE professionals ADD COLUMN profile_completed BOOLEAN DEFAULT false;
  END IF;
END $$;
