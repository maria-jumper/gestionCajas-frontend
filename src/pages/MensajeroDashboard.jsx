import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EntregasPage from "./EntregasPage";

const C = {
  bg:         "#0d0d0d",
  cardBg:     "#161616",
  cardBorder: "rgba(255,255,255,0.07)",
  accent:     "#FF6B00",
  accentDim:  "rgba(255,107,0,0.15)",
  headerBg:   "#0d0d0d",
  textPrimary:"#f0f4f8",
  textSec:    "#8a9bb0",
  textGhost:  "#4e6070",
  success:    "#10b981",
  successBg:  "rgba(16,185,129,0.12)",
  danger:     "#ef4444",
  dangerBg:   "rgba(239,68,68,0.1)",
  warning:    "#f59e0b",
  warningBg:  "rgba(245,158,11,0.1)",
  amber:      "#f59e0b",
  amberDim:   "rgba(245,158,11,0.15)",
};

const card = { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12 };

// ── Entregas asignadas demo ───────────────────────────────────────────────────
const ASIGNADAS_DEMO = [
  { id: 1, guia: "GUIA-12350", cliente: "Pedro Ramírez",   direccion: "Cra 15 #23-45, Bogotá",     estado: "No entregado" },
  { id: 2, guia: "GUIA-12351", cliente: "Sofía Herrera",   direccion: "Av. El Dorado #90-10",      estado: "No entregado" },
  { id: 3, guia: "GUIA-12352", cliente: "Miguel Torres",   direccion: "Calle 80 #68-30, Local 5",  estado: "Entregado"    },
  { id: 4, guia: "GUIA-12353", cliente: "Valentina Cruz",  direccion: "Carrera 7 #123-56, Apto 401",estado: "No entregado" },
];

const HISTORIAL_DEMO = [
  { id: 1, guia: "GUIA-12340", cliente: "Ana Morales",    fecha: "23/05/2024", estado: "Entregado" },
  { id: 2, guia: "GUIA-12341", cliente: "Luis Fernández", fecha: "23/05/2024", estado: "Entregado" },
  { id: 3, guia: "GUIA-12342", cliente: "Rosa Castillo",  fecha: "22/05/2024", estado: "No entregado" },
];

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

// ── Stat compacta ─────────────────────────────────────────────────────────────
function StatPill({ valor, label, color }) {
  return (
    <div style={{
      ...card, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 14, flex: 1,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>
          {color === C.success ? "✅" : color === C.danger ? "📦" : "🛵"}
        </span>
      </div>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{valor}</div>
        <div style={{ fontSize: 11, color: C.textGhost, marginTop: 2, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MENSAJERO DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function MensajeroDashboard({ onLogout }) {
  const { user, logout } = useAuth();
  const [vista,        setVista]        = useState("inicio");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [asignadas,    setAsignadas]    = useState(ASIGNADAS_DEMO);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const fn = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const nombreUsuario = user?.nombre || user?.username || "Mensajero";
  const emailUsuario  = user?.email  || `${(user?.username || "mensajero").toLowerCase()}@cajasflow.com`;
  const handleLogout  = () => { logout(); if (onLogout) onLogout(); };
  const volverAlInicio = () => setVista("inicio");

  const entregadas   = asignadas.filter(e => e.estado === "Entregado").length;
  const pendientes   = asignadas.filter(e => e.estado !== "Entregado").length;
  const total        = asignadas.length;

  // ── Módulo de entregas ────────────────────────────────────────────────────
  if (vista === "entregas") return (
    <div style={{ height: "100vh", overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Barlow', sans-serif" }}>
      <Header nombreUsuario={nombreUsuario} emailUsuario={emailUsuario} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} handleLogout={handleLogout} menuRef={menuRef} vista={vista} onHome={volverAlInicio} />
      <main style={{ flex: 1, padding: "20px 32px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <EntregasPage onVolver={volverAlInicio} />
      </main>
    </div>
  );

  // ── INICIO ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Barlow', sans-serif" }}>

      <Header nombreUsuario={nombreUsuario} emailUsuario={emailUsuario} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} handleLogout={handleLogout} menuRef={menuRef} vista={vista} onHome={volverAlInicio} />

      <main style={{ flex: 1, padding: "24px 40px 20px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0, gap: 18 }}>

        {/* Bienvenida */}
        <div style={{ flexShrink: 0 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, color: C.textPrimary, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
            ¡Hola, {nombreUsuario}! 🛵
          </h1>
          <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>
            {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })} · Ruta del día
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          <StatPill valor={total}      label="Asignadas hoy"  color={C.amber}   />
          <StatPill valor={entregadas} label="Completadas"    color={C.success} />
          <StatPill valor={pendientes} label="Pendientes"     color={C.danger}  />
        </div>

        {/* Grid principal: Acción + Asignadas */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", gap: 14, minHeight: 0 }}>

          {/* Card acción — Registrar Entrega */}
          <div style={{
            borderRadius: 16, overflow: "hidden", position: "relative",
            background: "linear-gradient(160deg, #FF6B00 0%, #c44e00 100%)",
            padding: "26px 24px 22px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            {/* Decoración */}
            <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "absolute", bottom: 60, right: 12, opacity: 0.15 }}>
              <svg viewBox="0 0 90 70" width="90" height="70" fill="none">
                <circle cx="20" cy="55" r="12" stroke="#fff" strokeWidth="3"/>
                <circle cx="70" cy="55" r="12" stroke="#fff" strokeWidth="3"/>
                <path d="M8 45h55V25l-15-18H8V45z" stroke="#fff" strokeWidth="3" strokeLinejoin="round"/>
                <path d="M55 45h25V35l-8-10h-17V45z" stroke="#fff" strokeWidth="3" strokeLinejoin="round"/>
              </svg>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "4px 10px", marginBottom: 12 }}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>Acción principal</span>
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 0.92, textTransform: "uppercase" }}>
                REGISTRAR<br />ENTREGA
              </h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: "10px 0 0", lineHeight: 1.4 }}>
                Escanea o digita la guía para confirmar una entrega completada.
              </p>
            </div>

            <button onClick={() => setVista("entregas")} style={{
              position: "relative", zIndex: 1,
              marginTop: 20, padding: "12px 0", borderRadius: 10,
              border: "none", background: "#fff",
              color: "#FF6B00", fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15, fontWeight: 900, letterSpacing: "0.04em",
              cursor: "pointer", textTransform: "uppercase",
              transition: "opacity 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Nueva Entrega →
            </button>
          </div>

          {/* Tabla de entregas asignadas hoy */}
          <div style={{ ...card, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.cardBorder}`, flexShrink: 0 }}>
              <div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Entregas asignadas hoy
                </h3>
                <p style={{ fontSize: 11, color: C.textGhost, margin: 0, fontFamily: "'Barlow', sans-serif" }}>
                  {pendientes} pendientes · {entregadas} completadas
                </p>
              </div>
              {/* Barra de progreso */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 100, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${total > 0 ? (entregadas / total) * 100 : 0}%`, height: "100%", background: C.success, borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textSec, fontFamily: "'Barlow', sans-serif" }}>
                  {total > 0 ? Math.round((entregadas / total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    {["Guía", "Cliente", "Dirección", "Estado"].map(h => (
                      <th key={h} style={{
                        padding: "10px 18px", fontSize: 10, fontWeight: 700,
                        color: C.textGhost, textTransform: "uppercase", letterSpacing: "0.1em",
                        textAlign: "left", fontFamily: "'Barlow', sans-serif",
                        borderBottom: `1px solid rgba(255,255,255,0.05)`,
                        position: "sticky", top: 0, background: C.cardBg, zIndex: 1,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {asignadas.map((e, i) => (
                    <tr key={e.id}
                      style={{ borderBottom: i < asignadas.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none", transition: "background 0.15s", opacity: e.estado === "Entregado" ? 0.55 : 1 }}
                      onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: "'Barlow', sans-serif" }}>
                        {e.guia}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 13, color: C.textPrimary, fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                        {e.cliente}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: C.textSec, fontFamily: "'Barlow', sans-serif", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        📍 {e.direccion}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <EstadoBadge estado={e.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Historial reciente */}
        <div style={{ ...card, flexShrink: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${C.cardBorder}` }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Historial Reciente de Movimientos
            </h3>
            <span style={{ fontSize: 11, color: C.textGhost, background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 20, fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
              {HISTORIAL_DEMO.length} registros
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Guía", "Cliente", "Fecha", "Estado"].map(h => (
                  <th key={h} style={{ padding: "9px 20px", fontSize: 10, fontWeight: 700, color: C.textGhost, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", fontFamily: "'Barlow', sans-serif", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORIAL_DEMO.map((h, i) => (
                <tr key={h.id}
                  style={{ borderBottom: i < HISTORIAL_DEMO.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: "'Barlow', sans-serif" }}>{h.guia}</td>
                  <td style={{ padding: "10px 20px", fontSize: 13, color: C.textSec, fontFamily: "'Barlow', sans-serif" }}>{h.cliente}</td>
                  <td style={{ padding: "10px 20px", fontSize: 13, color: C.textGhost, fontFamily: "'Barlow', sans-serif" }}>{h.fecha}</td>
                  <td style={{ padding: "10px 20px" }}><EstadoBadge estado={h.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ── Header compartido ─────────────────────────────────────────────────────────
function Header({ nombreUsuario, emailUsuario, showUserMenu, setShowUserMenu, handleLogout, menuRef, vista, onHome }) {
  return (
    <header style={{
      height: 60, flexShrink: 0,
      background: C.headerBg,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
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

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={onHome} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8,
          background: vista === "inicio" ? C.accentDim : "rgba(255,255,255,0.06)",
          border: `1px solid ${vista === "inicio" ? "rgba(255,107,0,0.3)" : "rgba(255,255,255,0.08)"}`,
          color: vista === "inicio" ? C.accent : "#8a9bb0",
          cursor: "pointer", fontFamily: "'Barlow', sans-serif",
          fontSize: 13, fontWeight: vista === "inicio" ? 700 : 500,
          transition: "all 0.15s",
        }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Inicio
        </button>
        {vista !== "inicio" && (
          <>
            <span style={{ color: "#4e6070", fontSize: 14 }}>›</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: C.accentDim, border: "1px solid rgba(255,107,0,0.3)",
              color: C.accent, fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 700,
            }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              Entregas
            </div>
          </>
        )}
      </div>

      {/* Badge rol mensajero */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
        <span style={{ fontSize: 12 }}>🛵</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>Mensajero</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Avatar */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button onClick={() => setShowUserMenu(v => !v)} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none", cursor: "pointer",
          padding: "5px 10px", borderRadius: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(245,158,11,0.25)", border: "2px solid rgba(245,158,11,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 13, color: C.amber,
          }}>
            {nombreUsuario.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: "left", lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f4f8", fontFamily: "'Barlow', sans-serif" }}>{nombreUsuario}</div>
            <div style={{ fontSize: 10, color: "#4e6070", fontFamily: "'Barlow', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Mensajero</div>
          </div>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4e6070" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {showUserMenu && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "8px 0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            minWidth: 210, zIndex: 100,
          }}>
            {/* Info */}
            <div style={{ padding: "10px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(245,158,11,0.2)", border: "2px solid rgba(245,158,11,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 14, color: C.amber }}>
                  {nombreUsuario.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f4f8", fontFamily: "'Barlow', sans-serif" }}>{nombreUsuario}</div>
                  <div style={{ fontSize: 11, color: "#4e6070", fontFamily: "'Barlow', sans-serif" }}>{emailUsuario}</div>
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
            <button onClick={handleLogout} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", background: "none", border: "none",
              cursor: "pointer", color: "#ef4444",
              fontFamily: "'Barlow', sans-serif", fontSize: 13,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
