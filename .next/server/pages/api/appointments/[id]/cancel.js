"use strict";
(() => {
var exports = {};
exports.id = 33;
exports.ids = [33];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 7202:
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),

/***/ 8731:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5650);
/* harmony import */ var _utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7772);


async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    // Get the user ID from the session
    const user = req.headers["x-user-id"];
    if (!user) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }
    // Get appointment ID from the URL
    const { id } = req.query;
    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            error: "Invalid appointment ID"
        });
    }
    try {
        // Get appointment details
        const { data: appointment, error: appointmentError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select(`
        *,
        clients (id, first_name, last_name, phone_number),
        services (id, name)
      `).eq("id", id).eq("professional_id", user).single();
        if (appointmentError) {
            console.error("Error fetching appointment:", appointmentError);
            return res.status(404).json({
                error: "Appointment not found"
            });
        }
        // Get professional details
        const { data: professional, error: professionalError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("professionals").select("*").eq("id", user).single();
        if (professionalError) {
            console.error("Error fetching professional:", professionalError);
            return res.status(404).json({
                error: "Professional not found"
            });
        }
        // Update appointment status
        const { error: updateError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").update({
            status: "cancelled",
            updated_at: new Date().toISOString()
        }).eq("id", id).eq("professional_id", user);
        if (updateError) {
            console.error("Error updating appointment:", updateError);
            return res.status(500).json({
                error: "Failed to update appointment"
            });
        }
        // Send cancellation message
        if (appointment.clients?.phone_number) {
            const formattedDate = new Date(appointment.start_time).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
            const formattedTime = new Date(appointment.start_time).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit"
            });
            const message = `
Votre rendez-vous a été annulé.

📅 Date: ${formattedDate}
⏰ Heure: ${formattedTime}
👤 Professionnel: ${professional.first_name} ${professional.last_name}
🔍 Service: ${appointment.services?.name || "Service"}

Pour toute question, veuillez nous contacter.
      `.trim();
            const success = await (0,_utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__/* .sendWhatsAppMessage */ .U3)({
                to: appointment.clients.phone_number,
                message,
                from: professional.phone_number
            });
            if (!success) {
                console.error("Error sending cancellation message");
            // Continue even if sending message fails
            }
        }
        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [23], () => (__webpack_exec__(8731)));
module.exports = __webpack_exports__;

})();