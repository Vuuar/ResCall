"use strict";
exports.id = 23;
exports.ids = [23];
exports.modules = {

/***/ 5650:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   O: () => (/* binding */ supabase)
/* harmony export */ });
/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2885);
/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);

const supabaseUrl = "https://xzzmuxvgwprcmwhzmkbi.supabase.co" || 0;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6em11eHZnd3ByY213aHpta2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjcxNDUsImV4cCI6MjA2NDQ0MzE0NX0.5n_ap7CpCKx7BWvnaCRiLB4dz_RaR6zEz1_9oCoQ6ho" || 0;
const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);


/***/ }),

/***/ 393:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ twilioClient)
/* harmony export */ });
/* harmony import */ var twilio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7202);
/* harmony import */ var twilio__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(twilio__WEBPACK_IMPORTED_MODULE_0__);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio__WEBPACK_IMPORTED_MODULE_0___default()(accountSid, authToken);


/***/ }),

/***/ 7772:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   U3: () => (/* binding */ sendWhatsAppMessage),
/* harmony export */   pv: () => (/* binding */ sendAppointmentReminder),
/* harmony export */   sl: () => (/* binding */ sendAppointmentConfirmation)
/* harmony export */ });
/* harmony import */ var _lib_twilio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(393);

async function sendWhatsAppMessage({ to, message, from = process.env.TWILIO_PHONE_NUMBER }) {
    try {
        // Normalize phone number
        const normalizedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
        const normalizedFrom = from?.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
        // Send message via Twilio
        await _lib_twilio__WEBPACK_IMPORTED_MODULE_0__/* .twilioClient */ .h.messages.create({
            body: message,
            from: normalizedFrom,
            to: normalizedTo
        });
        return true;
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        return false;
    }
}
// Function to send appointment confirmation
async function sendAppointmentConfirmation(phone, professionalName, serviceName, dateTime, from) {
    const formattedDate = dateTime.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    const formattedTime = dateTime.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
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
        from
    });
}
// Function to send appointment reminder
async function sendAppointmentReminder(phone, professionalName, serviceName, dateTime, from) {
    const formattedDate = dateTime.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
    const formattedTime = dateTime.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
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
        from
    });
}


/***/ })

};
;