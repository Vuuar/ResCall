"use strict";
exports.id = 995;
exports.ids = [995];
exports.modules = {

/***/ 4995:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ DashboardLayout)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1527);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _headlessui_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1185);
/* harmony import */ var _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(467);
/* harmony import */ var _heroicons_react_20_solid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9958);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8061);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(3317);
/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(6201);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_headlessui_react__WEBPACK_IMPORTED_MODULE_2__, _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__, _heroicons_react_20_solid__WEBPACK_IMPORTED_MODULE_4__, react_hot_toast__WEBPACK_IMPORTED_MODULE_8__]);
([_headlessui_react__WEBPACK_IMPORTED_MODULE_2__, _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__, _heroicons_react_20_solid__WEBPACK_IMPORTED_MODULE_4__, react_hot_toast__WEBPACK_IMPORTED_MODULE_8__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);









function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}
function DashboardLayout({ children, user }) {
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_6__.useRouter)();
    const [sidebarOpen, setSidebarOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const navigation = [
        {
            name: "Tableau de bord",
            href: "/dashboard",
            icon: _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.HomeIcon
        },
        {
            name: "Rendez-vous",
            href: "/dashboard/appointments",
            icon: _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.CalendarIcon
        },
        {
            name: "Clients",
            href: "/dashboard/clients",
            icon: _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.UsersIcon
        },
        {
            name: "Services",
            href: "/dashboard/services",
            icon: _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.CreditCardIcon
        },
        {
            name: "Statistiques",
            href: "/dashboard/analytics",
            icon: _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.ChartBarIcon
        },
        {
            name: "Param\xe8tres",
            href: "/dashboard/settings",
            icon: _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.Cog6ToothIcon
        },
        {
            name: "Abonnement",
            href: "/dashboard/subscription",
            icon: _heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.CreditCardIcon
        }
    ];
    const handleSignOut = async ()=>{
        try {
            await _lib_supabase__WEBPACK_IMPORTED_MODULE_7__/* .supabase */ .O.auth.signOut();
            router.push("/login");
            react_hot_toast__WEBPACK_IMPORTED_MODULE_8__["default"].success("D\xe9connexion r\xe9ussie");
        } catch (error) {
            console.error("Error signing out:", error);
            react_hot_toast__WEBPACK_IMPORTED_MODULE_8__["default"].error("Erreur lors de la d\xe9connexion");
        }
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Transition.Root, {
                show: sidebarOpen,
                as: react__WEBPACK_IMPORTED_MODULE_1__.Fragment,
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog, {
                    as: "div",
                    className: "relative z-50 lg:hidden",
                    onClose: setSidebarOpen,
                    children: [
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Transition.Child, {
                            as: react__WEBPACK_IMPORTED_MODULE_1__.Fragment,
                            enter: "transition-opacity ease-linear duration-300",
                            enterFrom: "opacity-0",
                            enterTo: "opacity-100",
                            leave: "transition-opacity ease-linear duration-300",
                            leaveFrom: "opacity-100",
                            leaveTo: "opacity-0",
                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "fixed inset-0 bg-secondary-600 bg-opacity-75"
                            })
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "fixed inset-0 z-40 flex",
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Transition.Child, {
                                    as: react__WEBPACK_IMPORTED_MODULE_1__.Fragment,
                                    enter: "transition ease-in-out duration-300 transform",
                                    enterFrom: "-translate-x-full",
                                    enterTo: "translate-x-0",
                                    leave: "transition ease-in-out duration-300 transform",
                                    leaveFrom: "translate-x-0",
                                    leaveTo: "-translate-x-full",
                                    children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog.Panel, {
                                        className: "relative flex w-full max-w-xs flex-1 flex-col bg-white",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Transition.Child, {
                                                as: react__WEBPACK_IMPORTED_MODULE_1__.Fragment,
                                                enter: "ease-in-out duration-300",
                                                enterFrom: "opacity-0",
                                                enterTo: "opacity-100",
                                                leave: "ease-in-out duration-300",
                                                leaveFrom: "opacity-100",
                                                leaveTo: "opacity-0",
                                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                    className: "absolute top-0 right-0 -mr-12 pt-2",
                                                    children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", {
                                                        type: "button",
                                                        className: "ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white",
                                                        onClick: ()=>setSidebarOpen(false),
                                                        children: [
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                                                className: "sr-only",
                                                                children: "Fermer la barre lat\xe9rale"
                                                            }),
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.XMarkIcon, {
                                                                className: "h-6 w-6 text-white",
                                                                "aria-hidden": "true"
                                                            })
                                                        ]
                                                    })
                                                })
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "h-0 flex-1 overflow-y-auto pt-5 pb-4",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                        className: "flex flex-shrink-0 items-center px-4",
                                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
                                                            className: "text-xl font-bold text-primary-600",
                                                            children: "WhatsApp Booking"
                                                        })
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("nav", {
                                                        className: "mt-5 space-y-1 px-2",
                                                        children: navigation.map((item)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)((next_link__WEBPACK_IMPORTED_MODULE_5___default()), {
                                                                href: item.href,
                                                                className: classNames(router.pathname === item.href ? "bg-secondary-100 text-secondary-900" : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900", "group flex items-center px-2 py-2 text-base font-medium rounded-md"),
                                                                children: [
                                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(item.icon, {
                                                                        className: classNames(router.pathname === item.href ? "text-secondary-500" : "text-secondary-400 group-hover:text-secondary-500", "mr-4 flex-shrink-0 h-6 w-6"),
                                                                        "aria-hidden": "true"
                                                                    }),
                                                                    item.name
                                                                ]
                                                            }, item.name))
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                className: "flex flex-shrink-0 border-t border-secondary-200 p-4",
                                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                    className: "group block w-full flex-shrink-0",
                                                    children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                        className: "flex items-center",
                                                        children: [
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                    className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100",
                                                                    children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                                                        className: "text-sm font-medium leading-none text-primary-700",
                                                                        children: [
                                                                            user.first_name ? user.first_name.charAt(0) : "",
                                                                            user.last_name ? user.last_name.charAt(0) : ""
                                                                        ]
                                                                    })
                                                                })
                                                            }),
                                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                                className: "ml-3 flex-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", {
                                                                        className: "text-sm font-medium text-secondary-700 group-hover:text-secondary-900",
                                                                        children: [
                                                                            user.first_name,
                                                                            " ",
                                                                            user.last_name
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                                        onClick: handleSignOut,
                                                                        className: "text-xs font-medium text-secondary-500 group-hover:text-secondary-700",
                                                                        children: "Se d\xe9connecter"
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                })
                                            })
                                        ]
                                    })
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                    className: "w-14 flex-shrink-0"
                                })
                            ]
                        })
                    ]
                })
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                    className: "flex min-h-0 flex-1 flex-col border-r border-secondary-200 bg-white",
                    children: [
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "flex flex-1 flex-col overflow-y-auto pt-5 pb-4",
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                    className: "flex flex-shrink-0 items-center px-4",
                                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
                                        className: "text-xl font-bold text-primary-600",
                                        children: "WhatsApp Booking"
                                    })
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("nav", {
                                    className: "mt-5 flex-1 space-y-1 bg-white px-2",
                                    children: navigation.map((item)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)((next_link__WEBPACK_IMPORTED_MODULE_5___default()), {
                                            href: item.href,
                                            className: classNames(router.pathname === item.href ? "bg-secondary-100 text-secondary-900" : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900", "group flex items-center px-2 py-2 text-sm font-medium rounded-md"),
                                            children: [
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(item.icon, {
                                                    className: classNames(router.pathname === item.href ? "text-secondary-500" : "text-secondary-400 group-hover:text-secondary-500", "mr-3 flex-shrink-0 h-6 w-6"),
                                                    "aria-hidden": "true"
                                                }),
                                                item.name
                                            ]
                                        }, item.name))
                                })
                            ]
                        }),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                            className: "flex flex-shrink-0 border-t border-secondary-200 p-4",
                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Menu, {
                                as: "div",
                                className: "relative inline-block text-left w-full",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Menu.Button, {
                                            className: "group w-full rounded-md px-3.5 py-2 text-left text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none",
                                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "flex w-full items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                        className: "flex min-w-0 items-center justify-between space-x-3",
                                                        children: [
                                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100",
                                                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                                                    className: "text-sm font-medium leading-none text-primary-700",
                                                                    children: [
                                                                        user.first_name ? user.first_name.charAt(0) : "",
                                                                        user.last_name ? user.last_name.charAt(0) : ""
                                                                    ]
                                                                })
                                                            }),
                                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                                className: "min-w-0 flex-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", {
                                                                        className: "truncate text-sm font-medium text-secondary-900",
                                                                        children: [
                                                                            user.first_name,
                                                                            " ",
                                                                            user.last_name
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                                        className: "truncate text-sm text-secondary-500",
                                                                        children: user.email
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_heroicons_react_20_solid__WEBPACK_IMPORTED_MODULE_4__.ChevronDownIcon, {
                                                        className: "h-5 w-5 flex-shrink-0 text-secondary-400 group-hover:text-secondary-500",
                                                        "aria-hidden": "true"
                                                    })
                                                ]
                                            })
                                        })
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Transition, {
                                        as: react__WEBPACK_IMPORTED_MODULE_1__.Fragment,
                                        enter: "transition ease-out duration-100",
                                        enterFrom: "transform opacity-0 scale-95",
                                        enterTo: "transform opacity-100 scale-100",
                                        leave: "transition ease-in duration-75",
                                        leaveFrom: "transform opacity-100 scale-100",
                                        leaveTo: "transform opacity-0 scale-95",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Menu.Items, {
                                            className: "absolute bottom-full left-0 z-10 mb-2 w-full origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
                                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "py-1",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Menu.Item, {
                                                        children: ({ active })=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_5___default()), {
                                                                href: "/dashboard/profile",
                                                                className: classNames(active ? "bg-secondary-100 text-secondary-900" : "text-secondary-700", "block px-4 py-2 text-sm"),
                                                                children: "Votre profil"
                                                            })
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Menu.Item, {
                                                        children: ({ active })=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_5___default()), {
                                                                href: "/dashboard/settings",
                                                                className: classNames(active ? "bg-secondary-100 text-secondary-900" : "text-secondary-700", "block px-4 py-2 text-sm"),
                                                                children: "Param\xe8tres"
                                                            })
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Menu.Item, {
                                                        children: ({ active })=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                                onClick: handleSignOut,
                                                                className: classNames(active ? "bg-secondary-100 text-secondary-900" : "text-secondary-700", "block w-full text-left px-4 py-2 text-sm"),
                                                                children: "Se d\xe9connecter"
                                                            })
                                                    })
                                                ]
                                            })
                                        })
                                    })
                                ]
                            })
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "flex flex-1 flex-col lg:pl-64",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden",
                        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", {
                            type: "button",
                            className: "-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-secondary-500 hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500",
                            onClick: ()=>setSidebarOpen(true),
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                    className: "sr-only",
                                    children: "Ouvrir la barre lat\xe9rale"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_3__.Bars3Icon, {
                                    className: "h-6 w-6",
                                    "aria-hidden": "true"
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("main", {
                        className: "flex-1",
                        children: children
                    })
                ]
            })
        ]
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 3317:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   O: () => (/* binding */ supabase)
/* harmony export */ });
/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2885);
/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);

const supabaseUrl = "https://xzzmuxvgwprcmwhzmkbi.supabase.co" || 0;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6em11eHZnd3ByY213aHpta2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjcxNDUsImV4cCI6MjA2NDQ0MzE0NX0.5n_ap7CpCKx7BWvnaCRiLB4dz_RaR6zEz1_9oCoQ6ho" || 0;
const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);


/***/ })

};
;