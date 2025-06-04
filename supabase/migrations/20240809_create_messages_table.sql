/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations.id)
      - `direction` (text) - 'inbound', 'outbound'
      - `content` (text)
      - `content_type` (text) - 'text', 'voice', 'image'
      - `media_url` (text, nullable) - for voice messages or images
      - `sent_at` (timestamptz)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `messages` table
    - Add policies for authenticated users to manage their own messages
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('text', 'voice', 'image')),
  media_url text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- We need to join with conversations to check professional_id
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.professional_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.professional_id = auth.uid()
    )
  );

-- No update policy as messages should not be modified after creation

-- Delete policy for cleanup purposes
CREATE POLICY "Users can delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.professional_id = auth.uid()
    )
  );
