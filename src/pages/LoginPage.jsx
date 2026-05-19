import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ── Logo Inter Rapidísimo ─────────────────────────────────────────────────────
function RapidimoLogo({ size = "md" }) {
  const sz = size === "sm" ? 32 : size === "lg" ? 56 : 44;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: sz, height: sz,
        background: "#FF6B00",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 14px rgba(255,107,0,0.45)",
      }}>
        <svg viewBox="0 0 24 24" width={sz * 0.55} height={sz * 0.55} fill="none">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#fff" />
        </svg>
      </div>
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
          fontSize: sz * 0.42,
          fontWeight: 900,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>INTER</div>
        <div style={{
          fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
          fontSize: sz * 0.62,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          lineHeight: 0.95,
        }}>RAPIDÍSIMO</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5, marginTop: 3,
        }}>
          <div style={{ flex: 1, height: 2, background: "#FF6B00", borderRadius: 1 }} />
          <svg viewBox="0 0 14 10" width="14" height="10" fill="none">
            <path d="M8 0L4 5H7L6 10L12 5H9L8 0Z" fill="#FF6B00"/>
          </svg>
          <div style={{ flex: 1, height: 2, background: "#FF6B00", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function LoginPage() { // 👈 Eliminamos la prop 'onLogin' que ya no se necesita
  const { login, loading, error, setError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    
    // Ejecuta el login global. Al resolverse con éxito, cambiará el estado de 'user'
    // en el AuthContext y re-enrutará la aplicación de inmediato.
    await login(username.trim(), password);
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      background: "#0a0a0a",
      fontFamily: "'Barlow', 'Helvetica Neue', Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Panel izquierdo — branding */}
      <div style={{
        flex: "0 0 48%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 48,
        padding: "48px 56px",
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          bottom: -60,
          left: -40,
          fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
          fontSize: 260,
          fontWeight: 900,
          color: "rgba(255,107,0,0.04)",
          lineHeight: 1,
          userSelect: "none",
          whiteSpace: "nowrap",
          letterSpacing: "-0.04em",
        }}>CF</div>

        <div style={{
          position: "absolute",
          top: 0, left: 0,
          width: 4, height: "100%",
          background: "#FF6B00",
        }} />

        <RapidimoLogo size="md" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block",
            background: "#FF6B00",
            color: "#fff",
            fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: 3,
            marginBottom: 20,
          }}>Panel de Operaciones</div>

          <h1 style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
            fontSize: 72,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 0.92,
            margin: "0 0 24px",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
          }}>
            GESTIÓN<br />
            <span style={{ color: "#FF6B00" }}>RÁPIDA.</span><br />
            ENTREGAS<br />PRECISAS.
          </h1>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#111111",
        padding: "48px 40px",
        position: "relative",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
              fontSize: 38,
              fontWeight: 800,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              margin: "0 0 6px",
            }}>Bienvenido</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>Usuario</label>
              <input
                type="text"
                autoComplete="username"
                placeholder="Ej: admin"
                value={username}
                onChange={e => { setUsername(e.target.value); setError?.(""); }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 16px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "'Barlow', sans-serif",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#FF6B00"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>Contraseña</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError?.(""); }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 44px 12px 16px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    fontFamily: "'Barlow', sans-serif",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#FF6B00"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", padding: 0,
                  }}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 6,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 6,
                border: "none",
                background: "#FF6B00",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "background 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#E55E00"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#FF6B00"; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }} />
                  Verificando…
                </>
              ) : "Iniciar sesión →"}
            </button>
          </form>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            marginTop: 28,
            paddingTop: 22,
            textAlign: "center",
          }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>
              Demo:{" "}
              <span style={{ color: "rgba(255,255,255,0.45)" }}>admin</span>
              {" / "}
              <span style={{ color: "rgba(255,255,255,0.45)" }}>admin123</span>
            </p>
          </div>
        </div>

        <p style={{
          position: "absolute",
          bottom: 24,
          fontSize: 11,
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.06em",
        }}>
          © 2026 CajasFlow · Todos los derechos reservados
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #1a1a1a inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { flex: 1 !important; }
        }
      `}</style>
    </div>
  );
}