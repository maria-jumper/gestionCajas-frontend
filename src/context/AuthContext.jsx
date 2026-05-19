import { createContext, useContext, useState, useCallback } from "react";

// 1. Detecta automáticamente si estás en producción (Render) o en desarrollo (Local)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:4000/api"
    : "https://api-gestion-cajas.onrender.com/api"; // 👈 ¡LISTO! Sincronizado dinámicamente con tu API real en Render

const AuthContext = createContext(null);

// ── Helpers de sesión unificados en localStorage ───────────────────────────────
function cargarSesion() {
    try {
        return {
            // Mantiene la sesión activa al recargar pestañas o duplicar ventanas
            user:  JSON.parse(localStorage.getItem("cf-user")) || null,
            token: localStorage.getItem("token") || null, // Sincronizado para que api.js lo lea directamente
        };
    } catch {
        return { user: null, token: null };
    }
}

function guardarSesion(user, token) {
    localStorage.setItem("cf-user", JSON.stringify(user));
    localStorage.setItem("token", token); // Guarda el JWT de forma global para las peticiones de módulos
}

function limpiarSesion() {
    localStorage.removeItem("cf-user");
    localStorage.removeItem("token");
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const sesionInicial = cargarSesion();

    const [user,    setUser]    = useState(sesionInicial.user);
    const [token,   setToken]   = useState(sesionInicial.token);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                    username: username.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || data.mensaje || "Usuario o contraseña incorrectos");
                setLoading(false);
                return false;
            }

            // Guarda localmente y levanta el estado reactivo global
            guardarSesion(data.user, data.token);
            setUser(data.user);
            setToken(data.token);
            setLoading(false);
            return true;

        } catch (err) {
            console.error("Error de red en login:", err);
            setError("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
            setLoading(false);
            return false;
        }
    }, []);

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        limpiarSesion();
        setUser(null);
        setToken(null);
        setError("");
    }, []);

    // ── REGISTER (Vía Bearer token activo) ───────────────────────────────────
    const register = useCallback(async (nombre, username, password, rol = "secretaria") => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method:  "POST",
                headers: {
                    "Content-Type":  "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ nombre, username, password, rol }),
            });

            const data = await res.json();
            if (!res.ok) return { ok: false, msg: data.error || "Error al registrar usuario" };
            return { ok: true };

        } catch (err) {
            console.error("Error en register:", err);
            return { ok: false, msg: "No se pudo conectar con el servidor" };
        }
    }, [token]);

    const getToken = useCallback(() => token, [token]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            login,
            logout,
            register,
            getToken,
            setError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);