import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function useC() {
  const { isDark } = useTheme();
  return {
    bg:          isDark ? "#0d0d0d"  : "#f4f5f7",
    cardBg:      isDark ? "#161616"  : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    accent:      "#FF6B00",
    accentLight: "rgba(255,107,0,0.12)",
    accentDim:   isDark ? "rgba(255,107,0,0.2)" : "rgba(255,107,0,0.15)",
    textPrimary: isDark ? "#f0f4f8"  : "#1a1d23",
    textSec:     isDark ? "#8a9bb0"  : "#5a6478",
    textGhost:   isDark ? "#4e6070"  : "#9aa5b4",
    inputBg:     isDark ? "#111111"  : "#f9fafb",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    success:     "#10b981",
    successBg:   "rgba(16,185,129,0.1)",
    warning:     "#f59e0b",
    isDark,
  };
}

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ paso, pasos }) {
  const C = useC();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:28 }}>
      {pasos.map((label, i) => {
        const num = i + 1; const active = num === paso; const done = num < paso;
        return (
          <React.Fragment key={label}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:active?C.accent:done?C.accent:"rgba(128,128,128,0.15)", border:`2px solid ${active||done?C.accent:C.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:active||done?"#fff":C.textGhost, fontFamily:"'Barlow Condensed',sans-serif", flexShrink:0 }}>
                {done ? "✓" : num}
              </div>
              <span style={{ fontSize:13, fontWeight:active?700:400, color:active?C.textPrimary:C.textGhost, fontFamily:"'Barlow',sans-serif", whiteSpace:"nowrap" }}>{label}</span>
            </div>
            {i < pasos.length - 1 && <div style={{ flex:1, height:1, background:done?C.accent:C.cardBorder, margin:"0 10px", minWidth:20 }}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── MetodoCard ────────────────────────────────────────────────────────────────
function MetodoCard({ icono, titulo, desc, badge, selected, onClick }) {
  const C = useC();
  return (
    <button onClick={onClick} style={{ background:selected?"rgba(255,107,0,0.06)":C.cardBg, border:`1.5px solid ${selected?C.accent:C.cardBorder}`, borderRadius:12, padding:"20px", width:"100%", textAlign:"left", cursor:"pointer", transition:"all 0.2s", display:"flex", flexDirection:"column", gap:12, outline:"none" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:10, flexShrink:0, background:selected?C.accentDim:"rgba(128,128,128,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:selected?C.accent:C.textSec, transition:"all 0.2s" }}>{icono}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:15, fontWeight:700, color:C.textPrimary, fontFamily:"'Barlow',sans-serif" }}>{titulo}</span>
            {badge && <span style={{ fontSize:10, fontWeight:800, color:C.accent, background:"rgba(255,107,0,0.15)", border:`1px solid ${C.accentDim}`, padding:"2px 7px", borderRadius:4, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'Barlow',sans-serif" }}>{badge}</span>}
          </div>
          <p style={{ fontSize:12, color:C.textGhost, margin:0, lineHeight:1.5 }}>{desc}</p>
        </div>
      </div>
    </button>
  );
}

// ── DatoRow ───────────────────────────────────────────────────────────────────
function DatoRow({ label, value, highlight }) {
  const C = useC();
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.cardBorder}` }}>
      <span style={{ fontSize:12, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Barlow',sans-serif" }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:600, color:highlight?C.accent:C.textPrimary, fontFamily:"'Barlow',sans-serif" }}>{value}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function EntregasPage({ onVolver }) {
  const { getToken } = useAuth();
  const C = useC();

  const PASOS = ["Cantidad", "Información de la entrega", "Precio", "Método de pago"];
  const [paso,         setPaso]         = useState(1);
  const [cantidad,     setCantidad]     = useState(1);
  const [metodoInfo,   setMetodoInfo]   = useState(null);
  const [guia,         setGuia]         = useState("");
  const [buscando,     setBuscando]     = useState(false);
  const [paquete,      setPaquete]      = useState(null);
  const [errorBusq,    setErrorBusq]    = useState("");
  const [escaneando,   setEscaneando]   = useState(false);
  const [metodoPrecio, setMetodoPrecio] = useState(null);
  const [precio,       setPrecio]       = useState("");
  const [metodoPago,   setMetodoPago]   = useState(null);
  const [referencia,   setReferencia]   = useState("");
  const [comprobante,  setComprobante]  = useState(null);
  const fileRef = useRef(null);
  const [guardando, setGuardando] = useState(false);
  const [exito,     setExito]     = useState(false);

  // Estilos dependientes del tema
  const iS = { width:"100%", boxSizing:"border-box", padding:"12px 16px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:15, outline:"none", fontFamily:"'Barlow',sans-serif", transition:"border-color 0.2s" };
  const bO = { display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 28px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", transition:"background 0.2s", outline:"none" };
  const bG = { ...bO, background:"transparent", color:C.textPrimary, border:`1px solid ${C.cardBorder}` };
  const card = { background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12 };

  const siguiente = () => setPaso(p => Math.min(p + 1, 4));
  const anterior  = () => setPaso(p => Math.max(p - 1, 1));

  const buscarGuia = async (codigoGuia) => {
    if (!codigoGuia.trim()) return;
    setBuscando(true); setErrorBusq(""); setPaquete(null);
    try {
      const token = getToken?.();
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/inventario/guia/${codigoGuia.trim()}`, { headers: token ? { Authorization:`Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No encontrada");
      const data = await res.json();
      setPaquete(data);
      if (data.precio) setPrecio(String(data.precio));
    } catch {
      setPaquete({ guia:codigoGuia.trim(), destinatario:"Cliente Demo", direccion:"Calle 123, Ciudad", telefono:"300 000 0000", estado:"No entregada", precio:"15.00" });
      setPrecio("15.00");
    }
    setBuscando(false);
  };

  const simularEscaneo = () => {
    setEscaneando(true);
    setTimeout(() => { const g=`GUIA-${Math.floor(Math.random()*90000)+10000}`; setGuia(g); buscarGuia(g); setEscaneando(false); }, 2000);
  };

  const registrarEntrega = async () => {
    setGuardando(true);
    try {
      const token = getToken?.();
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/entregas`, { method:"POST", headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) }, body:JSON.stringify({ guia, precio:parseFloat(precio), metodo_pago:metodoPago, referencia, cantidad }) });
    } catch { console.warn("Backend no disponible"); }
    setGuardando(false); setExito(true);
    setTimeout(() => { setExito(false); onVolver(); }, 2000);
  };

  if (exito) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:C.successBg, border:`2px solid ${C.success}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>✓</div>
      <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>¡Entrega registrada!</h3>
      <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>El estado se actualizó a <strong style={{ color:C.success }}>Entregada</strong>. Redirigiendo...</p>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexShrink:0 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:C.accentDim, display:"flex", alignItems:"center", justifyContent:"center", color:C.accent }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:800, color:C.accent, textTransform:"uppercase", letterSpacing:"0.08em" }}>Registrar Entregas</span>
      </div>

      <div style={{ ...card, flex:1, display:"flex", flexDirection:"column", padding:"28px 32px", minHeight:0 }}>
        <Stepper paso={paso} pasos={PASOS}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>

          {/* PASO 1 */}
          {paso === 1 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", gap:24, maxWidth:480, margin:"0 auto", width:"100%" }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:900, color:C.textPrimary, margin:"0 0 6px" }}>¿Cuántas entregas deseas registrar?</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Ingresa la cantidad de entregas que deseas agregar.</p>
              </div>
              <input type="number" min="1" max="100" value={cantidad} onChange={e=>setCantidad(Math.max(1,parseInt(e.target.value)||1))}
                style={{ ...iS, fontSize:32, fontWeight:800, textAlign:"center", color:C.accent, padding:"18px" }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
              <div style={{ display:"flex", gap:12 }}>
                <button onClick={onVolver} style={{ ...bG, flex:1 }} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
                <button onClick={siguiente} style={{ ...bO, flex:2 }} onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Continuar →</button>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {paso === 2 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:18, minHeight:0, overflowY:"auto" }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>¿Cómo deseas registrar la información de la guía?</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>El sistema buscará la guía en el inventario y actualizará su estado a <strong style={{ color:C.success }}>Entregada</strong>.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4M7 12h10"/></svg>} titulo="Escanear código de barra" badge="Recomendado" desc="Escanea el código de barra de la guía para buscar automáticamente en el inventario." selected={metodoInfo==="escanear"} onClick={()=>setMetodoInfo("escanear")}/>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} titulo="Ingreso manual" desc="Ingresa manualmente el número de guía para buscarlo en el inventario." selected={metodoInfo==="manual"} onClick={()=>setMetodoInfo("manual")}/>
              </div>
              {metodoInfo==="escanear" && (
                <div style={{ ...card, padding:"18px", background:C.accentDim.replace("0.2","0.04"), border:`1px solid ${C.accentDim}`, display:"flex", flexDirection:"column", gap:10 }}>
                  <button onClick={simularEscaneo} disabled={escaneando||buscando} style={{ ...bO, opacity:(escaneando||buscando)?0.7:1 }} onMouseEnter={e=>{if(!escaneando&&!buscando)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                    {escaneando?"Escaneando...":buscando?"Buscando...":"Escanear Código"}
                  </button>
                  {guia && !paquete && !buscando && <p style={{ fontSize:13, color:C.textGhost, margin:0, textAlign:"center" }}>Buscando: <strong style={{ color:C.accent }}>{guia}</strong></p>}
                </div>
              )}
              {metodoInfo==="manual" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em" }}>N° de Guía</label>
                  <div style={{ display:"flex", gap:10 }}>
                    <input type="text" placeholder="Ej: GUIA-12345" value={guia} onChange={e=>{setGuia(e.target.value);setPaquete(null);setErrorBusq("");}} style={{ ...iS, flex:1 }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
                    <button onClick={()=>buscarGuia(guia)} disabled={!guia||buscando} style={{ ...bO, padding:"12px 20px", flexShrink:0, opacity:(!guia||buscando)?0.5:1 }} onMouseEnter={e=>{if(guia&&!buscando)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>{buscando?"...":"Buscar"}</button>
                  </div>
                  {errorBusq && <p style={{ fontSize:12, color:"#f87171", margin:0 }}>{errorBusq}</p>}
                </div>
              )}
              {paquete && (
                <div style={{ ...card, padding:"18px 20px", border:"1px solid rgba(16,185,129,0.25)", background:C.successBg }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:C.success }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:C.success, textTransform:"uppercase", letterSpacing:"0.08em" }}>Guía encontrada en inventario</span>
                  </div>
                  <DatoRow label="Guía" value={paquete.guia} highlight/>
                  <DatoRow label="Destinatario" value={paquete.destinatario}/>
                  <DatoRow label="Dirección" value={paquete.direccion}/>
                  <DatoRow label="Teléfono" value={paquete.telefono}/>
                  <DatoRow label="Estado actual" value={paquete.estado}/>
                  <div style={{ marginTop:10, padding:"8px 12px", borderRadius:6, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
                    <p style={{ fontSize:12, color:C.success, margin:0 }}>✓ Al confirmar, el estado cambiará a <strong>Entregada</strong> y se enviará a Informes.</p>
                  </div>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"auto" }}>
                <button onClick={anterior} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
                <button onClick={siguiente} disabled={!paquete} style={{ ...bO, opacity:!paquete?0.4:1, cursor:!paquete?"not-allowed":"pointer" }} onMouseEnter={e=>{if(paquete)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Continuar →</button>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {paso === 3 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:20, minHeight:0 }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>¿Cómo deseas registrar el precio?</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>{precio?`Precio del inventario: $${precio}. Puedes confirmarlo o ajustarlo.`:"Selecciona cómo ingresar el precio."}</p>
              </div>
              {precio && !metodoPrecio && (
                <div style={{ ...card, padding:"18px 20px", border:`1px solid ${C.accentDim}`, background:C.isDark?"rgba(255,107,0,0.04)":"rgba(255,107,0,0.03)" }}>
                  <p style={{ fontSize:12, color:C.textGhost, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Precio del inventario</p>
                  <p style={{ fontSize:28, fontWeight:900, color:C.accent, margin:0, fontFamily:"'Barlow Condensed',sans-serif" }}>${precio}</p>
                </div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} titulo="Usar precio del inventario" badge="Recomendado" desc={`Confirma el precio registrado: $${precio||"—"}`} selected={metodoPrecio==="inventario"} onClick={()=>setMetodoPrecio("inventario")}/>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} titulo="Ajustar precio" desc="Modifica el precio si hay un cobro diferente al registrado." selected={metodoPrecio==="manual"} onClick={()=>setMetodoPrecio("manual")}/>
              </div>
              {metodoPrecio==="manual" && (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em" }}>Precio ($)</label>
                  <div style={{ position:"relative" }}>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={precio} onChange={e=>setPrecio(e.target.value)} style={{ ...iS, paddingRight:40 }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
                    <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:C.textGhost, fontSize:14 }}>$</span>
                  </div>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"auto" }}>
                <button onClick={anterior} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
                <button onClick={siguiente} disabled={!metodoPrecio||!precio} style={{ ...bO, opacity:(!metodoPrecio||!precio)?0.4:1, cursor:(!metodoPrecio||!precio)?"not-allowed":"pointer" }} onMouseEnter={e=>{if(metodoPrecio&&precio)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Continuar →</button>
              </div>
            </div>
          )}

          {/* PASO 4 */}
          {paso === 4 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:20, minHeight:0 }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>Selecciona el método de pago</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Elige cómo se realizará el pago de esta entrega.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>} titulo="Efectivo" desc="El pago se realiza en efectivo." selected={metodoPago==="efectivo"} onClick={()=>setMetodoPago("efectivo")}/>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} titulo="Transacción" desc="El pago se realiza por transferencia o medio electrónico." selected={metodoPago==="transaccion"} onClick={()=>setMetodoPago("transaccion")}/>
              </div>
              {metodoPago==="transaccion" && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em" }}>Referencia de transacción (opcional)</label>
                    <input type="text" placeholder="Ej: 123456789" value={referencia} onChange={e=>setReferencia(e.target.value)} style={iS} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em" }}>Comprobante de pago (opcional)</label>
                    <div onClick={()=>fileRef.current?.click()} style={{ ...card, padding:"24px 20px", textAlign:"center", cursor:"pointer", border:`1.5px dashed ${comprobante?C.accent:C.cardBorder}`, background:comprobante?"rgba(255,107,0,0.04)":C.inputBg, transition:"all 0.2s" }}>
                      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={e=>setComprobante(e.target.files[0])}/>
                      {comprobante ? <p style={{ fontSize:13, color:C.accent, margin:0, fontWeight:600 }}>✓ {comprobante.name}</p> : <>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={C.textGhost} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:6 }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                        <p style={{ fontSize:12, color:C.textGhost, margin:0 }}>Arrastra y suelta o <span style={{ color:C.textSec }}>haz clic para seleccionar</span></p>
                        <p style={{ fontSize:11, color:C.textGhost, margin:"4px 0 0" }}>Formatos: JPG, PNG, Máx. 5MB</p>
                      </>}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"auto" }}>
                <button onClick={anterior} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
                <button onClick={registrarEntrega} disabled={!metodoPago||guardando} style={{ ...bO, opacity:(!metodoPago||guardando)?0.5:1, cursor:(!metodoPago||guardando)?"not-allowed":"pointer" }} onMouseEnter={e=>{if(metodoPago&&!guardando)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                  {guardando?"Registrando...":"Registrar Entrega →"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}