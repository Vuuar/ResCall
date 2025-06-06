"use strict";
(() => {
var exports = {};
exports.id = 625;
exports.ids = [625];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 4146:
/***/ ((module) => {

module.exports = require("date-fns");

/***/ }),

/***/ 7202:
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),

/***/ 2079:
/***/ ((module) => {

module.exports = import("openai");;

/***/ }),

/***/ 9901:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5650);
/* harmony import */ var _lib_twilio__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(393);
/* harmony import */ var _utils_ai__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3396);
/* harmony import */ var _utils_date__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4506);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_utils_ai__WEBPACK_IMPORTED_MODULE_2__]);
_utils_ai__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];




async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        // Extract WhatsApp message data from Twilio webhook
        const { Body, From, To, MediaUrl0, MediaContentType0 } = req.body;
        // Normalize phone number (remove WhatsApp: prefix and any formatting)
        const clientPhone = From.replace("whatsapp:", "").replace(/\D/g, "");
        const professionalPhone = To.replace("whatsapp:", "").replace(/\D/g, "");
        // Find the professional by WhatsApp number
        const { data: professional, error: professionalError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("professionals").select("*").eq("whatsapp_number", professionalPhone).single();
        if (professionalError || !professional) {
            console.error("Professional not found:", professionalError);
            return res.status(404).json({
                error: "Professional not found"
            });
        }
        // Get professional settings
        const { data: settings, error: settingsError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("professional_settings").select("*").eq("professional_id", professional.id).single();
        if (settingsError) {
            console.error("Settings not found:", settingsError);
            return res.status(404).json({
                error: "Settings not found"
            });
        }
        // Find or create conversation
        let conversation;
        const { data: existingConversation, error: conversationError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("conversations").select("*").eq("professional_id", professional.id).eq("client_phone", clientPhone).eq("status", "active").single();
        if (conversationError && conversationError.code !== "PGRST116") {
            console.error("Error fetching conversation:", conversationError);
            return res.status(500).json({
                error: "Error fetching conversation"
            });
        }
        if (existingConversation) {
            conversation = existingConversation;
        } else {
            // Create new conversation
            const { data: newConversation, error: newConversationError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("conversations").insert([
                {
                    professional_id: professional.id,
                    client_phone: clientPhone,
                    messages: [],
                    status: "active"
                }
            ]).select().single();
            if (newConversationError) {
                console.error("Error creating conversation:", newConversationError);
                return res.status(500).json({
                    error: "Error creating conversation"
                });
            }
            conversation = newConversation;
        }
        // Process the message
        let messageContent = Body;
        let messageType = "text";
        let voiceTranscript = null;
        // Handle voice messages
        if (MediaContentType0 && MediaContentType0.startsWith("audio/")) {
            messageType = "voice";
            if (settings.voice_enabled) {
                // Transcribe audio using OpenAI Whisper
                voiceTranscript = await (0,_utils_ai__WEBPACK_IMPORTED_MODULE_2__/* .transcribeAudio */ .KR)(MediaUrl0);
                messageContent = voiceTranscript || "Message vocal non transcrit";
            } else {
                messageContent = "Message vocal re\xe7u";
            }
        }
        // Save the message
        const { data: message, error: messageError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("messages").insert([
            {
                conversation_id: conversation.id,
                content: messageContent,
                is_from_client: true,
                message_type: messageType,
                voice_transcript: voiceTranscript,
                voice_url: MediaUrl0 || null
            }
        ]).select().single();
        if (messageError) {
            console.error("Error saving message:", messageError);
            return res.status(500).json({
                error: "Error saving message"
            });
        }
        // Get conversation history
        const { data: messages, error: messagesError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("messages").select("*").eq("conversation_id", conversation.id).order("created_at", {
            ascending: true
        });
        if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            return res.status(500).json({
                error: "Error fetching messages"
            });
        }
        // Format conversation history for AI
        const conversationHistory = messages.map((msg)=>({
                role: msg.is_from_client ? "user" : "assistant",
                content: msg.content
            }));
        // Get professional's availabilities
        const { data: availabilities, error: availabilitiesError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("availabilities").select("*").eq("professional_id", professional.id);
        if (availabilitiesError) {
            console.error("Error fetching availabilities:", availabilitiesError);
            return res.status(500).json({
                error: "Error fetching availabilities"
            });
        }
        // Get professional's services
        const { data: services, error: servicesError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("services").select("*").eq("professional_id", professional.id);
        if (servicesError) {
            console.error("Error fetching services:", servicesError);
            return res.status(500).json({
                error: "Error fetching services"
            });
        }
        // Get existing appointments
        const { data: appointments, error: appointmentsError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select("*").eq("professional_id", professional.id).in("status", [
            "scheduled",
            "confirmed"
        ]);
        if (appointmentsError) {
            console.error("Error fetching appointments:", appointmentsError);
            return res.status(500).json({
                error: "Error fetching appointments"
            });
        }
        // Generate AI response
        const aiResponse = await (0,_utils_ai__WEBPACK_IMPORTED_MODULE_2__/* .generateAppointmentResponse */ .z)(messageContent, settings, availabilities, appointments, services, conversationHistory);
        // Save AI response
        const { data: aiMessage, error: aiMessageError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("messages").insert([
            {
                conversation_id: conversation.id,
                content: aiResponse,
                is_from_client: false,
                message_type: "text"
            }
        ]).select().single();
        if (aiMessageError) {
            console.error("Error saving AI message:", aiMessageError);
            return res.status(500).json({
                error: "Error saving AI message"
            });
        }
        // Update conversation with client name if we can extract it
        const allMessages = messages.map((m)=>m.content).concat([
            messageContent,
            aiResponse
        ]);
        const extractedDetails = await (0,_utils_ai__WEBPACK_IMPORTED_MODULE_2__/* .extractAppointmentDetails */ .Rs)(allMessages);
        if (extractedDetails.clientName && !conversation.client_name) {
            await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("conversations").update({
                client_name: extractedDetails.clientName
            }).eq("id", conversation.id);
        }
        // Check if we can create an appointment from the conversation
        if (extractedDetails.clientName && extractedDetails.appointmentDate && extractedDetails.appointmentTime && extractedDetails.serviceType) {
            // Find the service
            const service = services.find((s)=>s.name.toLowerCase() === extractedDetails.serviceType?.toLowerCase());
            if (service) {
                const startTime = new Date(`${extractedDetails.appointmentDate}T${extractedDetails.appointmentTime}`);
                const endTime = (0,_utils_date__WEBPACK_IMPORTED_MODULE_3__/* .addDuration */ .WK)(startTime, service.duration);
                // Check if the time slot is available
                if ((0,_utils_date__WEBPACK_IMPORTED_MODULE_3__/* .isTimeSlotAvailable */ .Ej)(startTime, endTime, appointments)) {
                    // Create appointment
                    const { data: newAppointment, error: appointmentError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").insert([
                        {
                            professional_id: professional.id,
                            client_name: extractedDetails.clientName,
                            client_phone: clientPhone,
                            client_email: extractedDetails.clientPhone,
                            start_time: startTime.toISOString(),
                            end_time: endTime.toISOString(),
                            status: "scheduled",
                            notes: extractedDetails.notes,
                            service_type: extractedDetails.serviceType,
                            conversation_id: conversation.id
                        }
                    ]).select().single();
                    if (appointmentError) {
                        console.error("Error creating appointment:", appointmentError);
                    } else {
                        // Link appointment to conversation
                        await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("conversations").update({
                            appointment_id: newAppointment.id
                        }).eq("id", conversation.id);
                    }
                }
            }
        }
        // Send response via Twilio
        await _lib_twilio__WEBPACK_IMPORTED_MODULE_1__/* .twilioClient */ .h.messages.create({
            body: aiResponse,
            from: `whatsapp:${professionalPhone}`,
            to: `whatsapp:${clientPhone}`
        });
        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 3396:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KR: () => (/* binding */ transcribeAudio),
/* harmony export */   Rs: () => (/* binding */ extractAppointmentDetails),
/* harmony export */   z: () => (/* binding */ generateAppointmentResponse)
/* harmony export */ });
/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2079);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([openai__WEBPACK_IMPORTED_MODULE_0__]);
openai__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const openai = new openai__WEBPACK_IMPORTED_MODULE_0__.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
// Function to transcribe audio using OpenAI Whisper
async function transcribeAudio(audioUrl) {
    try {
        // Download the audio file
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        // Convert blob to file
        const file = new File([
            audioBlob
        ], "audio.ogg", {
            type: "audio/ogg"
        });
        // Create a FormData object
        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", "whisper-1");
        // Make request to OpenAI API
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1"
        });
        return transcription.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return null;
    }
}
// Function to generate AI response for appointment booking
async function generateAppointmentResponse(message, settings, availabilities, appointments, services, conversationHistory) {
    try {
        // Format the professional's services
        const servicesText = services.map((service)=>`- ${service.name}: ${service.duration} minutes, ${(service.price / 100).toFixed(2)}€`).join("\n");
        // Format the professional's working hours
        const availabilitiesText = availabilities.map((avail)=>{
            const day = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ][avail.day_of_week];
            return `- ${day}: ${avail.start_time} - ${avail.end_time}`;
        }).join("\n");
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
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemMessage
                },
                ...conversationHistory,
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        return response.choices[0].message.content || "Je n'ai pas pu g\xe9n\xe9rer une r\xe9ponse. Veuillez r\xe9essayer.";
    } catch (error) {
        console.error("Error generating AI response:", error);
        return "D\xe9sol\xe9, je n'ai pas pu traiter votre demande. Veuillez r\xe9essayer plus tard.";
    }
}
// Function to extract appointment details from conversation
async function extractAppointmentDetails(messages) {
    try {
        // Join all messages into a single text
        const conversationText = messages.join("\n");
        // Create the completion request
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
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
                {
                    role: "user",
                    content: conversationText
                }
            ],
            temperature: 0,
            response_format: {
                type: "json_object"
            }
        });
        const content = response.choices[0].message.content;
        if (!content) return {};
        return JSON.parse(content);
    } catch (error) {
        console.error("Error extracting appointment details:", error);
        return {};
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [668], () => (__webpack_exec__(9901)));
module.exports = __webpack_exports__;

})();