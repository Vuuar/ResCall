"use strict";
(() => {
var exports = {};
exports.id = 624;
exports.ids = [624];
exports.modules = {

/***/ 6090:
/***/ ((module) => {

module.exports = import("stripe");;

/***/ }),

/***/ 185:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ stripe)
/* harmony export */ });
/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6090);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([stripe__WEBPACK_IMPORTED_MODULE_0__]);
stripe__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const stripe = new stripe__WEBPACK_IMPORTED_MODULE_0__["default"](process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-05-28.basil"
});

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 4750:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(185);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_stripe__WEBPACK_IMPORTED_MODULE_0__]);
_lib_stripe__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        const { customerId } = req.body;
        if (!customerId) {
            return res.status(400).json({
                error: "Missing customer ID"
            });
        }
        // Create a Stripe customer portal session
        const session = await _lib_stripe__WEBPACK_IMPORTED_MODULE_0__/* .stripe */ .A.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${req.headers.origin}/dashboard/subscription`
        });
        return res.status(200).json({
            url: session.url
        });
    } catch (error) {
        console.error("Error creating portal session:", error);
        return res.status(500).json({
            error: error.message
        });
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
var __webpack_exports__ = (__webpack_exec__(4750));
module.exports = __webpack_exports__;

})();