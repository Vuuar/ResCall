"use strict";
(() => {
var exports = {};
exports.id = 324;
exports.ids = [324];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 6090:
/***/ ((module) => {

module.exports = import("stripe");;

/***/ }),

/***/ 2664:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   B: () => (/* binding */ subscriptionPlans)
/* harmony export */ });
const subscriptionPlans = [
    {
        id: "basic",
        name: "Basic",
        description: "Perfect for small businesses just getting started",
        price: 19,
        features: [
            "Up to 50 appointments per month",
            "Up to 5 services",
            "Text message support",
            "Appointment reminders",
            "Basic analytics"
        ],
        limits: {
            appointments: 50,
            services: 5,
            staff: 1,
            voice_messages: false,
            calendar_integration: false,
            analytics: false
        }
    },
    {
        id: "pro",
        name: "Pro",
        description: "For growing businesses with more clients",
        price: 49,
        features: [
            "Up to 200 appointments per month",
            "Up to 15 services",
            "Text & voice message support",
            "Appointment reminders",
            "Calendar integration",
            "Advanced analytics"
        ],
        limits: {
            appointments: 200,
            services: 15,
            staff: 3,
            voice_messages: true,
            calendar_integration: true,
            analytics: true
        },
        recommended: true
    },
    {
        id: "premium",
        name: "Premium",
        description: "For established businesses with high volume",
        price: 99,
        features: [
            "Unlimited appointments",
            "Unlimited services",
            "Text & voice message support",
            "Appointment reminders",
            "Calendar integration",
            "Advanced analytics",
            "Multiple staff members",
            "Priority support"
        ],
        limits: {
            appointments: Infinity,
            services: Infinity,
            staff: 10,
            voice_messages: true,
            calendar_integration: true,
            analytics: true
        }
    }
];


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

/***/ 6958:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(185);
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5650);
/* harmony import */ var _data_subscriptionPlans__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2664);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_stripe__WEBPACK_IMPORTED_MODULE_0__]);
_lib_stripe__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];



async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        const { planId, userId } = req.body;
        if (!planId || !userId) {
            return res.status(400).json({
                error: "Missing required parameters"
            });
        }
        // Get the plan details
        const plan = _data_subscriptionPlans__WEBPACK_IMPORTED_MODULE_2__/* .subscriptionPlans */ .B.find((p)=>p.id === planId);
        if (!plan) {
            return res.status(400).json({
                error: "Invalid plan ID"
            });
        }
        // Get the user from Supabase
        const { data: user, error: userError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_1__/* .supabase */ .O.from("professionals").select("*").eq("id", userId).single();
        if (userError) {
            console.error("Error fetching user:", userError);
            return res.status(400).json({
                error: "User not found"
            });
        }
        // Create or retrieve the Stripe customer
        let customerId = user.stripe_customer_id;
        if (!customerId) {
            const customer = await _lib_stripe__WEBPACK_IMPORTED_MODULE_0__/* .stripe */ .A.customers.create({
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                metadata: {
                    userId: user.id
                }
            });
            customerId = customer.id;
            // Update the user with the Stripe customer ID
            await _lib_supabase__WEBPACK_IMPORTED_MODULE_1__/* .supabase */ .O.from("professionals").update({
                stripe_customer_id: customerId
            }).eq("id", userId);
        }
        // Create the checkout session
        const session = await _lib_stripe__WEBPACK_IMPORTED_MODULE_0__/* .stripe */ .A.checkout.sessions.create({
            customer: customerId,
            client_reference_id: userId,
            payment_method_types: [
                "card"
            ],
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `WhatsApp Booking Assistant - ${plan.name}`,
                            description: plan.description
                        },
                        unit_amount: plan.price * 100,
                        recurring: {
                            interval: "month"
                        }
                    },
                    quantity: 1
                }
            ],
            metadata: {
                plan: planId
            },
            success_url: `${req.headers.origin}/dashboard/subscription?success=true`,
            cancel_url: `${req.headers.origin}/dashboard/subscription?canceled=true`
        });
        return res.status(200).json({
            url: session.url
        });
    } catch (error) {
        console.error("Error creating checkout session:", error);
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
var __webpack_exports__ = (__webpack_exec__(6958));
module.exports = __webpack_exports__;

})();