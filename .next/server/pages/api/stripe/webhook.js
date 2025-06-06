"use strict";
(() => {
var exports = {};
exports.id = 815;
exports.ids = [815];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 4217:
/***/ ((module) => {

module.exports = require("micro");

/***/ }),

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

/***/ 5633:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   config: () => (/* binding */ config),
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var micro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4217);
/* harmony import */ var micro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(micro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_stripe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(185);
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5650);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_stripe__WEBPACK_IMPORTED_MODULE_1__]);
_lib_stripe__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];



const config = {
    api: {
        bodyParser: false
    }
};
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    const buf = await (0,micro__WEBPACK_IMPORTED_MODULE_0__.buffer)(req);
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = _lib_stripe__WEBPACK_IMPORTED_MODULE_1__/* .stripe */ .A.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch(event.type){
        case "checkout.session.completed":
            {
                const session = event.data.object;
                // Update user subscription
                if (session.client_reference_id && session.subscription) {
                    await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.from("professionals").update({
                        subscription_tier: session.metadata.plan,
                        subscription_status: "active",
                        trial_ends_at: null,
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription
                    }).eq("id", session.client_reference_id);
                }
                break;
            }
        case "customer.subscription.updated":
            {
                const subscription = event.data.object;
                // Find user by Stripe customer ID
                const { data: professional } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.from("professionals").select("id").eq("stripe_customer_id", subscription.customer).single();
                if (professional) {
                    await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.from("professionals").update({
                        subscription_status: subscription.status
                    }).eq("id", professional.id);
                }
                break;
            }
        case "customer.subscription.deleted":
            {
                const subscription = event.data.object;
                // Find user by Stripe customer ID
                const { data: professional } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.from("professionals").select("id").eq("stripe_customer_id", subscription.customer).single();
                if (professional) {
                    await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.from("professionals").update({
                        subscription_status: "inactive",
                        subscription_tier: null
                    }).eq("id", professional.id);
                }
                break;
            }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    res.status(200).json({
        received: true
    });
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
var __webpack_exports__ = (__webpack_exec__(5633));
module.exports = __webpack_exports__;

})();