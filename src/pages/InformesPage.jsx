import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { getCierreDia, cerrarCaja as apiCerrarCaja } from "../api";

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
    warning:     "#f59e0b",
    tableBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    isDark,
  };
}

const hoy      = () => new Date().toISOString().split("T")[0];
const fmtFecha = (d) => new Date(d).toLocaleDateString("es-CO", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
const fmtMoney = (n) => `$${Number(n||0).toLocaleString("es-CO")}`;

// Convierte hora UTC "HH:mm" a hora Colombia (UTC-5)
const fmtHoraColombia = (hora) => {
  if (!hora) return "—";
  try {
    const [h, m] = hora.split(':').map(Number);
    const utc = new Date();
    utc.setUTCHours(h, m, 0, 0);
    return utc.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', timeZone:'America/Bogota' });
  } catch { return hora; }
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, valor, sub, color, icono }) {
  const C = useC();
  return (
    <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:42, height:42, borderRadius:10, background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{icono}</div>
      <div>
        <p style={{ fontSize:11, color:C.textGhost, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>{label}</p>
        <p style={{ fontSize:22, fontWeight:900, color:C.textPrimary, margin:0, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1 }}>{valor}</p>
        {sub && <p style={{ fontSize:11, color:C.textGhost, margin:"2px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Tarjeta de operador (admin o secretaria) ──────────────────────────────────
function TarjetaOperador({ op, onVerDetalle }) {
  const C = useC();
  const esAdmin = op.rol === "admin" || op.rol === "administrador";
  const color   = esAdmin ? "#6366f1" : "#10b981";

  return (
    <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:38, height:38, borderRadius:"50%", background:color+"22", border:`2px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color, fontFamily:"'Barlow Condensed',sans-serif", flexShrink:0 }}>
          {(op.nombre||"?").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{op.nombre}</div>
          <div style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>
            @{op.username} · <span style={{ color, fontWeight:600 }}>{esAdmin ? "Administrador" : "Secretaria"}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { l:"Entregas", v:op.entregas_count || 0, c:C.accent },
          { l:"Envíos",   v:op.envios_count   || 0, c:"#6366f1" },
          { l:"Total",    v:fmtMoney(op.total_dia), c:C.success, big:true },
        ].map(s => (
          <div key={s.l} style={{ background:C.hover, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:10, color:C.textGhost, margin:"0 0 2px", fontFamily:"'DM Sans',sans-serif", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.l}</p>
            <p style={{ fontSize:s.big?15:18, fontWeight:900, color:s.c, margin:0, fontFamily:"'Barlow Condensed',sans-serif" }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Desglose */}
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:"'DM Sans',sans-serif", padding:"8px 0", borderTop:`1px solid ${C.cardBorder}` }}>
        <span style={{ color:C.textGhost }}>Efectivo</span>
        <span style={{ color:C.textPrimary, fontWeight:600 }}>{fmtMoney(op.total_efectivo)}</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:"'DM Sans',sans-serif", marginTop:-8 }}>
        <span style={{ color:C.textGhost }}>Transferencias</span>
        <span style={{ color:C.textPrimary, fontWeight:600 }}>{fmtMoney(op.total_transferencia)}</span>
      </div>

      {op.movimientos?.length > 0 && (
        <button onClick={() => onVerDetalle(op)}
          style={{ padding:"7px", borderRadius:7, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textSec, fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer", outline:"none" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.hover}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          Ver {op.movimientos.length} movimiento{op.movimientos.length>1?"s":""}
        </button>
      )}
    </div>
  );
}

// ── Modal detalle de movimientos ──────────────────────────────────────────────
function ModalDetalle({ op, onCerrar }) {
  const C = useC();
  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:600, maxHeight:"80vh", display:"flex", flexDirection:"column", padding:"24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexShrink:0 }}>
          <div>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Movimientos — {op.nombre}</h3>
            <p style={{ fontSize:12, color:C.textGhost, margin:"2px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{op.movimientos.length} operaciones · Total: {fmtMoney(op.total_dia)}</p>
          </div>
          <button onClick={onCerrar} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:24, outline:"none" }}>×</button>
        </div>
        <div style={{ flex:1, overflow:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>{["Guía","Tipo","Valor","Método","Hora"].map(h=>(
                <th key={h} style={{ padding:"8px 12px", fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", textAlign:"left", borderBottom:`1px solid ${C.cardBorder}`, fontFamily:"'DM Sans',sans-serif" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {op.movimientos.map((m,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.tableBorder}` }}>
                  <td style={{ padding:"9px 12px", color:C.accent, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{m.guia}</td>
                  <td style={{ padding:"9px 12px" }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:m.tipo==="Entrega"?C.accentDim:"rgba(99,102,241,0.15)", color:m.tipo==="Entrega"?C.accent:"#818cf8", fontFamily:"'DM Sans',sans-serif" }}>{m.tipo}</span>
                  </td>
                  <td style={{ padding:"9px 12px", fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{fmtMoney(m.valor)}</td>
                  <td style={{ padding:"9px 12px", color:C.textSec, fontFamily:"'DM Sans',sans-serif" }}>{m.metodo_pago||"—"}</td>
                  <td style={{ padding:"9px 12px", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{fmtHoraColombia(m.hora)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={onCerrar} style={{ marginTop:14, padding:"10px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none", flexShrink:0 }}
          onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cerrar</button>
      </div>
    </div>
  );
}

// ── Modal cierre de caja ──────────────────────────────────────────────────────
function ModalCierreCaja({ fecha, datos, onConfirmar, onCerrar }) {
  const C = useC();
  const operadores = datos?.secretarias || [];
  // Efectivo contado por operador
  const [efectivos, setEfectivos] = useState(() => {
    const init = {};
    operadores.forEach(op => { init[op.id] = ""; });
    return init;
  });
  const [paso, setPaso] = useState("ingresar"); // "ingresar" | "preview"

  const setEfectivo = (id, val) => setEfectivos(p => ({ ...p, [id]: val }));

  const totalGeneral     = datos?.total_general  || 0;
  const totalGastos      = datos?.total_gastos   || 0;
  const neto             = totalGeneral - totalGastos;

  const resumenOperadores = operadores.map(op => {
    const efectivoEsperado = op.total_efectivo || 0;
    const efectivoContado  = parseFloat(efectivos[op.id]) || 0;
    const diferencia       = efectivoContado - efectivoEsperado;
    return { ...op, efectivoEsperado, efectivoContado, diferencia };
  });

  const totalContado  = resumenOperadores.reduce((s, o) => s + o.efectivoContado, 0);
  const totalEsperado = resumenOperadores.reduce((s, o) => s + o.efectivoEsperado, 0);
  const diferenciaTotal = totalContado - totalEsperado;

  if (paso === "ingresar") return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:500, maxHeight:"85vh", display:"flex", flexDirection:"column", padding:"28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6, flexShrink:0 }}>
          <div>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>🔒 Cierre de caja</h3>
            <p style={{ fontSize:12, color:C.textGhost, margin:"3px 0 0", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize" }}>{fmtFecha(fecha+"T12:00:00")}</p>
          </div>
          <button onClick={onCerrar} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:24, outline:"none" }}>×</button>
        </div>

        <p style={{ fontSize:13, color:C.textSec, margin:"0 0 16px", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
          Ingresa el efectivo contado entregado por cada operador:
        </p>

        <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
          {operadores.map(op => (
            <div key={op.id} style={{ background:C.hover, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <span style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{op.nombre}</span>
                  <span style={{ fontSize:11, color:C.textGhost, marginLeft:8, fontFamily:"'DM Sans',sans-serif" }}>Efectivo esperado: <strong style={{ color:C.accent }}>{fmtMoney(op.total_efectivo||0)}</strong></span>
                </div>
              </div>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.textGhost, fontSize:14, fontWeight:700 }}>$</span>
                <input
                  type="number" min="0" placeholder="0"
                  value={efectivos[op.id]}
                  onChange={e => setEfectivo(op.id, e.target.value)}
                  style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px 10px 28px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:15, fontWeight:700, outline:"none", fontFamily:"'Barlow Condensed',sans-serif" }}
                  onFocus={e=>e.target.style.borderColor=C.accent}
                  onBlur={e=>e.target.style.borderColor=C.inputBorder}
                />
              </div>
              {efectivos[op.id] !== "" && (
                <p style={{ fontSize:11, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif",
                  color: (parseFloat(efectivos[op.id])||0) >= (op.total_efectivo||0) ? C.success : C.danger }}>
                  {(parseFloat(efectivos[op.id])||0) >= (op.total_efectivo||0)
                    ? `✓ Sobran ${fmtMoney((parseFloat(efectivos[op.id])||0) - (op.total_efectivo||0))}`
                    : `⚠ Faltan ${fmtMoney((op.total_efectivo||0) - (parseFloat(efectivos[op.id])||0))}`}
                </p>
              )}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, flexShrink:0 }}>
          <button onClick={onCerrar} style={{ flex:1, padding:"11px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
          <button onClick={() => setPaso("preview")}
            style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase" }}
            onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
            Ver resumen →
          </button>
        </div>
      </div>
    </div>
  );

  // ── PREVIEW DEL CIERRE ────────────────────────────────────────────────────
  const imprimirCierre = () => {
    const win = window.open('', '_blank', 'width=800,height=900');
    const fecha_str = fmtFecha(fecha + "T12:00:00");
    const filas_ops = resumenOperadores.map(op => `
      <div class="operador">
        <div class="op-header">
          <strong>${op.nombre}</strong>
          <span class="rol-badge">${op.rol === 'admin' ? 'Administrador' : 'Secretaria'}</span>
        </div>
        <table>
          <tr><td>Entregas realizadas</td><td>${op.entregas_count || 0} ops · ${fmtMoney(op.total_entregas)}</td></tr>
          <tr><td>Envíos realizados</td><td>${op.envios_count || 0} ops · ${fmtMoney(op.total_envios)}</td></tr>
          <tr><td><strong>Total generado</strong></td><td><strong>${fmtMoney(op.total_dia)}</strong></td></tr>
          <tr><td>Efectivo esperado</td><td>${fmtMoney(op.efectivoEsperado)}</td></tr>
          <tr><td>Efectivo entregado</td><td>${fmtMoney(op.efectivoContado)}</td></tr>
          <tr class="${op.diferencia >= 0 ? 'verde' : 'rojo'}">
            <td><strong>${op.diferencia >= 0 ? 'Sobran' : 'Faltan'}</strong></td>
            <td><strong>${fmtMoney(Math.abs(op.diferencia))}</strong></td>
          </tr>
        </table>
      </div>
    `).join('');

    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Cierre de Caja - ${fecha}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: white; padding: 32px; max-width: 700px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #111; }
    .header h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .header h2 { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .header p { font-size: 12px; color: #555; text-transform: capitalize; }
    .operador { margin-bottom: 18px; padding: 14px; border: 1px solid #ddd; border-radius: 6px; }
    .op-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .op-header strong { font-size: 15px; }
    .rol-badge { font-size: 10px; background: #f0f0f0; padding: 2px 8px; border-radius: 10px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    tr { border-bottom: 1px solid #eee; }
    td { padding: 5px 4px; }
    td:first-child { color: #555; }
    td:last-child { text-align: right; font-weight: 500; }
    .verde td { color: #059669; }
    .rojo td { color: #dc2626; }
    .totales { margin-top: 20px; padding: 16px; border: 2px solid #FF6B00; border-radius: 6px; }
    .totales h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; color: #FF6B00; }
    .totales table { border-collapse: collapse; width: 100%; }
    .totales tr { border-bottom: 1px solid #ffe4cc; }
    .totales td { padding: 5px 4px; }
    .totales td:last-child { text-align: right; }
    .total-neto td { font-size: 16px; font-weight: 900; color: #059669; }
    .total-dif td { font-size: 14px; font-weight: 700; }
    .falta td { color: #dc2626; }
    .sobra td { color: #059669; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
    @media print {
      body { padding: 16px; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Inter Rapidísimo</h1>
    <h2>Cierre de Caja</h2>
    <p>${fecha_str}</p>
  </div>

  ${filas_ops}

  <div class="totales">
    <h3>Resumen Global</h3>
    <table>
      <tr><td>Total ingresos del día</td><td><strong>${fmtMoney(totalGeneral)}</strong></td></tr>
      <tr><td>Total transferencias</td><td>${fmtMoney(datos?.total_transferencias || 0)}</td></tr>
      <tr><td>Total efectivo esperado</td><td>${fmtMoney(totalEsperado)}</td></tr>
      <tr><td>Total efectivo contado</td><td>${fmtMoney(totalContado)}</td></tr>
      <tr><td>Gastos del día</td><td>- ${fmtMoney(totalGastos)}</td></tr>
      <tr class="total-neto"><td>Neto del día</td><td>${fmtMoney(neto)}</td></tr>
      <tr class="total-dif ${diferenciaTotal >= 0 ? 'sobra' : 'falta'}">
        <td>${diferenciaTotal >= 0 ? 'Total Sobra' : 'Total Falta'}</td>
        <td>${fmtMoney(Math.abs(diferenciaTotal))}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <span>Generado: ${new Date().toLocaleString('es-CO')}</span>
    <span>CajasFlow · Inter Rapidísimo</span>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:560, maxHeight:"90vh", display:"flex", flexDirection:"column", padding:"28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexShrink:0 }}>
          <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Resumen de Cierre</h3>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={imprimirCierre}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.hover, color:C.textSec, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", outline:"none" }}>
              🖨️ Imprimir
            </button>
            <button onClick={onCerrar} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:24, outline:"none" }}>×</button>
          </div>
        </div>

        {/* Contenido imprimible */}
        <div id="cierre-print" style={{ flex:1, overflow:"auto" }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:C.textPrimary }}>
            {/* Encabezado */}
            <div style={{ textAlign:"center", marginBottom:20, paddingBottom:12, borderBottom:`2px solid ${C.cardBorder}` }}>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900, margin:"0 0 4px", textTransform:"uppercase" }}>Inter Rapidísimo</h2>
              <p style={{ fontSize:14, fontWeight:700, margin:0, textTransform:"uppercase", letterSpacing:"0.05em" }}>Cierre de Caja</p>
              <p style={{ fontSize:12, color:C.textSec, margin:"4px 0 0", textTransform:"capitalize" }}>{fmtFecha(fecha+"T12:00:00")}</p>
            </div>

            {/* Por operador */}
            {resumenOperadores.map((op, i) => (
              <div key={op.id} style={{ marginBottom:16, padding:"12px 14px", borderRadius:8, background:C.hover, border:`1px solid ${C.cardBorder}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:700 }}>{op.nombre}</span>
                  <span style={{ fontSize:11, color:C.textGhost }}>{op.rol === "admin" ? "Administrador" : "Secretaria"}</span>
                </div>
                {[
                  { l:"Entregas realizadas",  v:`${op.entregas_count||0} ops · ${fmtMoney(op.total_entregas)}` },
                  { l:"Envíos realizados",    v:`${op.envios_count||0} ops · ${fmtMoney(op.total_envios)}` },
                  { l:"Total generado",       v:fmtMoney(op.total_dia),    bold:true },
                  { l:"Efectivo esperado",    v:fmtMoney(op.efectivoEsperado) },
                  { l:"Efectivo entregado",   v:fmtMoney(op.efectivoContado) },
                  { l:op.diferencia >= 0 ? "Sobran" : "Faltan", v:fmtMoney(Math.abs(op.diferencia)), color:op.diferencia >= 0 ? C.success : C.danger, bold:true },
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:`1px solid ${C.tableBorder}` }}>
                    <span style={{ fontSize:12, color:C.textGhost }}>{r.l}</span>
                    <span style={{ fontSize:13, fontWeight:r.bold?700:400, color:r.color||C.textPrimary }}>{r.v}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Totales globales */}
            <div style={{ background:C.isDark?"rgba(255,107,0,0.08)":"rgba(255,107,0,0.05)", border:`1px solid rgba(255,107,0,0.2)`, borderRadius:8, padding:"14px 16px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.accent, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Resumen Global</p>
              {[
                { l:"Total ingresos del día",  v:fmtMoney(totalGeneral), c:C.textPrimary },
                { l:"Total transferencias",    v:fmtMoney(datos?.total_transferencias||0), c:"#6366f1" },
                { l:"Total efectivo esperado", v:fmtMoney(totalEsperado), c:C.textPrimary },
                { l:"Total efectivo contado",  v:fmtMoney(totalContado),  c:C.textPrimary },
                { l:"Gastos del día",          v:`- ${fmtMoney(totalGastos)}`, c:C.danger },
                { l:"Neto del día",            v:fmtMoney(neto),          c:C.success, big:true },
                { l:diferenciaTotal>=0?"Total Sobra":"Total Falta", v:fmtMoney(Math.abs(diferenciaTotal)), c:diferenciaTotal>=0?C.success:C.danger, big:true },
              ].map(r => (
                <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid rgba(255,107,0,0.1)` }}>
                  <span style={{ fontSize:12, color:C.textSec }}>{r.l}</span>
                  <span style={{ fontSize:r.big?16:13, fontWeight:r.big?900:600, color:r.c, fontFamily:r.big?"'Barlow Condensed',sans-serif":"'DM Sans',sans-serif" }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:16, flexShrink:0 }}>
          <button onClick={() => setPaso("ingresar")} style={{ flex:1, padding:"11px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
          <button onClick={imprimirCierre} style={{ padding:"11px 18px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.hover, color:C.textSec, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}>
            🖨️ Imprimir
          </button>
          <button onClick={() => onConfirmar(resumenOperadores, { totalContado, totalEsperado, diferenciaTotal })}
            style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase" }}
            onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
            Confirmar cierre ✓
          </button>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #cierre-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; background: white; color: black; padding: 20px; }
          #cierre-print * { color: black !important; background: white !important; border-color: #ccc !important; }
        }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function InformesPage({ onVolver }) {
  const C = useC();

  const [fecha,         setFecha]         = useState(hoy());
  const [datos,         setDatos]         = useState(null);
  const [cargando,      setCargando]      = useState(false);
  const [cerrado,       setCerrado]       = useState(false);
  const [modalCierre,   setModalCierre]   = useState(false);
  const [detalleOp,     setDetalleOp]     = useState(null);

  const cargar = async (f) => {
    setCargando(true); setDatos(null); setCerrado(false);
    try {
      const d = await getCierreDia(f);
      if (d && !d.error) { setDatos(d); setCerrado(!!d.cerrado); }
      else setDatos({ secretarias:[], total_general:0, total_entregas:0, total_envios:0, total_gastos:0, fecha:f, cerrado:false });
    } catch {
      setDatos({ secretarias:[], total_general:0, total_entregas:0, total_envios:0, total_gastos:0, fecha:f, cerrado:false });
    }
    setCargando(false);
  };

  useEffect(() => { cargar(fecha); }, [fecha]);

  const confirmarCierre = async (resumenOps, totales) => {
    try {
      await apiCerrarCaja({ fecha, datos: { ...datos, resumenOps, ...totales } });
    } catch {}
    setCerrado(true);
    setModalCierre(false);
    setDatos(d => d ? { ...d, cerrado:true } : d);
  };

  const totalGeneral  = datos?.total_general  || 0;
  const totalEntregas = datos?.total_entregas || 0;
  const totalEnvios   = datos?.total_envios   || 0;
  const totalGastos   = datos?.total_gastos   || 0;
  const neto          = totalGeneral - totalGastos;
  const operadores    = datos?.secretarias    || [];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, overflow:"hidden" }}>

      {/* Título */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0, marginBottom:16, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900, color:C.textPrimary, margin:"0 0 2px", textTransform:"uppercase" }}>Informes · Cierre de Caja</h1>
          <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Resumen diario por operador — admin y secretarias</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <input type="date" value={fecha} max={hoy()} onChange={e=>setFecha(e.target.value)}
            style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer" }}/>
          <button onClick={()=>cargar(fecha)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.hover, color:C.textSec, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Actualizar
          </button>
          {!cerrado && datos && operadores.length > 0 && (
            <button onClick={() => setModalCierre(true)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase", letterSpacing:"0.05em" }}
              onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
              🔒 Cerrar caja del día
            </button>
          )}
          {cerrado && (
            <span style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, background:C.successBg, color:C.success, border:"1px solid rgba(16,185,129,0.3)", fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
              ✓ Caja cerrada
            </span>
          )}
        </div>
      </div>

      {/* Fecha */}
      <p style={{ fontSize:13, fontWeight:700, color:C.textSec, margin:"0 0 14px", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize", flexShrink:0 }}>
        📅 {fmtFecha(fecha+"T12:00:00")}
        {fecha === hoy() && <span style={{ marginLeft:8, fontSize:11, padding:"2px 8px", borderRadius:20, background:"rgba(255,107,0,0.12)", color:C.accent, fontWeight:700 }}>Hoy</span>}
      </p>

      {cargando ? (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Cargando información del día...</div>
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, gap:14, overflow:"hidden" }}>

          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, flexShrink:0 }}>
            <KpiCard label="Total entregas" valor={fmtMoney(totalEntregas)} sub="Cobrado" color={C.accent}
              icono={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}/>
            <KpiCard label="Total envíos" valor={fmtMoney(totalEnvios)} sub="Cobrado" color="#6366f1"
              icono={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16"/></svg>}/>
            <KpiCard label="Gastos del día" valor={fmtMoney(totalGastos)} sub="Registrados" color={C.danger}
              icono={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}/>
            <KpiCard label="Neto del día" valor={fmtMoney(neto)} sub="Ingresos − Gastos" color={C.success}
              icono={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}/>
          </div>

          {/* Tarjetas por operador */}
          <div style={{ flex:1, overflow:"auto" }}>
            {operadores.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:10, textAlign:"center", padding:"40px" }}>
                <div style={{ fontSize:44 }}>📋</div>
                <p style={{ fontSize:15, fontWeight:700, color:C.textPrimary, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Sin operaciones registradas</p>
                <p style={{ fontSize:12, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>No hay entregas ni envíos para este día.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14, paddingBottom:8 }}>
                {operadores.map((op, i) => (
                  <TarjetaOperador key={op.id||i} op={op} onVerDetalle={setDetalleOp}/>
                ))}
              </div>
            )}
          </div>

          {/* Resumen pie */}
          <div style={{ flexShrink:0, background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"14px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textGhost, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Resumen del día</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
              {[
                { l:"Ingresos totales", v:fmtMoney(totalGeneral), c:C.textPrimary },
                { l:"− Gastos",         v:fmtMoney(totalGastos),  c:C.danger },
                { l:"= Neto del día",   v:fmtMoney(neto),         c:C.success, big:true },
              ].map(item => (
                <div key={item.l} style={{ padding:"10px 14px", borderRadius:8, background:C.hover }}>
                  <p style={{ fontSize:11, color:C.textGhost, margin:"0 0 3px", fontFamily:"'DM Sans',sans-serif" }}>{item.l}</p>
                  <p style={{ fontSize:item.big?20:15, fontWeight:900, color:item.c, margin:0, fontFamily:"'Barlow Condensed',sans-serif" }}>{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {detalleOp  && <ModalDetalle    op={detalleOp} onCerrar={() => setDetalleOp(null)}/>}
      {modalCierre && <ModalCierreCaja fecha={fecha} datos={datos} onConfirmar={confirmarCierre} onCerrar={() => setModalCierre(false)}/>}

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter:${C.isDark?"invert(1)":"none"}; opacity:0.6; cursor:pointer; }
        @media print {
          body > *:not(#cierre-print) { display:none !important; }
          #cierre-print { display:block !important; }
        }
      `}</style>
    </div>
  );
}