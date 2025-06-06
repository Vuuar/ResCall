"use strict";
exports.id = 967;
exports.ids = [967];
exports.modules = {

/***/ 9967:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ AppointmentForm)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1527);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_hook_form__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5641);
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3317);
/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6201);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([react_hook_form__WEBPACK_IMPORTED_MODULE_2__, react_hot_toast__WEBPACK_IMPORTED_MODULE_4__]);
([react_hook_form__WEBPACK_IMPORTED_MODULE_2__, react_hot_toast__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





function AppointmentForm({ professionalId, appointmentId, onSuccess }) {
    const [services, setServices] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [clients, setClients] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [initialLoading, setInitialLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = (0,react_hook_form__WEBPACK_IMPORTED_MODULE_2__.useForm)();
    const selectedServiceId = watch("service_id");
    const selectedService = services.find((s)=>s.id === selectedServiceId);
    // Fetch services, clients, and appointment data if editing
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        async function fetchData() {
            try {
                setInitialLoading(true);
                // Fetch services
                const { data: servicesData, error: servicesError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__/* .supabase */ .O.from("services").select("*").eq("professional_id", professionalId);
                if (servicesError) throw servicesError;
                setServices(servicesData);
                // Fetch clients
                const { data: clientsData, error: clientsError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__/* .supabase */ .O.from("clients").select("*").eq("professional_id", professionalId);
                if (clientsError) throw clientsError;
                setClients(clientsData);
                // If editing, fetch appointment data
                if (appointmentId) {
                    const { data: appointment, error: appointmentError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__/* .supabase */ .O.from("appointments").select("*").eq("id", appointmentId).single();
                    if (appointmentError) throw appointmentError;
                    // Set form values
                    setValue("client_id", appointment.client_id);
                    setValue("service_id", appointment.service_id);
                    setValue("date", new Date(appointment.start_time).toISOString().split("T")[0]);
                    setValue("time", new Date(appointment.start_time).toISOString().split("T")[1].substring(0, 5));
                    setValue("status", appointment.status);
                    setValue("notes", appointment.notes);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                react_hot_toast__WEBPACK_IMPORTED_MODULE_4__.toast.error("Erreur lors du chargement des donn\xe9es");
            } finally{
                setInitialLoading(false);
            }
        }
        fetchData();
    }, [
        professionalId,
        appointmentId,
        setValue
    ]);
    // Handle form submission
    const onSubmit = async (data)=>{
        try {
            setLoading(true);
            // Calculate start and end times
            const startTime = new Date(`${data.date}T${data.time}`);
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + (selectedService?.duration || 60));
            const appointmentData = {
                professional_id: professionalId,
                client_id: data.client_id,
                service_id: data.service_id,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: data.status,
                notes: data.notes
            };
            let result;
            if (appointmentId) {
                // Update existing appointment
                result = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__/* .supabase */ .O.from("appointments").update(appointmentData).eq("id", appointmentId);
            } else {
                // Create new appointment
                result = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__/* .supabase */ .O.from("appointments").insert([
                    appointmentData
                ]);
            }
            if (result.error) throw result.error;
            react_hot_toast__WEBPACK_IMPORTED_MODULE_4__.toast.success(appointmentId ? "Rendez-vous mis \xe0 jour" : "Rendez-vous cr\xe9\xe9");
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error("Error saving appointment:", err);
            react_hot_toast__WEBPACK_IMPORTED_MODULE_4__.toast.error("Erreur lors de l'enregistrement du rendez-vous");
        } finally{
            setLoading(false);
        }
    };
    if (initialLoading) {
        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: "p-4",
            children: "Chargement..."
        });
    }
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("form", {
        onSubmit: handleSubmit(onSubmit),
        className: "space-y-6 p-4",
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                        className: "block text-sm font-medium text-gray-700",
                        children: "Client"
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", {
                        ...register("client_id", {
                            required: "Client requis"
                        }),
                        className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                value: "",
                                children: "S\xe9lectionner un client"
                            }),
                            clients.map((client)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("option", {
                                    value: client.id,
                                    children: [
                                        client.first_name,
                                        " ",
                                        client.last_name
                                    ]
                                }, client.id))
                        ]
                    }),
                    errors.client_id && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                        className: "mt-1 text-sm text-red-600",
                        children: errors.client_id.message
                    })
                ]
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                        className: "block text-sm font-medium text-gray-700",
                        children: "Service"
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", {
                        ...register("service_id", {
                            required: "Service requis"
                        }),
                        className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                value: "",
                                children: "S\xe9lectionner un service"
                            }),
                            services.map((service)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("option", {
                                    value: service.id,
                                    children: [
                                        service.name,
                                        " - ",
                                        service.duration,
                                        " min - ",
                                        (service.price / 100).toFixed(2),
                                        "€"
                                    ]
                                }, service.id))
                        ]
                    }),
                    errors.service_id && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                        className: "mt-1 text-sm text-red-600",
                        children: errors.service_id.message
                    })
                ]
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "grid grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                className: "block text-sm font-medium text-gray-700",
                                children: "Date"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                type: "date",
                                ...register("date", {
                                    required: "Date requise"
                                }),
                                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            }),
                            errors.date && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "mt-1 text-sm text-red-600",
                                children: errors.date.message
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                className: "block text-sm font-medium text-gray-700",
                                children: "Heure"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                type: "time",
                                ...register("time", {
                                    required: "Heure requise"
                                }),
                                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            }),
                            errors.time && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "mt-1 text-sm text-red-600",
                                children: errors.time.message
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                        className: "block text-sm font-medium text-gray-700",
                        children: "Statut"
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", {
                        ...register("status"),
                        className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                value: "scheduled",
                                children: "Planifi\xe9"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                value: "confirmed",
                                children: "Confirm\xe9"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                value: "cancelled",
                                children: "Annul\xe9"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                value: "completed",
                                children: "Termin\xe9"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                        className: "block text-sm font-medium text-gray-700",
                        children: "Notes"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("textarea", {
                        ...register("notes"),
                        rows: 3,
                        className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    })
                ]
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "flex justify-end",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                    type: "submit",
                    disabled: loading,
                    className: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50",
                    children: loading ? "Enregistrement..." : appointmentId ? "Mettre \xe0 jour" : "Cr\xe9er"
                })
            })
        ]
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;