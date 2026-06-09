import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function useC() {
  const { isDark } = useTheme();
  return {
    bg:          isDark ? "#0d0d0d"  : "#f4f5f7",
    cardBg:      isDark ? "#161616"  : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    accent:      "#FF6B00",
    accentDim:   "rgba(255,107,0,0.12)",
    textPrimary: isDark ? "#f0f4f8"  : "#1a1d23",
    textSec:     isDark ? "#8a9bb0"  : "#5a6478",
    textGhost:   isDark ? "#4e6070"  : "#9aa5b4",
    inputBg:     isDark ? "#111111"  : "#f9fafb",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    hover:       isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    success:     "#10b981",
    successBg:   "rgba(16,185,129,0.10)",
    danger:      "#ef4444",
    dangerBg:    "rgba(239,68,68,0.10)",
    warning:     "#f59e0b",
    tableBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    isDark,
  };
}

const API = () => import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const hoy = () => new Date().toISOString().split("T")[0];
const fmtFecha = (d) => new Date(d).toLocaleDateString("es-CO", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
const fmtMoney = (n) => `$${Number(n||0).toLocaleString("es-CO")}`;

function useC_outer() { return useC(); }

// ── Stat card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, valor, sub, color, icono }) {
  const C = useC();
  return (
    <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"18px 20px", display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ width:46, height:46, borderRadius:10, background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{icono}</div>
      <div>
        <p style={{ fontSize:11, color:C.textGhost, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>{label}</p>
        <p style={{ fontSize:24, fontWeight:900, color:C.textPrimary, margin:0, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1 }}>{valor}</p>
        {sub && <p style={{ fontSize:11, color:C.textGhost, margin:"2px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Fila tabla ────────────────────────────────────────────────────────────────
function FilaSecretaria({ sec, idx }) {
  const C = useC();
  const [open, setOpen] = useState(false);
  const pct = sec.total_dia > 0 ? Math.round((sec.total_entregas / sec.total_dia) * 100) : 0;
  return (
    <>
      <tr style={{ borderBottom:`1px solid ${C.tableBorder}`, cursor:"pointer", transition:"background 0.12s" }}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e=>e.currentTarget.style.background=C.hover}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{ padding:"12px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:C.accent+"22", border:`2px solid ${C.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:C.accent, fontFamily:"'Barlow Condensed',sans-serif", flexShrink:0 }}>
              {(sec.nombre||"?").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{sec.nombre}</div>
              <div style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>@{sec.username}</div>
            </div>
          </div>
        </td>
        <td style={{ padding:"12px 16px", fontSize:13, color:C.textSec, fontFamily:"'DM Sans',sans-serif", textAlign:"center" }}>{sec.entregas_count}</td>
        <td style={{ padding:"12px 16px", fontSize:13, color:C.textSec, fontFamily:"'DM Sans',sans-serif", textAlign:"center" }}>{sec.envios_count}</td>
        <td style={{ padding:"12px 16px", textAlign:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.success, fontFamily:"'DM Sans',sans-serif" }}>{fmtMoney(sec.total_entregas)}</span>
        </td>
        <td style={{ padding:"12px 16px", textAlign:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#6366f1", fontFamily:"'DM Sans',sans-serif" }}>{fmtMoney(sec.total_envios)}</span>
        </td>
        <td style={{ padding:"12px 16px", textAlign:"center" }}>
          <span style={{ fontSize:15, fontWeight:900, color:C.accent, fontFamily:"'Barlow Condensed',sans-serif" }}>{fmtMoney(sec.total_dia)}</span>
        </td>
        <td style={{ padding:"12px 16px", textAlign:"center" }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.textGhost} strokeWidth="2" strokeLinecap="round" style={{ transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
        </td>
      </tr>
      {open && sec.movimientos?.length > 0 && (
        <tr>
          <td colSpan={7} style={{ padding:"0 16px 12px 56px", background:C.isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.015)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr>
                  {["Guía","Tipo","Valor","Método de pago","Hora"].map(h=>(
                    <th key={h} style={{ padding:"7px 10px", fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", textAlign:"left", borderBottom:`1px solid ${C.tableBorder}`, fontFamily:"'DM Sans',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sec.movimientos.map((m, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.tableBorder}` }}>
                    <td style={{ padding:"7px 10px", color:C.accent, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{m.guia}</td>
                    <td style={{ padding:"7px 10px" }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:m.tipo==="Entrega"?C.accentDim:"rgba(99,102,241,0.15)", color:m.tipo==="Entrega"?C.accent:"#818cf8", fontFamily:"'DM Sans',sans-serif" }}>{m.tipo}</span>
                    </td>
                    <td style={{ padding:"7px 10px", fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{fmtMoney(m.valor)}</td>
                    <td style={{ padding:"7px 10px", color:C.textSec, fontFamily:"'DM Sans',sans-serif" }}>{m.metodo_pago || "—"}</td>
                    <td style={{ padding:"7px 10px", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{m.hora || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function InformesPage({ onVolver }) {
  const { getToken } = useAuth();
  const C = useC();

  const [fecha,      setFecha]      = useState(hoy());
  const [datos,      setDatos]      = useState(null);
  const [cargando,   setCargando]   = useState(false);
  const [cerrado,    setCerrado]    = useState(false);
  const [confirmCierre, setConfirmCierre] = useState(false);

  const thS = { padding:"10px 16px", fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", textAlign:"left", borderBottom:`1px solid ${C.cardBorder}`, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" };

  const cargar = async (f) => {
    setCargando(true); setDatos(null); setCerrado(false);
    try {
      const token = getToken?.();
      const res = await fetch(`${API()}/informes/cierre-dia?fecha=${f}`, {
        headers: token ? { Authorization:`Bearer ${token}` } : {}
      });
      if (res.ok) {
        const d = await res.json();
        setDatos(d);
        setCerrado(!!d.cerrado);
      } else {
        // Si el backend no tiene este endpoint aún, mostrar estructura vacía
        setDatos({ secretarias:[], total_general:0, total_entregas:0, total_envios:0, total_gastos:0, fecha:f, cerrado:false });
      }
    } catch {
      setDatos({ secretarias:[], total_general:0, total_entregas:0, total_envios:0, total_gastos:0, fecha:f, cerrado:false });
    }
    setCargando(false);
  };

  useEffect(() => { cargar(fecha); }, [fecha]);

  const cerrarCaja = async () => {
    try {
      const token = getToken?.();
      await fetch(`${API()}/informes/cierre-dia`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ fecha, datos })
      });
    } catch {}
    setCerrado(true);
    setConfirmCierre(false);
    setDatos(d => d ? { ...d, cerrado:true } : d);
  };

  const totalGeneral   = datos?.total_general   || 0;
  const totalEntregas  = datos?.total_entregas  || 0;
  const totalEnvios    = datos?.total_envios    || 0;
  const totalGastos    = datos?.total_gastos    || 0;
  const neto           = totalGeneral - totalGastos;
  const secretarias    = datos?.secretarias     || [];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, overflow:"hidden" }}>

      {/* Título */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0, marginBottom:16, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900, color:C.textPrimary, margin:"0 0 2px", textTransform:"uppercase" }}>Informes · Cierre de Caja</h1>
          <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Resumen diario de operaciones por secretaria</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          {/* Selector de fecha */}
          <input type="date" value={fecha} max={hoy()} onChange={e=>setFecha(e.target.value)}
            style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer" }}/>
          <button onClick={()=>cargar(fecha)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.hover, color:C.textSec, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Actualizar
          </button>
          {!cerrado && datos && (
            <button onClick={()=>setConfirmCierre(true)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase", letterSpacing:"0.05em" }}
              onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
              🔒 Cerrar caja del día
            </button>
          )}
          {cerrado && (
            <span style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, background:C.successBg, color:C.success, border:`1px solid rgba(16,185,129,0.3)`, fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
              ✓ Caja cerrada
            </span>
          )}
        </div>
      </div>

      {/* Fecha legible */}
      <div style={{ flexShrink:0, marginBottom:14 }}>
        <p style={{ fontSize:13, fontWeight:700, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize" }}>
          📅 {fmtFecha(fecha + "T12:00:00")}
          {fecha === hoy() && <span style={{ marginLeft:8, fontSize:11, padding:"2px 8px", borderRadius:20, background:"rgba(255,107,0,0.12)", color:C.accent, fontWeight:700 }}>Hoy</span>}
        </p>
      </div>

      {cargando ? (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.textGhost, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>
          Cargando información del día...
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, gap:14, overflow:"hidden" }}>

          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, flexShrink:0 }}>
            <KpiCard label="Total entregas" valor={fmtMoney(totalEntregas)} sub="Cobrado en entregas" color={C.accent}
              icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}/>
            <KpiCard label="Total envíos" valor={fmtMoney(totalEnvios)} sub="Cobrado en envíos" color="#6366f1"
              icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16"/></svg>}/>
            <KpiCard label="Gastos del día" valor={fmtMoney(totalGastos)} sub="Gastos registrados" color={C.danger}
              icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}/>
            <KpiCard label="Neto del día" valor={fmtMoney(neto)} sub="Ingresos − Gastos" color={C.success}
              icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}/>
          </div>

          {/* Tabla secretarias */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.cardBorder}`, flexShrink:0, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Detalle por secretaria</h3>
              <span style={{ fontSize:12, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Haz clic en una fila para ver sus movimientos</span>
            </div>
            <div style={{ flex:1, overflow:"auto" }}>
              {secretarias.length === 0 ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:10, padding:"40px", textAlign:"center" }}>
                  <div style={{ fontSize:40 }}>📋</div>
                  <p style={{ fontSize:14, fontWeight:700, color:C.textPrimary, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Sin operaciones registradas</p>
                  <p style={{ fontSize:12, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>No hay entregas ni envíos registrados para este día.</p>
                </div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {["Secretaria","Entregas","Envíos","$ Entregas","$ Envíos","Total día",""].map((h,i)=>(
                        <th key={i} style={{ ...thS, textAlign:i===0?"left":"center" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {secretarias.map((sec, i) => <FilaSecretaria key={sec.id||i} sec={sec} idx={i}/>)}
                  </tbody>
                  <tfoot>
                    <tr style={{ background:C.isDark?"rgba(255,107,0,0.06)":"rgba(255,107,0,0.04)", borderTop:`2px solid ${C.accent}30` }}>
                      <td style={{ padding:"12px 16px", fontWeight:900, color:C.textPrimary, fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, textTransform:"uppercase" }}>TOTAL GENERAL</td>
                      <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{secretarias.reduce((s,x)=>s+(x.entregas_count||0),0)}</td>
                      <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{secretarias.reduce((s,x)=>s+(x.envios_count||0),0)}</td>
                      <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:C.success, fontFamily:"'DM Sans',sans-serif" }}>{fmtMoney(totalEntregas)}</td>
                      <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:"#6366f1", fontFamily:"'DM Sans',sans-serif" }}>{fmtMoney(totalEnvios)}</td>
                      <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:900, color:C.accent, fontFamily:"'Barlow Condensed',sans-serif", fontSize:16 }}>{fmtMoney(totalGeneral)}</td>
                      <td/>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>

          {/* Resumen cierre */}
          <div style={{ flexShrink:0, background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"16px 20px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textGhost, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Resumen de cierre</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10 }}>
              {[
                { l:"Ingresos totales", v:fmtMoney(totalGeneral),  c:C.textPrimary },
                { l:"− Gastos",         v:fmtMoney(totalGastos),   c:C.danger },
                { l:"= Neto del día",   v:fmtMoney(neto),          c:C.success, big:true },
              ].map(item=>(
                <div key={item.l} style={{ padding:"10px 14px", borderRadius:8, background:C.hover }}>
                  <p style={{ fontSize:11, color:C.textGhost, margin:"0 0 3px", fontFamily:"'DM Sans',sans-serif" }}>{item.l}</p>
                  <p style={{ fontSize:item.big?20:15, fontWeight:900, color:item.c, margin:0, fontFamily:"'Barlow Condensed',sans-serif" }}>{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar cierre */}
      {confirmCierre && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:16, maxWidth:420, width:"100%", padding:"28px" }}>
            <div style={{ textAlign:"center", marginBottom:18 }}>
              <div style={{ fontSize:44, marginBottom:10 }}>🔒</div>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:"0 0 8px", textTransform:"uppercase" }}>¿Cerrar caja del día?</h3>
              <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
                Se registrará el cierre del <strong style={{ color:C.textPrimary }}>{fmtFecha(fecha+"T12:00:00")}</strong> con un total de <strong style={{ color:C.accent }}>{fmtMoney(totalGeneral)}</strong> en operaciones y un neto de <strong style={{ color:C.success }}>{fmtMoney(neto)}</strong>.
              </p>
            </div>
            <div style={{ background:C.hover, borderRadius:8, padding:"12px 14px", marginBottom:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Ingresos</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{fmtMoney(totalGeneral)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Gastos</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.danger, fontFamily:"'DM Sans',sans-serif" }}>− {fmtMoney(totalGastos)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:`1px solid ${C.cardBorder}` }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>Neto</span>
                <span style={{ fontSize:16, fontWeight:900, color:C.success, fontFamily:"'Barlow Condensed',sans-serif" }}>{fmtMoney(neto)}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmCierre(false)} style={{ flex:1, padding:"11px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={cerrarCaja} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase" }}
                onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                Confirmar cierre
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`select option{background:${C.isDark?"#161616":"#fff"};color:${C.isDark?"#f0f4f8":"#1a1d23"};} input[type="date"]::-webkit-calendar-picker-indicator{filter:${C.isDark?"invert(1)":"none"};opacity:0.6;cursor:pointer;}`}</style>
    </div>
  );
}
