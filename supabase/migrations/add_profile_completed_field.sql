/*
  # Add profile_completed field to users table

  1. Changes
    - Add `profile_completed` boolean field to users table with default value of false
    - This field will be used to track whether a user has completed their profile setup

  2. Purpose
    - Enable profile completion workflow
    - Allow redirecting users to complete their profile if needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT false;
  END IF;
END $$;
