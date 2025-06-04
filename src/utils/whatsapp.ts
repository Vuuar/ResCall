import { twilioClient } from '@/lib/twilio';

interface SendWhatsAppMessageParams {
  to: string;
  message: string;
  from?: string;
}

export async function sendWhatsAppMessage({
  to,
  message,
  from = process.env.TWILIO_PHONE_NUMBER
}: SendWhatsAppMessageParams): Promise<boolean> {
  try {
    // Normalize phone number
    const normalizedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const normalizedFrom = from?.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
    
    // Send message via Twilio
    await twilioClient.messages.create({
      body: message,
      from: normalizedFrom,
      to: normalizedTo,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// Function to send appointment confirmation
export async function sendAppointmentConfirmation(
  phone: string,
  professionalName: string,
  serviceName: string,
  dateTime: Date,
  from?: string
): Promise<boolean> {
  const formattedDate = dateTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  const formattedTime = dateTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const message = `
Votre rendez-vous a été confirmé!

📅 Date: ${formattedDate}
⏰ Heure: ${formattedTime}
👤 Professionnel: ${professionalName}
🔍 Service: ${serviceName}

Pour modifier ou annuler votre rendez-vous, veuillez nous contacter.
Merci de votre confiance!
  `.trim();
  
  return sendWhatsAppMessage({
    to: phone,
    message,
    from,
  });
}

// Function to send appointment reminder
export async function sendAppointmentReminder(
  phone: string,
  professionalName: string,
  serviceName: string,
  dateTime: Date,
  from?: string
): Promise<boolean> {
  const formattedDate = dateTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  
  const formattedTime = dateTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const message = `
Rappel: Vous avez un rendez-vous demain!

📅 Date: ${formattedDate}
⏰ Heure: ${formattedTime}
👤 Professionnel: ${professionalName}
🔍 Service: ${serviceName}

Pour modifier ou annuler votre rendez-vous, veuillez nous contacter.
  `.trim();
  
  return sendWhatsAppMessage({
    to: phone,
    message,
    from,
  });
}
