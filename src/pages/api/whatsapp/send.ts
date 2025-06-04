import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/utils/whatsapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the user ID from the session
  const user = req.headers['x-user-id'] as string;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { to, message, conversationId } = req.body;

  // Validate required fields
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get professional's phone number if not provided
    let from = req.body.from;
    if (!from) {
      const { data: professional, error } = await supabase
        .from('professionals')
        .select('phone_number')
        .eq('id', user)
        .single();

      if (error || !professional?.phone_number) {
        return res.status(400).json({ error: 'Professional phone number not found' });
      }

      from = professional.phone_number;
    }

    // Send message
    const success = await sendWhatsAppMessage({
      to,
      message,
      from,
    });

    if (!success) {
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // If conversationId is provided, save the message to the database
    if (conversationId) {
      const { error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content: message,
            is_from_client: false,
            message_type: 'text',
          },
        ]);

      if (messageError) {
        console.error('Error saving message:', messageError);
        // Continue even if saving to DB fails
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
