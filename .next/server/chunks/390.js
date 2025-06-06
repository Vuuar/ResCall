"use strict";
exports.id = 390;
exports.ids = [390];
exports.modules = {

/***/ 390:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p6: () => (/* binding */ formatDate)
/* harmony export */ });
/* unused harmony exports addDuration, isTimeSlotAvailable */
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