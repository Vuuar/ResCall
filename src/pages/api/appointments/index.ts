import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sendAppointmentConfirmation } from '@/utils/whatsapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the user ID from the session
  const user = req.headers['x-user-id'] as string;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle GET request - List appointments
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (id, first_name, last_name, phone_number, email),
        services (id, name, duration, price, color)
      `)
      .eq('professional_id', user)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }

    return res.status(200).json(data);
  }

  // Handle POST request - Create appointment
  if (req.method === 'POST') {
    const {
      client_id,
      service_id,
      start_time,
      end_time,
      status = 'scheduled',
      notes,
    } = req.body;

    // Validate required fields
    if (!client_id || !service_id || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          professional_id: user,
          client_id,
          service_id,
          start_time,
          end_time,
          status,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({ error: 'Failed to create appointment' });
    }

    // Get client and service details for confirmation message
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single();

    const { data: professional } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', user)
      .single();

    // Send confirmation message if client has phone number
    if (client?.phone_number && professional?.phone_number) {
      await sendAppointmentConfirmation(
        client.phone_number,
        `${professional.first_name} ${professional.last_name}`,
        service?.name || 'Service',
        new Date(start_time),
        professional.phone_number
      );
    }

    return res.status(201).json(data);
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
