"use strict";
exports.id = 263;
exports.ids = [263];
exports.modules = {

/***/ 1263:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ ConversationList)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1527);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3317);
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4146);
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(date_fns__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var date_fns_locale__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5564);
/* harmony import */ var date_fns_locale__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(date_fns_locale__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8061);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_5__);






function ConversationList({ professionalId, selectedId }) {
    const [conversations, setConversations] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        async function fetchConversations() {
            try {
                setLoading(true);
                // Get conversations with last message
                const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.rpc("get_conversations_with_last_message", {
                    p_professional_id: professionalId
                });
                if (error) throw error;
                setConversations(data);
            } catch (err) {
                console.error("Error fetching conversations:", err);
                setError("Failed to load conversations");
            } finally{
                setLoading(false);
            }
        }
        if (professionalId) {
            fetchConversations();
            // Set up real-time subscription for new messages
            const subscription = _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.channel("public:messages").on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `professional_id=eq.${professionalId}`
            }, ()=>{
                fetchConversations();
            }).subscribe();
            return ()=>{
                _lib_supabase__WEBPACK_IMPORTED_MODULE_2__/* .supabase */ .O.removeChannel(subscription);
            };
        }
    }, [
        professionalId
    ]);
    if (loading) {
        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: "p-4",
            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "animate-pulse space-y-4",
                children: [
                    ...Array(5)
                ].map((_, i)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "h-16 bg-gray-200 rounded"
                    }, i))
            })
        });
    }
    if (error) {
        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: "p-4 text-red-500",
            children: error
        });
    }
    if (conversations.length === 0) {
        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: "p-4 text-center text-gray-500",
            children: "Aucune conversation"
        });
    }
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: "divide-y divide-gray-200",
        children: conversations.map((conversation)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)((next_link__WEBPACK_IMPORTED_MODULE_5___default()), {
                href: `/conversations/${conversation.id}`,
                className: `block p-4 hover:bg-gray-50 ${selectedId === conversation.id ? "bg-indigo-50" : ""}`,
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "flex justify-between",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "font-medium",
                                children: [
                                    conversation.client_name || conversation.client_phone,
                                    conversation.unread_count > 0 && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                        className: "ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800",
                                        children: conversation.unread_count
                                    })
                                ]
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "text-sm text-gray-500",
                                children: (0,date_fns__WEBPACK_IMPORTED_MODULE_3__.formatDistanceToNow)(new Date(conversation.last_message_time), {
                                    addSuffix: true,
                                    locale: date_fns_locale__WEBPACK_IMPORTED_MODULE_4__.fr
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "mt-1 text-sm text-gray-600 truncate",
                        children: conversation.last_message
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "mt-1 text-xs text-gray-500",
                        children: conversation.status === "active" ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                            className: "text-green-500",
                            children: "Active"
                        }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                            className: "text-gray-500",
                            children: "Ferm\xe9e"
                        })
                    })
                ]
            }, conversation.id))
    });
}


/***/ })

};
;