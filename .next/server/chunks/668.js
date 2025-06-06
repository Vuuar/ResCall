"use strict";
exports.id = 668;
exports.ids = [668];
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

/***/ 4506:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ej: () => (/* binding */ isTimeSlotAvailable),
/* harmony export */   WK: () => (/* binding */ addDuration),
/* harmony export */   p6: () => (/* binding */ formatDate)
/* harmony export */ });
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4146);
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(date_fns__WEBPACK_IMPORTED_MODULE_0__);
// Add duration to a date
function addDuration(date, durationMinutes) {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + durationMinutes);
    return result;
}
// Check if a time slot is available
function isTimeSlotAvailable(startTime, endTime, appointments) {
    // Check if the time slot overlaps with any existing appointment
    for (const appointment of appointments){
        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);
        // Check for overlap
        if (startTime >= appointmentStart && startTime < appointmentEnd || endTime > appointmentStart && endTime <= appointmentEnd || startTime <= appointmentStart && endTime >= appointmentEnd) {
            return false;
        }
    }
    return true;
}

function formatDate(date, formatStr) {
    return (0,date_fns__WEBPACK_IMPORTED_MODULE_0__.format)(new Date(date), formatStr);
} // export function formatDate(date: Date): string {
 // formatDate(appointment.start_time, 'PPP') // pour la date
 // formatDate(appointment.start_time, 'HH:mm') // pour l'heure
 // return date.toLocaleDateString();
 // }


/***/ })

};
;