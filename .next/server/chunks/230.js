"use strict";
exports.id = 230;
exports.ids = [230];
exports.modules = {

/***/ 9230:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ useUser)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3317);


function useUser() {
    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{
        // Get the current user
        async function getUser() {
            try {
                setLoading(true);
                const { data: { session } } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_1__/* .supabase */ .O.auth.getSession();
                if (session?.user) {
                    // Get professional details
                    const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_1__/* .supabase */ .O.from("professionals").select("*").eq("id", session.user.id).single();
                    if (error) {
                        console.error("Error fetching professional:", error);
                        setUser(null);
                    } else {
                        setUser(data);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error getting user:", error);
                setUser(null);
            } finally{
                setLoading(false);
            }
        }
        getUser();
        // Listen for auth changes
        const { data: authListener } = _lib_supabase__WEBPACK_IMPORTED_MODULE_1__/* .supabase */ .O.auth.onAuthStateChange(async (event, session)=>{
            if (event === "SIGNED_IN" && session?.user) {
                // Get professional details
                const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_1__/* .supabase */ .O.from("professionals").select("*").eq("id", session.user.id).single();
                if (error) {
                    console.error("Error fetching professional:", error);
                    setUser(null);
                } else {
                    setUser(data);
                }
            } else if (event === "SIGNED_OUT") {
                setUser(null);
            }
        });
        return ()=>{
            authListener.subscription.unsubscribe();
        };
    }, []);
    return {
        user,
        loading
    };
}


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