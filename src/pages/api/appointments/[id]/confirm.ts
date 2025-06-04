import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sendAppointmentConfirmation } from '@/utils/whatsapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the user ID from the session
  const user = req.headers['x-user-id'] as string;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get appointment ID from the URL
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }

  try {
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (id, first_name, last_name, phone_number),
        services (id, name)
      `)
      .eq('id', id)
      .eq('professional_id', user)
      .single();

    if (appointmentError) {
      console.error('Error fetching appointment:', appointmentError);
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Get professional details
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', user)
      .single();

    if (professionalError) {
      console.error('Error fetching professional:', professionalError);
      return res.status(404).json({ error: 'Professional not found' });
    }

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('professional_id', user);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return res.status(500).json({ error: 'Failed to update appointment' });
    }

    // Send confirmation message
    if (appointment.clients?.phone_number) {
      const success = await sendAppointmentConfirmation(
        appointment.clients.phone_number,
        `${professional.first_name} ${professional.last_name}`,
        appointment.services?.name || 'Service',
        new Date(appointment.start_time),
        professional.phone_number
      );

      if (!success) {
        console.error('Error sending confirmation message');
        // Continue even if sending message fails
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
