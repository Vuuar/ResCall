import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { twilioClient } from '@/lib/twilio';
import { generateAppointmentResponse, transcribeAudio, extractAppointmentDetails } from '@/utils/ai';
import { addDuration, isTimeSlotAvailable } from '@/utils/date';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract WhatsApp message data from Twilio webhook
    const { Body, From, To, MediaUrl0, MediaContentType0 } = req.body;

    // Normalize phone number (remove WhatsApp: prefix and any formatting)
    const clientPhone = From.replace('whatsapp:', '').replace(/\D/g, '');
    const professionalPhone = To.replace('whatsapp:', '').replace(/\D/g, '');

    // Find the professional by WhatsApp number
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('*')
      .eq('whatsapp_number', professionalPhone)
      .single();

    if (professionalError || !professional) {
      console.error('Professional not found:', professionalError);
      return res.status(404).json({ error: 'Professional not found' });
    }

    // Get professional settings
    const { data: settings, error: settingsError } = await supabase
      .from('professional_settings')
      .select('*')
      .eq('professional_id', professional.id)
      .single();

    if (settingsError) {
      console.error('Settings not found:', settingsError);
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Find or create conversation
    let conversation;
    const { data: existingConversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('professional_id', professional.id)
      .eq('client_phone', clientPhone)
      .eq('status', 'active')
      .single();

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('Error fetching conversation:', conversationError);
      return res.status(500).json({ error: 'Error fetching conversation' });
    }

    if (existingConversation) {
      conversation = existingConversation;
    } else {
      // Create new conversation
      const { data: newConversation, error: newConversationError } = await supabase
        .from('conversations')
        .insert([
          {
            professional_id: professional.id,
            client_phone: clientPhone,
            messages: [],
            status: 'active',
          },
        ])
        .select()
        .single();

      if (newConversationError) {
        console.error('Error creating conversation:', newConversationError);
        return res.status(500).json({ error: 'Error creating conversation' });
      }

      conversation = newConversation;
    }

    // Process the message
    let messageContent = Body;
    let messageType = 'text';
    let voiceTranscript = null;

    // Handle voice messages
    if (MediaContentType0 && MediaContentType0.startsWith('audio/')) {
      messageType = 'voice';
      
      if (settings.voice_enabled) {
        // Transcribe audio using OpenAI Whisper
        voiceTranscript = await transcribeAudio(MediaUrl0);
        messageContent = voiceTranscript || 'Message vocal non transcrit';
      } else {
        messageContent = 'Message vocal reçu';
      }
    }

    // Save the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversation.id,
          content: messageContent,
          is_from_client: true,
          message_type: messageType,
          voice_transcript: voiceTranscript,
          voice_url: MediaUrl0 || null,
        },
      ])
      .select()
      .single();

    if (messageError) {
      console.error('Error saving message:', messageError);
      return res.status(500).json({ error: 'Error saving message' });
    }

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return res.status(500).json({ error: 'Error fetching messages' });
    }

    // Format conversation history for AI
    const conversationHistory = messages.map(msg => ({
      role: msg.is_from_client ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Get professional's availabilities
    const { data: availabilities, error: availabilitiesError } = await supabase
      .from('availabilities')
      .select('*')
      .eq('professional_id', professional.id);

    if (availabilitiesError) {
      console.error('Error fetching availabilities:', availabilitiesError);
      return res.status(500).json({ error: 'Error fetching availabilities' });
    }

    // Get professional's services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('professional_id', professional.id);

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      return res.status(500).json({ error: 'Error fetching services' });
    }

    // Get existing appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professional.id)
      .in('status', ['scheduled', 'confirmed']);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return res.status(500).json({ error: 'Error fetching appointments' });
    }

    // Generate AI response
    const aiResponse = await generateAppointmentResponse(
      messageContent,
      settings,
      availabilities,
      appointments,
      services,
      conversationHistory
    );

    // Save AI response
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversation.id,
          content: aiResponse,
          is_from_client: false,
          message_type: 'text',
        },
      ])
      .select()
      .single();

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
      return res.status(500).json({ error: 'Error saving AI message' });
    }

    // Update conversation with client name if we can extract it
    const allMessages = messages.map(m => m.content).concat([messageContent, aiResponse]);
    const extractedDetails = await extractAppointmentDetails(allMessages);
    
    if (extractedDetails.clientName && !conversation.client_name) {
      await supabase
        .from('conversations')
        .update({ client_name: extractedDetails.clientName })
        .eq('id', conversation.id);
    }

    // Check if we can create an appointment from the conversation
    if (
      extractedDetails.clientName &&
      extractedDetails.appointmentDate &&
      extractedDetails.appointmentTime &&
      extractedDetails.serviceType
    ) {
      // Find the service
      const service = services.find(s => 
        s.name.toLowerCase() === extractedDetails.serviceType?.toLowerCase()
      );
      
      if (service) {
        const startTime = new Date(`${extractedDetails.appointmentDate}T${extractedDetails.appointmentTime}`);
        const endTime = addDuration(startTime, service.duration);
        
        // Check if the time slot is available
        if (isTimeSlotAvailable(startTime, endTime, appointments)) {
          // Create appointment
          const { data: newAppointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert([
              {
                professional_id: professional.id,
                client_name: extractedDetails.clientName,
                client_phone: clientPhone,
                client_email: extractedDetails.clientPhone,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'scheduled',
                notes: extractedDetails.notes,
                service_type: extractedDetails.serviceType,
                conversation_id: conversation.id,
              },
            ])
            .select()
            .single();
            
          if (appointmentError) {
            console.error('Error creating appointment:', appointmentError);
          } else {
            // Link appointment to conversation
            await supabase
              .from('conversations')
              .update({ appointment_id: newAppointment.id })
              .eq('id', conversation.id);
          }
        }
      }
    }

    // Send response via Twilio
    await twilioClient.messages.create({
      body: aiResponse,
      from: `whatsapp:${professionalPhone}`,
      to: `whatsapp:${clientPhone}`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
