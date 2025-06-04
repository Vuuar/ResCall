import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to transcribe audio using OpenAI Whisper
export async function transcribeAudio(audioUrl: string): Promise<string | null> {
  try {
    // Download the audio file
    const response = await fetch(audioUrl);
    const audioBlob = await response.blob();
    
    // Convert blob to file
    const file = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    
    // Make request to OpenAI API
    const transcription = await openai.audio.transcriptions.create({
      file: file as any,
      model: 'whisper-1',
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return null;
  }
}

// Function to generate AI response for appointment booking
export async function generateAppointmentResponse(
  message: string,
  settings: any,
  availabilities: any[],
  appointments: any[],
  services: any[],
  conversationHistory: any[]
): Promise<string> {
  try {
    // Format the professional's services
    const servicesText = services.map(service => 
      `- ${service.name}: ${service.duration} minutes, ${(service.price / 100).toFixed(2)}€`
    ).join('\n');
    
    // Format the professional's working hours
    const availabilitiesText = availabilities.map(avail => {
      const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][avail.day_of_week];
      return `- ${day}: ${avail.start_time} - ${avail.end_time}`;
    }).join('\n');
    
    // Create system message with context
    const systemMessage = `
      You are an AI assistant for a professional who offers services and appointments.
      
      Available services:
      ${servicesText}
      
      Working hours:
      ${availabilitiesText}
      
      Your task is to help clients book appointments by understanding their needs and suggesting available time slots.
      Be friendly, professional, and helpful. If the client asks about services, provide information about them.
      If they want to book an appointment, ask for their preferred date, time, and service.
      
      Always respond in the same language as the client's message.
    `;
    
    // Create the completion request
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content || "Je n'ai pas pu générer une réponse. Veuillez réessayer.";
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.";
  }
}

// Function to extract appointment details from conversation
export async function extractAppointmentDetails(messages: string[]): Promise<{
  clientName?: string;
  clientPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  serviceType?: string;
  notes?: string;
}> {
  try {
    // Join all messages into a single text
    const conversationText = messages.join('\n');
    
    // Create the completion request
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `
            Extract appointment details from the following conversation.
            Return a JSON object with the following fields if they are present:
            - clientName: The client's full name
            - clientPhone: The client's phone number
            - appointmentDate: The appointment date in YYYY-MM-DD format
            - appointmentTime: The appointment time in HH:MM format (24-hour)
            - serviceType: The type of service requested
            - notes: Any additional notes about the appointment
            
            If a field is not present in the conversation, do not include it in the JSON.
            Only extract information that is clearly stated in the conversation.
          `
        },
        { role: 'user', content: conversationText }
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0].message.content;
    if (!content) return {};
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error extracting appointment details:', error);
    return {};
  }
}
