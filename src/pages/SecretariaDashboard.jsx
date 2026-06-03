import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import EntregasPage from "./EntregasPage";
import EnviosPage from "./EnviosPage";
import PerfilPage from "./PerfilPage";

const C = {
  bg:         "#0d0d0d",
  cardBg:     "#1a1a1a",
  cardBorder: "rgba(255,255,255,0.07)",
  headerBg:   "#0d0d0d",
  accent:     "#FF6B00",
  accentDim:  "rgba(255,107,0,0.15)",
  textPrimary:"#f0f4f8",
  textSec:    "#8a9bb0",
  textGhost:  "#4e6070",
  success:    "#10b981",
  successBg:  "rgba(16,185,129,0.12)",
  danger:     "#ef4444",
  dangerBg:   "rgba(239,68,68,0.1)",
  warning:    "#f59e0b",
  warningBg:  "rgba(245,158,11,0.1)",
};

const MODULOS_INFO = {
  entregas:   { label:"Entregas",   emoji:"📦", desc:"Registra guías y completa entregas" },
  envios:     { label:"Envíos",     emoji:"🚚", desc:"Registra nuevos paquetes para enviar" },
  inventario: { label:"Inventario", emoji:"🗄️", desc:"Consulta el inventario del sistema" },
  informes:   { label:"Informes",   emoji:"📊", desc:"Reportes y métricas de operación" },
  gastos:     { label:"Gastos",     emoji:"💰", desc:"Registra gastos operativos" },
};

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:4000/api"
  : "https://api-gestion-cajas.onrender.com/api";

const MOVIMIENTOS_DEMO = [
  { id:1, tipo:"entrega", status:"Entrega Completada",  guia:"12345",     fecha:"24/05/2024", nombre:"Juan Fernández",    estado:"Entregado"    },
  { id:2, tipo:"envio",   status:"Envío Registrado",    guia:"ENV-0001",  fecha:"24/05/2024", nombre:"Distribuciones XYZ",estado:"No entregado" },
  { id:3, tipo:"entrega", status:"Entrega Pendiente",   guia:"GUIA-9821", fecha:"24/05/2024", nombre:"Carlos Ruiz",       estado:"No entregado" },
  { id:4, tipo:"envio",   status:"Envío Registrado",    guia:"ENV-0002",  fecha:"23/05/2024", nombre:"Empresa Sur",       estado:"Entregado"    },
];

function EstadoBadge({ estado }) {
  const ok = estado === "Entregado";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:ok?C.successBg:C.dangerBg, color:ok?C.success:C.danger, border:`1px solid ${ok?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:ok?C.success:C.danger }}/>{estado}
    </span>
  );
}

function MovIcon({ tipo, estado }) {
  const color = estado==="Entregado"?C.success:tipo==="envio"?"#6366f1":C.warning;
  const bg    = estado==="Entregado"?C.successBg:tipo==="envio"?"rgba(99,102,241,0.12)":C.warningBg;
  return (
    <div style={{ width:34, height:34, borderRadius:"50%", background:bg, border:`1.5px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
      {estado==="Entregado"
        ? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        : tipo==="envio"
        ? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        : <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function AppHeader({ user, nombreUsuario, emailUsuario, modulosActivos, showUserMenu, setShowUserMenu, handleLogout, onHome, vista, setVista }) {
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    const fn = e => { if(menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [setShowUserMenu]);

  return (
    <header style={{ height:60, flexShrink:0, background:C.headerBg, borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", padding:"0 28px", gap:16, zIndex:30 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, background:C.accent, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#fff"/></svg>
        </div>
        <div style={{ lineHeight:1 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:900, color:"#fff", textTransform:"uppercase" }}>INTER</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, color:C.accent, textTransform:"uppercase" }}>RAPIDÍSIMO</div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <button onClick={onHome} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:7, background:vista==="inicio"?C.accentDim:"rgba(255,255,255,0.06)", border:`1px solid ${vista==="inicio"?"rgba(255,107,0,0.3)":"rgba(255,255,255,0.08)"}`, color:vista==="inicio"?C.accent:C.textSec, cursor:"pointer", fontFamily:"'Barlow',sans-serif", fontSize:12, fontWeight:vista==="inicio"?700:500 }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Inicio
        </button>
        {vista!=="inicio" && vista!=="perfil" && (
          <><span style={{ color:C.textGhost, fontSize:13 }}>›</span>
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:7, background:C.accentDim, border:"1px solid rgba(255,107,0,0.3)", color:C.accent, fontFamily:"'Barlow',sans-serif", fontSize:12, fontWeight:700 }}>
            {MODULOS_INFO[vista]?.emoji} {MODULOS_INFO[vista]?.label||vista}
          </div></>
        )}
        {vista==="perfil" && (
          <><span style={{ color:C.textGhost, fontSize:13 }}>›</span>
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:7, background:C.accentDim, border:"1px solid rgba(255,107,0,0.3)", color:C.accent, fontFamily:"'Barlow',sans-serif", fontSize:12, fontWeight:700 }}>👤 Mi perfil</div></>
        )}
      </div>

      <div style={{ flex:1 }}/>

      {/* Avatar dropdown */}
      <div ref={menuRef} style={{ position:"relative" }}>
        <button onClick={()=>setShowUserMenu(v=>!v)}
          style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:8 }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13, color:"#fff" }}>
            {nombreUsuario.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign:"left", lineHeight:1.2 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary, fontFamily:"'Barlow',sans-serif" }}>{nombreUsuario}</div>
            <div style={{ fontSize:10, color:C.textGhost, fontFamily:"'Barlow',sans-serif", textTransform:"uppercase", letterSpacing:"0.06em" }}>Secretaria</div>
          </div>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.textGhost} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {showUserMenu && (
          <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"8px 0", boxShadow:"0 8px 24px rgba(0,0,0,0.5)", minWidth:220, zIndex:200, animation:"fadeIn 0.15s ease" }}>
            {/* Panel sesión */}
            <div style={{ padding:"12px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, color:"#fff", flexShrink:0 }}>{nombreUsuario.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'Barlow',sans-serif" }}>{nombreUsuario}</div>
                  <div style={{ fontSize:11, color:C.textGhost, fontFamily:"'Barlow',sans-serif" }}>{emailUsuario}</div>
                </div>
              </div>
              {[{ l:"Usuario", v:`@${user?.username||""}` },{ l:"Rol", v:"Secretaria 📋" },{ l:"Estado", v:"Activo ✓", c:"#10b981" }].map(r=>(
                <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"2px 0" }}>
                  <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'Barlow',sans-serif" }}>{r.l}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:r.c||C.textSec, fontFamily:"'Barlow',sans-serif" }}>{r.v}</span>
                </div>
              ))}
              {modulosActivos.length>0 && (
                <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize:10, color:C.textGhost, margin:"0 0 4px", fontFamily:"'Barlow',sans-serif", textTransform:"uppercase", letterSpacing:"0.06em" }}>Módulos activos</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                    {modulosActivos.map(k=>{ const m=MODULOS_INFO[k]; return m?<span key={k} style={{ fontSize:10, padding:"2px 6px", borderRadius:10, background:"rgba(255,107,0,0.1)", color:C.accent, fontFamily:"'Barlow',sans-serif" }}>{m.emoji} {m.label}</span>:null; })}
                  </div>
                </div>
              )}
            </div>
            <button onClick={()=>{ setVista("perfil"); setShowUserMenu(false); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:C.textPrimary, fontFamily:"'Barlow',sans-serif", fontSize:13 }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Mi perfil
            </button>
            <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"4px 0" }}/>
            <button onClick={handleLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontFamily:"'Barlow',sans-serif", fontSize:13 }} onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function SecretariaDashboard({ onLogout }) {
  const { user, logout, getToken } = useAuth();
  const [vista,        setVista]       = useState("inicio");
  const [showUserMenu, setShowUserMenu]= useState(false);
  const [movimientos]                  = useState(MOVIMIENTOS_DEMO);
  // Módulos: primero intenta leer del localStorage (actualizado por admin),
  // si no hay nada ahí, usa los del user del AuthContext
  const [modulosActivos, setModulosActivos] = useState(() => {
    if (user?.id) {
      const local = localStorage.getItem(`cf-modulos-${user.id}`);
      if (local) { try { return JSON.parse(local); } catch {} }
    }
    return user?.modulos || [];
  });

  const nombreUsuario = user?.nombre || user?.username || "Secretaria";
  const emailUsuario  = user?.email  || `${(user?.username||"secretaria").toLowerCase()}@cajasflow.com`;

  // Polling liviano: cada 30s verifica si el admin cambió los módulos
  useEffect(() => {
    if (!user?.id) return;
    const actualizar = async () => {
      try {
        const token = getToken?.();
        const res = await fetch(`${API_URL}/usuarios/${user.id}`, { headers:token?{Authorization:`Bearer ${token}`}:{} });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.modulos)) {
            setModulosActivos(data.modulos);
            localStorage.setItem(`cf-modulos-${user.id}`, JSON.stringify(data.modulos));
          }
        }
      } catch {}
    };
    actualizar();
    const interval = setInterval(actualizar, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout   = () => { logout(); if(onLogout) onLogout(); };
  const volverAlInicio = () => setVista("inicio");
  const tieneModulo    = k => modulosActivos.includes(k);

  const headerProps = { user, nombreUsuario, emailUsuario, modulosActivos, showUserMenu, setShowUserMenu, handleLogout, onHome:volverAlInicio, vista, setVista };

  if (vista==="entregas" && tieneModulo("entregas")) return (
    <div style={{ height:"100vh", overflow:"hidden", background:C.bg, display:"flex", flexDirection:"column" }}>
      <AppHeader {...headerProps}/>
      <main style={{ flex:1, padding:"20px 32px", overflow:"hidden", display:"flex", flexDirection:"column", minHeight:0 }}><EntregasPage onVolver={volverAlInicio}/></main>
    </div>
  );

  if (vista==="envios" && tieneModulo("envios")) return (
    <div style={{ height:"100vh", overflow:"hidden", background:C.bg, display:"flex", flexDirection:"column" }}>
      <AppHeader {...headerProps}/>
      <main style={{ flex:1, padding:"20px 32px", overflow:"hidden", display:"flex", flexDirection:"column", minHeight:0 }}><EnviosPage onVolver={volverAlInicio}/></main>
    </div>
  );

  if (vista==="perfil") return (
    <div style={{ height:"100vh", overflow:"hidden", background:C.bg, display:"flex", flexDirection:"column" }}>
      <AppHeader {...headerProps}/>
      <main style={{ flex:1, padding:"20px 32px", overflow:"hidden", display:"flex", flexDirection:"column", minHeight:0 }}><PerfilPage onVolver={volverAlInicio}/></main>
    </div>
  );

  // Si intentaron navegar a un módulo sin acceso, volver
  if (vista!=="inicio" && vista!=="perfil") setVista("inicio");

  return (
    <div style={{ height:"100vh", overflow:"hidden", background:C.bg, display:"flex", flexDirection:"column", fontFamily:"'Barlow',sans-serif" }}>
      <AppHeader {...headerProps}/>
      <main style={{ flex:1, padding:"24px 32px 20px", overflow:"hidden", display:"flex", flexDirection:"column", minHeight:0, gap:18 }}>

        <div style={{ flexShrink:0 }}>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>¡Bienvenida, {nombreUsuario}! 👋</h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0 }}>
            {modulosActivos.length>0 ? "¿Qué operación deseas realizar hoy?" : "Contacta al administrador para que te asigne módulos de acceso."}
          </p>
        </div>

        {/* Sin módulos */}
        {modulosActivos.length===0 ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, textAlign:"center" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(245,158,11,0.12)", border:"2px solid rgba(245,158,11,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>⚠️</div>
            <div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:"0 0 8px", textTransform:"uppercase" }}>Sin módulos asignados</h2>
              <p style={{ fontSize:13, color:C.textSec, margin:0, maxWidth:380, lineHeight:1.6 }}>No tienes acceso a ningún módulo. El administrador puede habilitarlos desde Gestión de Usuarios → Accesos.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de acción */}
            {(tieneModulo("entregas")||tieneModulo("envios")) && (
              <div style={{ flexShrink:0 }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.textGhost, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 10px" }}>Operaciones disponibles</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:14 }}>
                  {tieneModulo("entregas") && (
                    <div style={{ borderRadius:14, position:"relative", background:"linear-gradient(135deg,#FF6B00 0%,#e55200 100%)", padding:"22px 20px 18px", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:130 }}>
                      <div style={{ position:"absolute", top:-15, right:-15, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
                      <div style={{ position:"relative", zIndex:1 }}>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.15)", borderRadius:5, padding:"3px 8px", marginBottom:8 }}>
                          <span style={{ fontSize:10, fontWeight:700, color:"#fff", textTransform:"uppercase", letterSpacing:"0.07em" }}>📦 Entregas</span>
                        </div>
                        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:900, color:"#fff", margin:0, lineHeight:0.95, textTransform:"uppercase" }}>REGISTRAR<br/>ENTREGA</h2>
                      </div>
                      <button onClick={()=>setVista("entregas")} style={{ position:"relative", zIndex:1, marginTop:12, padding:"10px 0", borderRadius:8, border:"none", background:"#fff", color:"#FF6B00", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, textTransform:"uppercase", cursor:"pointer", transition:"opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                        Nueva Entrega →
                      </button>
                    </div>
                  )}
                  {tieneModulo("envios") && (
                    <div style={{ borderRadius:14, position:"relative", background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)", border:"1px solid rgba(99,102,241,0.3)", padding:"22px 20px 18px", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:130 }}>
                      <div style={{ position:"absolute", top:-15, right:-15, width:110, height:110, borderRadius:"50%", background:"rgba(99,102,241,0.08)" }}/>
                      <div style={{ position:"relative", zIndex:1 }}>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(99,102,241,0.2)", borderRadius:5, padding:"3px 8px", marginBottom:8 }}>
                          <span style={{ fontSize:10, fontWeight:700, color:"#818cf8", textTransform:"uppercase", letterSpacing:"0.07em" }}>🚚 Envíos</span>
                        </div>
                        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:900, color:"#fff", margin:0, lineHeight:0.95, textTransform:"uppercase" }}>REGISTRAR<br/>ENVÍO</h2>
                      </div>
                      <button onClick={()=>setVista("envios")} style={{ position:"relative", zIndex:1, marginTop:12, padding:"10px 0", borderRadius:8, border:"1px solid rgba(99,102,241,0.4)", background:"rgba(99,102,241,0.15)", color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, textTransform:"uppercase", cursor:"pointer", transition:"background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.28)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,0.15)"}>
                        Nuevo Envío →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Historial */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:14, overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderBottom:`1px solid ${C.cardBorder}`, flexShrink:0 }}>
                <div>
                  <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:800, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Historial reciente de movimientos</h3>
                  <p style={{ fontSize:11, color:C.textGhost, margin:0 }}>Últimas operaciones registradas</p>
                </div>
                <span style={{ fontSize:11, color:C.textGhost, background:"rgba(255,255,255,0.05)", padding:"3px 10px", borderRadius:20, fontWeight:600 }}>{movimientos.length} movimientos</span>
              </div>
              <div style={{ flex:1, overflowY:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"rgba(255,255,255,0.02)" }}>
                      {["Status","Guía ID","Fecha","Nombre","Estado"].map(h=>(
                        <th key={h} style={{ padding:"9px 16px", fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.1em", textAlign:"left", fontFamily:"'Barlow',sans-serif", borderBottom:`1px solid ${C.cardBorder}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((mov,i)=>(
                      <tr key={mov.id} style={{ borderBottom:i<movimientos.length-1?`1px solid rgba(255,255,255,0.03)`:"none", transition:"background 0.15s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"11px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}><MovIcon tipo={mov.tipo} estado={mov.estado}/><span style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:"'Barlow',sans-serif" }}>{mov.status}</span></div></td>
                        <td style={{ padding:"11px 16px" }}><span style={{ fontSize:13, fontWeight:700, color:C.accent, fontFamily:"'Barlow',sans-serif" }}>{mov.guia}</span></td>
                        <td style={{ padding:"11px 16px" }}><span style={{ fontSize:12, color:C.textSec, fontFamily:"'Barlow',sans-serif" }}>{mov.fecha}</span></td>
                        <td style={{ padding:"11px 16px" }}><span style={{ fontSize:12, color:C.textSec, fontFamily:"'Barlow',sans-serif" }}>{mov.nombre}</span></td>
                        <td style={{ padding:"11px 16px" }}><EstadoBadge estado={mov.estado}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      `}</style>
    </div>
  );
}