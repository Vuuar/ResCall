import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the user ID from the session
  const user = req.headers['x-user-id'] as string;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle GET request - Get available slots
  if (req.method === 'GET') {
    const { start_date, end_date, service_id } = req.query;
    
    // Validate required parameters
    if (!start_date || !end_date || !service_id || 
        Array.isArray(start_date) || Array.isArray(end_date) || Array.isArray(service_id)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Call the database function to get available slots
    const { data, error } = await supabase.rpc('get_available_slots', {
      p_professional_id: user,
      p_date_start: start_date,
      p_date_end: end_date,
      p_service_id: service_id
    });

    if (error) {
      console.error('Error fetching available slots:', error);
      return res.status(500).json({ error: 'Failed to fetch available slots' });
    }

    return res.status(200).json(data);
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
