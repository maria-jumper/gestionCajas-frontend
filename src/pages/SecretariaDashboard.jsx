import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EntregasPage from "./EntregasPage";
import EnviosPage from "./EnviosPage";

// ── Paleta — mismo negro/naranja pero con superficie ligeramente más clara ────
const C = {
  bg:          "#0d0d0d",
  surface:     "#141414",
  cardBg:      "#1a1a1a",
  cardBorder:  "rgba(255,255,255,0.07)",
  headerBg:    "#0d0d0d",
  accent:      "#FF6B00",
  accentDim:   "rgba(255,107,0,0.15)",
  accentLight: "rgba(255,107,0,0.08)",
  textPrimary: "#f0f4f8",
  textSec:     "#8a9bb0",
  textGhost:   "#4e6070",
  success:     "#10b981",
  successBg:   "rgba(16,185,129,0.12)",
  danger:      "#ef4444",
  dangerBg:    "rgba(239,68,68,0.1)",
  warning:     "#f59e0b",
  warningBg:   "rgba(245,158,11,0.1)",
  inputBg:     "#111",
  inputBorder: "rgba(255,255,255,0.1)",
};

// ── Datos demo de movimientos recientes ───────────────────────────────────────
const MOVIMIENTOS_DEMO = [
  { id: 1, tipo: "entrega", status: "Entrega Completada",  guia: "12345",     fecha: "24/05/2024", nombre: "Juan Fernández",  estado: "Entregado"    },
  { id: 2, tipo: "envio",   status: "Envío Registrado",    guia: "ENV-0001",  fecha: "24/05/2024", nombre: "Distribuciones XYZ", estado: "No entregado" },
  { id: 3, tipo: "entrega", status: "Entrega Pendiente",   guia: "GUIA-9821", fecha: "24/05/2024", nombre: "Carlos Ruiz",     estado: "No entregado" },
  { id: 4, tipo: "envio",   status: "Envío Registrado",    guia: "ENV-0002",  fecha: "23/05/2024", nombre: "Empresa Sur",     estado: "Entregado"    },
  { id: 5, tipo: "entrega", status: "Entrega Completada",  guia: "GUIA-7743", fecha: "23/05/2024", nombre: "Ana Morales",     estado: "Entregado"    },
];

// ── Ícono por tipo de movimiento ──────────────────────────────────────────────
function MovIcon({ tipo, estado }) {
  const color = estado === "Entregado" ? C.success : tipo === "envio" ? "#6366f1" : C.warning;
  const bg    = estado === "Entregado" ? C.successBg : tipo === "envio" ? "rgba(99,102,241,0.12)" : C.warningBg;
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, border: `1.5px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
      {estado === "Entregado" ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      ) : tipo === "envio" ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      )}
    </div>
  );
}

// ── Badge estado ──────────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const ok = estado === "Entregado";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      fontFamily: "'Barlow', sans-serif",
      background: ok ? C.successBg : C.dangerBg,
      color: ok ? C.success : C.danger,
      border: `1px solid ${ok ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: ok ? C.success : C.danger }} />
      {estado}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD SECRETARIA
// ══════════════════════════════════════════════════════════════════════════════
export default function SecretariaDashboard({ onLogout }) {
  const { user, logout } = useAuth();
  const [vista,        setVista]        = useState("inicio"); // inicio | entregas | envios
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [movimientos,  setMovimientos]  = useState(MOVIMIENTOS_DEMO);

  const nombreUsuario = user?.nombre || user?.username || "Secretaria";
  const emailUsuario  = user?.email  || `${(user?.username || "secretaria").toLowerCase()}@cajasflow.com`;

  const handleLogout = () => { logout(); if (onLogout) onLogout(); };

  // Cuando el módulo de entregas/envíos guarda, agrega al historial
  const volverAlInicio = () => setVista("inicio");

  // ── Íconos ────────────────────────────────────────────────────────────────
  const IcoLogout  = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  const IcoUser    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const IcoChevron = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
  const IcoHome    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

  // ── Módulo entregas/envíos ────────────────────────────────────────────────
  if (vista === "entregas") return (
    <div style={{ height: "100vh", overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Barlow', sans-serif" }}>
      <AppHeader nombreUsuario={nombreUsuario} emailUsuario={emailUsuario} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} handleLogout={handleLogout} IcoLogout={IcoLogout} IcoUser={IcoUser} IcoChevron={IcoChevron} IcoHome={IcoHome} vista={vista} onHome={volverAlInicio} />
      <main style={{ flex: 1, padding: "20px 32px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <EntregasPage onVolver={volverAlInicio} />
      </main>
    </div>
  );

  if (vista === "envios") return (
    <div style={{ height: "100vh", overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Barlow', sans-serif" }}>
      <AppHeader nombreUsuario={nombreUsuario} emailUsuario={emailUsuario} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} handleLogout={handleLogout} IcoLogout={IcoLogout} IcoUser={IcoUser} IcoChevron={IcoChevron} IcoHome={IcoHome} vista={vista} onHome={volverAlInicio} />
      <main style={{ flex: 1, padding: "20px 32px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <EnviosPage onVolver={volverAlInicio} />
      </main>
    </div>
  );

  // ── INICIO ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Barlow', sans-serif" }}>

      <AppHeader nombreUsuario={nombreUsuario} emailUsuario={emailUsuario} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} handleLogout={handleLogout} IcoLogout={IcoLogout} IcoUser={IcoUser} IcoChevron={IcoChevron} IcoHome={IcoHome} vista={vista} onHome={volverAlInicio} />

      <main style={{ flex: 1, padding: "28px 40px 20px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>

        {/* Bienvenida */}
        <div style={{ flexShrink: 0, marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 900, color: C.textPrimary, margin: "0 0 4px" }}>
            ¡Bienvenida, {nombreUsuario}! 👋
          </h1>
          <p style={{ fontSize: 14, color: C.textSec, margin: 0 }}>¿Qué operación deseas realizar hoy?</p>
        </div>

        {/* Cards de acción */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flexShrink: 0, marginBottom: 28 }}>

          {/* Registrar Entrega */}
          <div style={{
            borderRadius: 16, overflow: "hidden", position: "relative",
            background: "linear-gradient(135deg, #FF6B00 0%, #e55200 100%)",
            padding: "28px 28px 20px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            minHeight: 160,
          }}>
            {/* Decoración */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", top: 10, right: 10, opacity: 0.25 }}>
              <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                <path d="M40 10L10 28v24l30 18 30-18V28L40 10z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"/>
                <line x1="40" y1="70" x2="40" y2="46" stroke="#fff" strokeWidth="2.5"/>
                <line x1="10" y1="28" x2="40" y2="46" stroke="#fff" strokeWidth="2"/>
                <line x1="70" y1="28" x2="40" y2="46" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 10px", marginBottom: 10 }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.07em", textTransform: "uppercase" }}>Módulo entregas</span>
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                REGISTRAR<br />ENTREGA
              </h2>
            </div>

            <button onClick={() => setVista("entregas")} style={{
              position: "relative", zIndex: 1,
              marginTop: 18, padding: "11px 0", borderRadius: 10,
              border: "none", background: "#fff",
              color: "#FF6B00", fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15, fontWeight: 800, letterSpacing: "0.04em",
              cursor: "pointer", textTransform: "uppercase",
              transition: "opacity 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Nueva Entrega →
            </button>
          </div>

          {/* Registrar Envío */}
          <div style={{
            borderRadius: 16, overflow: "hidden", position: "relative",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            border: `1px solid rgba(99,102,241,0.3)`,
            padding: "28px 28px 20px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            minHeight: 160,
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(99,102,241,0.08)" }} />
            <div style={{ position: "absolute", top: 10, right: 10, opacity: 0.2 }}>
              <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                <rect x="5" y="25" width="45" height="35" rx="4" stroke="#818cf8" strokeWidth="2.5"/>
                <polygon points="50,32 66,32 75,45 75,60 50,60 50,32" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round"/>
                <circle cx="20" cy="65" r="7" stroke="#818cf8" strokeWidth="2.5"/>
                <circle cx="62" cy="65" r="7" stroke="#818cf8" strokeWidth="2.5"/>
              </svg>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.2)", borderRadius: 6, padding: "4px 10px", marginBottom: 10 }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", letterSpacing: "0.07em", textTransform: "uppercase" }}>Módulo envíos</span>
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                REGISTRAR<br />ENVÍO
              </h2>
            </div>

            <button onClick={() => setVista("envios")} style={{
              position: "relative", zIndex: 1,
              marginTop: 18, padding: "11px 0", borderRadius: 10,
              border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.15)",
              color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15, fontWeight: 800, letterSpacing: "0.04em",
              cursor: "pointer", textTransform: "uppercase",
              transition: "background 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}>
              Nuevo Envío →
            </button>
          </div>
        </div>

        {/* Historial de movimientos */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>

          {/* Header tabla */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.cardBorder}`, flexShrink: 0 }}>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 800, color: C.textPrimary, margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Historial Reciente de Movimientos
              </h3>
              <p style={{ fontSize: 11, color: C.textGhost, margin: 0, fontFamily: "'Barlow', sans-serif" }}>Últimas operaciones registradas en el sistema</p>
            </div>
            <span style={{ fontSize: 11, color: C.textGhost, background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 20, fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
              {movimientos.length} movimientos
            </span>
          </div>

          {/* Tabla */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  {["Status", "Guía ID", "Fecha", "Nombre", "Estado"].map(h => (
                    <th key={h} style={{
                      padding: "10px 20px", fontSize: 10, fontWeight: 700,
                      color: C.textGhost, textTransform: "uppercase", letterSpacing: "0.1em",
                      textAlign: "left", fontFamily: "'Barlow', sans-serif",
                      borderBottom: `1px solid ${C.cardBorder}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov, i) => (
                  <tr key={mov.id}
                    style={{ borderBottom: i < movimientos.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                    {/* Status con ícono */}
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <MovIcon tipo={mov.tipo} estado={mov.estado} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, fontFamily: "'Barlow', sans-serif" }}>
                          {mov.status}
                        </span>
                      </div>
                    </td>

                    {/* Guía */}
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: "'Barlow', sans-serif" }}>
                        {mov.guia}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 13, color: C.textSec, fontFamily: "'Barlow', sans-serif" }}>
                        {mov.fecha}
                      </span>
                    </td>

                    {/* Nombre */}
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 13, color: C.textSec, fontFamily: "'Barlow', sans-serif" }}>
                        {mov.nombre}
                      </span>
                    </td>

                    {/* Estado badge */}
                    <td style={{ padding: "12px 20px" }}>
                      <EstadoBadge estado={mov.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        select option { background: #1a1a1a; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ── Header compartido para todas las vistas ───────────────────────────────────
function AppHeader({ nombreUsuario, emailUsuario, showUserMenu, setShowUserMenu, handleLogout, IcoLogout, IcoUser, IcoChevron, IcoHome, vista, onHome }) {
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [setShowUserMenu]);

  return (
    <header style={{
      height: 60, flexShrink: 0,
      background: C.headerBg,
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
      display: "flex", alignItems: "center",
      padding: "0 40px", gap: 16, zIndex: 30,
    }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
        <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#fff" />
          </svg>
        </div>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>INTER</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.07em" }}>RAPIDÍSIMO</div>
        </div>
      </div>

      {/* Breadcrumb / nav de vista */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={onHome} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8,
          background: vista === "inicio" ? C.accentDim : "rgba(255,255,255,0.06)",
          border: `1px solid ${vista === "inicio" ? "rgba(255,107,0,0.3)" : "rgba(255,255,255,0.08)"}`,
          color: vista === "inicio" ? C.accent : C.textSec,
          cursor: "pointer", fontFamily: "'Barlow', sans-serif",
          fontSize: 13, fontWeight: vista === "inicio" ? 700 : 500,
          transition: "all 0.15s",
        }}>
          <IcoHome />
          <span>Inicio</span>
        </button>

        {vista !== "inicio" && (
          <>
            <span style={{ color: C.textGhost, fontSize: 14 }}>›</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: C.accentDim, border: `1px solid rgba(255,107,0,0.3)`,
              color: C.accent, fontFamily: "'Barlow', sans-serif",
              fontSize: 13, fontWeight: 700,
            }}>
              {vista === "entregas"
                ? <><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>Entregas</>
                : <><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>Envíos</>
              }
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Avatar + dropdown */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button onClick={() => setShowUserMenu(v => !v)} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none", cursor: "pointer",
          padding: "5px 10px", borderRadius: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: C.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 13, color: "#fff",
          }}>
            {nombreUsuario.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: "left", lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, fontFamily: "'Barlow', sans-serif" }}>{nombreUsuario}</div>
            <div style={{ fontSize: 10, color: C.textGhost, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Secretaria</div>
          </div>
          <IcoChevron />
        </button>

        {showUserMenu && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "#1a1a1a", border: `1px solid ${C.cardBorder}`,
            borderRadius: 12, padding: "8px 0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            minWidth: 200, zIndex: 100,
            animation: "fadeIn 0.15s ease",
          }}>
            {/* Info usuario */}
            <div style={{ padding: "10px 16px 12px", borderBottom: `1px solid ${C.cardBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 14, color: "#fff" }}>
                  {nombreUsuario.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, fontFamily: "'Barlow', sans-serif" }}>{nombreUsuario}</div>
                  <div style={{ fontSize: 11, color: C.textGhost, fontFamily: "'Barlow', sans-serif" }}>{emailUsuario}</div>
                </div>
              </div>
            </div>

            <button style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", background: "none", border: "none",
              cursor: "pointer", color: C.textPrimary,
              fontFamily: "'Barlow', sans-serif", fontSize: 13,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <IcoUser /><span>Mi perfil</span>
            </button>

            <div style={{ height: 1, background: C.cardBorder, margin: "4px 0" }} />

            <button onClick={handleLogout} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", background: "none", border: "none",
              cursor: "pointer", color: "#ef4444",
              fontFamily: "'Barlow', sans-serif", fontSize: 13,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <IcoLogout /><span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
