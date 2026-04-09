(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiFetch",
    ()=>apiFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_URL = ("TURBOPACK compile-time value", "http://localhost:5000") || "http://localhost:5000";
function getToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem("token");
}
async function apiFetch(path, options = {}) {
    const token = getToken();
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...token ? {
                    Authorization: `Bearer ${token}`
                } : {},
                ...options.headers || {}
            }
        });
    } catch  {
        throw new Error(`Impossible de contacter l'API (${API_URL}). Verifie que le backend Flask est demarre et que CORS autorise l'origine du frontend.`);
    }
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
        throw new Error(data?.error || data?.message || "API error");
    }
    return data;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/profile.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "profileService",
    ()=>profileService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
;
const profileService = {
    getProfile: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/profile/"),
    saveProfile: (payload)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/profile/", {
            method: "PUT",
            body: JSON.stringify(payload)
        }),
    getObjective: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/profile/objective"),
    createObjective: (payload)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/profile/objective", {
            method: "POST",
            body: JSON.stringify(payload)
        }),
    updateObjective: (payload)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/profile/objective", {
            method: "PUT",
            body: JSON.stringify(payload)
        }),
    getObjectiveHistory: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/profile/objective/history")
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$profile$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/profile.service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const goalToObjectiveType = {
    lose_weight: 'weight-loss',
    gain_muscle: 'muscle-gain',
    improve_endurance: 'endurance',
    maintain_weight: 'maintenance'
};
const objectiveTypeToGoal = {
    'weight-loss': 'lose_weight',
    'muscle-gain': 'gain_muscle',
    endurance: 'improve_endurance',
    maintenance: 'maintain_weight'
};
function mapActivityToFitnessLevel(activityLevel) {
    if (activityLevel === 'very_active' || activityLevel === 'extra_active') return 'advanced';
    if (activityLevel === 'moderately_active') return 'intermediate';
    return 'beginner';
}
function normalizeStringArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map((item)=>String(item).trim()).filter(Boolean);
    if (typeof value === 'string') {
        return value.split(',').map((item)=>item.trim()).filter(Boolean);
    }
    return [];
}
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const loadCurrentUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[loadCurrentUser]": async ()=>{
            const [{ user: authUser }, profileRes, objectiveRes] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])('/api/auth/me'),
                __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$profile$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["profileService"].getProfile().catch({
                    "AuthProvider.useCallback[loadCurrentUser]": ()=>({
                            profile: null
                        })
                }["AuthProvider.useCallback[loadCurrentUser]"]),
                __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$profile$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["profileService"].getObjective().catch({
                    "AuthProvider.useCallback[loadCurrentUser]": ()=>({
                            objective: null
                        })
                }["AuthProvider.useCallback[loadCurrentUser]"])
            ]);
            const profile = profileRes?.profile;
            const objective = objectiveRes?.objective;
            const mappedUser = {
                id: String(authUser.id),
                username: authUser.username,
                email: authUser.email,
                avatar: undefined,
                age: profile?.age ?? 0,
                gender: profile?.gender ?? 'other',
                height: profile?.height ?? 0,
                weight: profile?.weight ?? 0,
                fitnessLevel: mapActivityToFitnessLevel(profile?.activity_level),
                objectives: objective ? [
                    {
                        type: goalToObjectiveType[objective.goal] ?? 'maintenance',
                        target: objective.target_weight ?? undefined,
                        startDate: objective.start_date ?? undefined,
                        deadline: objective.end_date ?? undefined
                    }
                ] : [],
                dietaryRestrictions: normalizeStringArray(profile?.allergies),
                medicalConditions: normalizeStringArray(profile?.health_conditions),
                createdAt: authUser.created_at,
                updatedAt: profile?.updated_at ?? authUser.created_at
            };
            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));
        }
    }["AuthProvider.useCallback[loadCurrentUser]"], []);
    // Initialize authenticated user from token
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            let isMounted = true;
            const initAuth = {
                "AuthProvider.useEffect.initAuth": async ()=>{
                    try {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            if (isMounted) {
                                setUser(null);
                                localStorage.removeItem('user');
                            }
                            return;
                        }
                        await loadCurrentUser();
                    } catch (error) {
                        console.error('Failed to restore session:', error);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        if (isMounted) setUser(null);
                    } finally{
                        if (isMounted) setIsLoading(false);
                    }
                }
            }["AuthProvider.useEffect.initAuth"];
            initAuth();
            return ({
                "AuthProvider.useEffect": ()=>{
                    isMounted = false;
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        loadCurrentUser
    ]);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (email, password)=>{
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password
                })
            });
            localStorage.setItem('token', data.access_token);
            await loadCurrentUser();
        }
    }["AuthProvider.useCallback[login]"], [
        loadCurrentUser
    ]);
    const signup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[signup]": async (email, password, username)=>{
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    username
                })
            });
            localStorage.setItem('token', data.access_token);
            await loadCurrentUser();
        }
    }["AuthProvider.useCallback[signup]"], [
        loadCurrentUser
    ]);
    const completeProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[completeProfile]": async (profileData)=>{
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$profile$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["profileService"].saveProfile({
                age: profileData.age,
                gender: profileData.gender,
                height: profileData.height,
                weight: profileData.weight,
                activity_level: profileData.fitnessLevel === 'advanced' ? 'very_active' : profileData.fitnessLevel === 'intermediate' ? 'moderately_active' : 'lightly_active',
                health_conditions: profileData.medicalConditions,
                allergies: profileData.dietaryRestrictions
            });
            if (profileData.objectives && profileData.objectives.length > 0) {
                const firstObjective = profileData.objectives[0];
                const goal = objectiveTypeToGoal[firstObjective.type] ?? 'maintain_weight';
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$profile$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["profileService"].updateObjective({
                        goal: goal,
                        target_weight: firstObjective.target
                    });
                } catch  {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$profile$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["profileService"].createObjective({
                        goal: goal,
                        target_weight: firstObjective.target
                    });
                }
            }
            await loadCurrentUser();
        }
    }["AuthProvider.useCallback[completeProfile]"], [
        loadCurrentUser
    ]);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": async ()=>{
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }["AuthProvider.useCallback[logout]"], []);
    const updateUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[updateUser]": async (data)=>{
            await completeProfile(data);
        }
    }["AuthProvider.useCallback[updateUser]"], [
        completeProfile
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            isLoggedIn: !!user,
            login,
            signup,
            completeProfile,
            logout,
            updateUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 208,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "vrs0e4hv7yijdqZmUK9z9Tga1wY=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0--3_nz._.js.map