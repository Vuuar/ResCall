"use strict";
(() => {
var exports = {};
exports.id = 312;
exports.ids = [312];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 7202:
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),

/***/ 8676:
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
    const { to, message, conversationId } = req.body;
    // Validate required fields
    if (!to || !message) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }
    try {
        // Get professional's phone number if not provided
        let from = req.body.from;
        if (!from) {
            const { data: professional, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("professionals").select("phone_number").eq("id", user).single();
            if (error || !professional?.phone_number) {
                return res.status(400).json({
                    error: "Professional phone number not found"
                });
            }
            from = professional.phone_number;
        }
        // Send message
        const success = await (0,_utils_whatsapp__WEBPACK_IMPORTED_MODULE_1__/* .sendWhatsAppMessage */ .U3)({
            to,
            message,
            from
        });
        if (!success) {
            return res.status(500).json({
                error: "Failed to send message"
            });
        }
        // If conversationId is provided, save the message to the database
        if (conversationId) {
            const { error: messageError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__/* .supabase */ .O.from("messages").insert([
                {
                    conversation_id: conversationId,
                    content: message,
                    is_from_client: false,
                    message_type: "text"
                }
            ]);
            if (messageError) {
                console.error("Error saving message:", messageError);
            // Continue even if saving to DB fails
            }
        }
        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
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
var __webpack_exports__ = __webpack_require__.X(0, [23], () => (__webpack_exec__(8676)));
module.exports = __webpack_exports__;

})();