import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { twilioClient } from '@/lib/twilio';
import { formatDate } from '@/utils/date';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API key for security (you should implement this)
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all confirmed appointments that need reminders
    const now = new Date();
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (
          whatsapp_number
        ),
        settings:professionals!inner (
          professional_settings (
            reminder_message,
            reminder_time
          )
        )
      `)
      .eq('status', 'confirmed');

    if (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: 'Error fetching appointments' });
    }

    const remindersToSend = [];

    for (const appointment of appointments) {
      const reminderTime = appointment.settings.professional_settings[0]?.reminder_time || 24;
      const appointmentTime = new Date(appointment.start_time);
      
      // Calculate when the reminder should be sent
      const reminderDate = new Date(appointmentTime);
      reminderDate.setHours(reminderDate.getHours() - reminderTime);
      
      // Check if it's time to send the reminder (within the last hour)
      const hourAgo = new Date(now);
      hourAgo.setHours(hourAgo.getHours() - 1);
      
      if (reminderDate > hourAgo && reminderDate <= now) {
        remindersToSend.push(appointment);
      }
    }

    // Send reminders
    const results = await Promise.all(
      remindersToSend.map(async (appointment) => {
        try {
          const reminderTemplate = appointment.settings.professional_settings[0]?.reminder_message || 
            `Rappel : Vous avez rendez-vous demain à {time}.`;
          
          const reminderMessage = reminderTemplate
            .replace('{date}', formatDate(appointment.start_time, 'PPP'))
            .replace('{time}', formatDate(appointment.start_time, 'HH:mm'));
          
          await twilioClient.messages.create({
            body: reminderMessage,
            from: `whatsapp:${appointment.professionals.whatsapp_number}`,
            to: `whatsapp:${appointment.client_phone}`,
          });
          
          return { id: appointment.id, success: true };
        } catch (error) {
          console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
          return { id: appointment.id, success: false, error };
        }
      })
    );

    return res.status(200).json({ 
      success: true, 
      remindersSent: results.filter(r => r.success).length,
      remindersTotal: remindersToSend.length,
      results 
    });
  } catch (error) {
    console.error('Reminder error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
