import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/utils/whatsapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // Handle GET request - Get appointment details
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (id, first_name, last_name, phone_number, email),
        services (id, name, duration, price, color)
      `)
      .eq('id', id)
      .eq('professional_id', user)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      return res.status(error.code === 'PGRST116' ? 404 : 500).json({ 
        error: error.code === 'PGRST116' ? 'Appointment not found' : 'Failed to fetch appointment' 
      });
    }

    return res.status(200).json(data);
  }

  // Handle PATCH request - Update appointment
  if (req.method === 'PATCH') {
    const {
      client_id,
      service_id,
      start_time,
      end_time,
      status,
      notes,
    } = req.body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (client_id !== undefined) updateData.client_id = client_id;
    if (service_id !== undefined) updateData.service_id = service_id;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updated_at = new Date().toISOString();

    // Update appointment
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .eq('professional_id', user)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return res.status(500).json({ error: 'Failed to update appointment' });
    }

    // If status changed to confirmed, send confirmation message
    if (status === 'confirmed') {
      // Get client and service details
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (id, first_name, last_name, phone_number),
          services (id, name)
        `)
        .eq('id', id)
        .single();

      const { data: professional } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', user)
        .single();

      // Send confirmation message
      if (appointment?.clients?.phone_number && professional?.phone_number) {
        await sendWhatsAppMessage({
          to: appointment.clients.phone_number,
          message: `Votre rendez-vous pour ${appointment.services.name} avec ${professional.first_name} ${professional.last_name} le ${new Date(appointment.start_time).toLocaleString('fr-FR')} a été confirmé.`,
          from: professional.phone_number
        });
      }
    }

    return res.status(200).json(data);
  }

  // Handle DELETE request - Cancel appointment
  if (req.method === 'DELETE') {
    // First get the appointment to check if it exists
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (id, first_name, last_name, phone_number),
        services (id, name)
      `)
      .eq('id', id)
      .eq('professional_id', user)
      .single();

    if (fetchError) {
      console.error('Error fetching appointment:', fetchError);
      return res.status(fetchError.code === 'PGRST116' ? 404 : 500).json({ 
        error: fetchError.code === 'PGRST116' ? 'Appointment not found' : 'Failed to fetch appointment' 
      });
    }

    // Update appointment status to cancelled instead of deleting
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('professional_id', user);

    if (error) {
      console.error('Error cancelling appointment:', error);
      return res.status(500).json({ error: 'Failed to cancel appointment' });
    }

    // Get professional details
    const { data: professional } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', user)
      .single();

    // Send cancellation message
    if (appointment?.clients?.phone_number && professional?.phone_number) {
      await sendWhatsAppMessage({
        to: appointment.clients.phone_number,
        message: `Votre rendez-vous pour ${appointment.services.name} avec ${professional.first_name} ${professional.last_name} le ${new Date(appointment.start_time).toLocaleString('fr-FR')} a été annulé.`,
        from: professional.phone_number
      });
    }

    return res.status(200).json({ success: true });
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
