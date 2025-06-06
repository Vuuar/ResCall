import { supabase } from '@/lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';
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

  const { to, message } = req.body;

  // Validate required fields
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get professional's phone number
    const { data: professional, error } = await supabase
      .from('professionals')
      .select('phone_number')
      .eq('id', user)
      .single();

    if (error || !professional?.phone_number) {
      return res.status(400).json({ error: 'Professional phone number not found' });
    }

    // Send test message
    const success = await sendWhatsAppMessage({
      to,
      message,
      from: professional.phone_number
    });

    if (success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    console.error('Error sending test message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
