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
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('professional_id', user);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return res.status(500).json({ error: 'Failed to update appointment' });
    }

    // Send cancellation message
    if (appointment.clients?.phone_number) {
      const formattedDate = new Date(appointment.start_time).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      const formattedTime = new Date(appointment.start_time).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      
      const message = `
Votre rendez-vous a été annulé.

📅 Date: ${formattedDate}
⏰ Heure: ${formattedTime}
👤 Professionnel: ${professional.first_name} ${professional.last_name}
🔍 Service: ${appointment.services?.name || 'Service'}

Pour toute question, veuillez nous contacter.
      `.trim();
      
      const success = await sendWhatsAppMessage({
        to: appointment.clients.phone_number,
        message,
        from: professional.phone_number,
      });

      if (!success) {
        console.error('Error sending cancellation message');
        // Continue even if sending message fails
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
