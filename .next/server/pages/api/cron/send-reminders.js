"use strict";
(() => {
var exports = {};
exports.id = 659;
exports.ids = [659];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 7202:
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),

/***/ 4945:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5650);
/* harmony import */ var _utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7772);


// This endpoint should be called by a cron job service (e.g., Vercel Cron)
async function handler(req, res) {
    // Verify the request is authorized (you can use a secret token)
    const authToken = req.headers.authorization?.split(" ")[1];
    if (authToken !== process.env.CRON_SECRET) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }
    try {
        // Get tomorrow's date range
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);
        // Get all appointments for tomorrow
        const { data: appointments, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select(`
        *,
        clients (id, first_name, last_name, phone_number),
        services (id, name),
        professionals (id, first_name, last_name, phone_number)
      `).gte("start_time", tomorrow.toISOString()).lte("start_time", tomorrowEnd.toISOString()).in("status", [
            "confirmed",
            "scheduled"
        ]);
        if (error) {
            console.error("Error fetching appointments:", error);
            return res.status(500).json({
                error: "Failed to fetch appointments"
            });
        }
        // Send reminders for each appointment
        const results = await Promise.all(appointments.map(async (appointment)=>{
            // Skip if client has no phone number
            if (!appointment.clients?.phone_number || !appointment.professionals?.phone_number) {
                return {
                    id: appointment.id,
                    success: false,
                    reason: "Missing phone number"
                };
            }
            // Send reminder
            const success = await (0,_utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__/* .sendAppointmentReminder */ .pv)(appointment.clients.phone_number, `${appointment.professionals.first_name} ${appointment.professionals.last_name}`, appointment.services?.name || "Service", new Date(appointment.start_time), appointment.professionals.phone_number);
            return {
                id: appointment.id,
                success
            };
        }));
        // Return results
        return res.status(200).json({
            total: appointments.length,
            sent: results.filter((r)=>r.success).length,
            failed: results.filter((r)=>!r.success).length,
            details: results
        });
    } catch (error) {
        console.error("Error sending reminders:", error);
        return res.status(500).json({
            error: "Failed to send reminders"
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
var __webpack_exports__ = __webpack_require__.X(0, [23], () => (__webpack_exec__(4945)));
module.exports = __webpack_exports__;

})();