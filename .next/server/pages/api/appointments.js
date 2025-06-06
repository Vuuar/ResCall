"use strict";
(() => {
var exports = {};
exports.id = 504;
exports.ids = [504];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 7202:
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),

/***/ 8549:
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
    // Handle GET request - List appointments
    if (req.method === "GET") {
        const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").select(`
        *,
        clients (id, first_name, last_name, phone_number, email),
        services (id, name, duration, price, color)
      `).eq("professional_id", user).order("start_time", {
            ascending: true
        });
        if (error) {
            console.error("Error fetching appointments:", error);
            return res.status(500).json({
                error: "Failed to fetch appointments"
            });
        }
        return res.status(200).json(data);
    }
    // Handle POST request - Create appointment
    if (req.method === "POST") {
        const { client_id, service_id, start_time, end_time, status = "scheduled", notes } = req.body;
        // Validate required fields
        if (!client_id || !service_id || !start_time || !end_time) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        // Create appointment
        const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("appointments").insert([
            {
                professional_id: user,
                client_id,
                service_id,
                start_time,
                end_time,
                status,
                notes
            }
        ]).select().single();
        if (error) {
            console.error("Error creating appointment:", error);
            return res.status(500).json({
                error: "Failed to create appointment"
            });
        }
        // Get client and service details for confirmation message
        const { data: client } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("clients").select("*").eq("id", client_id).single();
        const { data: service } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("services").select("*").eq("id", service_id).single();
        const { data: professional } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("professionals").select("*").eq("id", user).single();
        // Send confirmation message if client has phone number
        if (client?.phone_number && professional?.phone_number) {
            await (0,_utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__/* .sendAppointmentConfirmation */ .sl)(client.phone_number, `${professional.first_name} ${professional.last_name}`, service?.name || "Service", new Date(start_time), professional.phone_number);
        }
        return res.status(201).json(data);
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
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [23], () => (__webpack_exec__(8549)));
module.exports = __webpack_exports__;

})();