"use strict";
(() => {
var exports = {};
exports.id = 511;
exports.ids = [511];
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

/***/ 2903:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5650);
/* harmony import */ var _lib_twilio__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(393);
/* harmony import */ var _utils_date__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4506);



async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    // Verify API key for security (you should implement this)
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }
    try {
        // Get all confirmed appointments that need reminders
        const now = new Date();
        const { data: appointments, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select(`
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
      `).eq("status", "confirmed");
        if (error) {
            console.error("Error fetching appointments:", error);
            return res.status(500).json({
                error: "Error fetching appointments"
            });
        }
        const remindersToSend = [];
        for (const appointment of appointments){
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
        const results = await Promise.all(remindersToSend.map(async (appointment)=>{
            try {
                const reminderTemplate = appointment.settings.professional_settings[0]?.reminder_message || `Rappel : Vous avez rendez-vous demain à {time}.`;
                const reminderMessage = reminderTemplate.replace("{date}", (0,_utils_date__WEBPACK_IMPORTED_MODULE_2__/* .formatDate */ .p6)(appointment.start_time, "PPP")).replace("{time}", (0,_utils_date__WEBPACK_IMPORTED_MODULE_2__/* .formatDate */ .p6)(appointment.start_time, "HH:mm"));
                await _lib_twilio__WEBPACK_IMPORTED_MODULE_1__/* .twilioClient */ .h.messages.create({
                    body: reminderMessage,
                    from: `whatsapp:${appointment.professionals.whatsapp_number}`,
                    to: `whatsapp:${appointment.client_phone}`
                });
                return {
                    id: appointment.id,
                    success: true
                };
            } catch (error) {
                console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
                return {
                    id: appointment.id,
                    success: false,
                    error
                };
            }
        }));
        return res.status(200).json({
            success: true,
            remindersSent: results.filter((r)=>r.success).length,
            remindersTotal: remindersToSend.length,
            results
        });
    } catch (error) {
        console.error("Reminder error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [668], () => (__webpack_exec__(2903)));
module.exports = __webpack_exports__;

})();