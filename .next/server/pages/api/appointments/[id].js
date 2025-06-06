"use strict";
(() => {
var exports = {};
exports.id = 680;
exports.ids = [680];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 7202:
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),

/***/ 9231:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5650);
/* harmony import */ var _utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7772);


async function handler(req, res) {
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
    // Handle GET request - Get appointment details
    if (req.method === "GET") {
        const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select(`
        *,
        clients (id, first_name, last_name, phone_number, email),
        services (id, name, duration, price, color)
      `).eq("id", id).eq("professional_id", user).single();
        if (error) {
            console.error("Error fetching appointment:", error);
            return res.status(error.code === "PGRST116" ? 404 : 500).json({
                error: error.code === "PGRST116" ? "Appointment not found" : "Failed to fetch appointment"
            });
        }
        return res.status(200).json(data);
    }
    // Handle PATCH request - Update appointment
    if (req.method === "PATCH") {
        const { client_id, service_id, start_time, end_time, status, notes } = req.body;
        // Build update object with only provided fields
        const updateData = {};
        if (client_id !== undefined) updateData.client_id = client_id;
        if (service_id !== undefined) updateData.service_id = service_id;
        if (start_time !== undefined) updateData.start_time = start_time;
        if (end_time !== undefined) updateData.end_time = end_time;
        if (status !== undefined) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        updateData.updated_at = new Date().toISOString();
        // Update appointment
        const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").update(updateData).eq("id", id).eq("professional_id", user).select().single();
        if (error) {
            console.error("Error updating appointment:", error);
            return res.status(500).json({
                error: "Failed to update appointment"
            });
        }
        // If status changed to confirmed, send confirmation message
        if (status === "confirmed") {
            // Get client and service details
            const { data: appointment } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select(`
          *,
          clients (id, first_name, last_name, phone_number),
          services (id, name)
        `).eq("id", id).single();
            const { data: professional } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("professionals").select("*").eq("id", user).single();
            // Send confirmation message
            if (appointment?.clients?.phone_number && professional?.phone_number) {
                await (0,_utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__/* .sendWhatsAppMessage */ .U3)({
                    to: appointment.clients.phone_number,
                    message: `Votre rendez-vous pour ${appointment.services.name} avec ${professional.first_name} ${professional.last_name} le ${new Date(appointment.start_time).toLocaleString("fr-FR")} a été confirmé.`,
                    from: professional.phone_number
                });
            }
        }
        return res.status(200).json(data);
    }
    // Handle DELETE request - Cancel appointment
    if (req.method === "DELETE") {
        // First get the appointment to check if it exists
        const { data: appointment, error: fetchError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select(`
        *,
        clients (id, first_name, last_name, phone_number),
        services (id, name)
      `).eq("id", id).eq("professional_id", user).single();
        if (fetchError) {
            console.error("Error fetching appointment:", fetchError);
            return res.status(fetchError.code === "PGRST116" ? 404 : 500).json({
                error: fetchError.code === "PGRST116" ? "Appointment not found" : "Failed to fetch appointment"
            });
        }
        // Update appointment status to cancelled instead of deleting
        const { error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").update({
            status: "cancelled",
            updated_at: new Date().toISOString()
        }).eq("id", id).eq("professional_id", user);
        if (error) {
            console.error("Error cancelling appointment:", error);
            return res.status(500).json({
                error: "Failed to cancel appointment"
            });
        }
        // Get professional details
        const { data: professional } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("professionals").select("*").eq("id", user).single();
        // Send cancellation message
        if (appointment?.clients?.phone_number && professional?.phone_number) {
            await (0,_utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__/* .sendWhatsAppMessage */ .U3)({
                to: appointment.clients.phone_number,
                message: `Votre rendez-vous pour ${appointment.services.name} avec ${professional.first_name} ${professional.last_name} le ${new Date(appointment.start_time).toLocaleString("fr-FR")} a été annulé.`,
                from: professional.phone_number
            });
        }
        return res.status(200).json({
            success: true
        });
    }
    // Handle unsupported methods
    return res.status(405).json({
        error: "Method not allowed"
    });
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [23], () => (__webpack_exec__(9231)));
module.exports = __webpack_exports__;

})();