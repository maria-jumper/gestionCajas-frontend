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
    hover:       isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    isDark,
  };
}

function Stepper({ paso, pasos }) {
  const C = useC();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:28 }}>
      {pasos.map((label, i) => {
        const num=i+1; const active=num===paso; const done=num<paso;
        return (
          <React.Fragment key={label}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:active?C.accent:done?C.accent:"rgba(128,128,128,0.15)", border:`2px solid ${active||done?C.accent:C.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:active||done?"#fff":C.textGhost, fontFamily:"'Barlow Condensed',sans-serif", flexShrink:0 }}>
                {done?"✓":num}
              </div>
              <span style={{ fontSize:13, fontWeight:active?700:400, color:active?C.textPrimary:C.textGhost, fontFamily:"'Barlow',sans-serif", whiteSpace:"nowrap" }}>{label}</span>
            </div>
            {i<pasos.length-1 && <div style={{ flex:1, height:1, background:done?C.accent:C.cardBorder, margin:"0 10px", minWidth:20 }}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

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

// ══════════════════════════════════════════════════════════════════════════════
export default function EnviosPage({ onVolver }) {
  const { getToken } = useAuth();
  const C = useC();

  const PASOS = ["Cantidad", "Información", "Precio", "Método de pago"];
  const [paso,        setPaso]        = useState(1);
  const [cantidad,    setCantidad]    = useState(1);
  const [metodoInfo,  setMetodoInfo]  = useState(null);
  const [guia,        setGuia]        = useState("");
  const [escaneando,  setEscaneando]  = useState(false);
  const [scanMsg,     setScanMsg]     = useState("");
  const [metodoPrecio,setMetodoPrecio]= useState(null);
  const [precio,      setPrecio]      = useState("");
  const [metodoPago,  setMetodoPago]  = useState(null);
  const [referencia,  setReferencia]  = useState("");
  const [comprobante, setComprobante] = useState(null);
  const fileRef = useRef(null);
  const [guardando, setGuardando] = useState(false);
  const [exito,     setExito]     = useState(false);

  const iS = { width:"100%", boxSizing:"border-box", padding:"12px 16px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:15, outline:"none", fontFamily:"'Barlow',sans-serif", transition:"border-color 0.2s" };
  const bO = { display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 28px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", transition:"background 0.2s", outline:"none" };
  const bG = { ...bO, background:"transparent", color:C.textPrimary, border:`1px solid ${C.cardBorder}` };
  const card = { background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12 };

  const siguiente = () => setPaso(p => Math.min(p+1, 4));
  const anterior  = () => setPaso(p => Math.max(p-1, 1));

  const simularEscaneo = (tipo) => {
    setEscaneando(true); setScanMsg("Esperando escaneo...");
    setTimeout(() => {
      if (tipo==="guia")   setGuia(`GUIA-${Math.floor(Math.random()*90000)+10000}`);
      if (tipo==="precio") setPrecio((Math.random()*50+5).toFixed(2));
      setScanMsg("¡Código detectado!"); setEscaneando(false);
      setTimeout(() => setScanMsg(""), 1500);
    }, 2000);
  };

  const guardarEnvio = async () => {
    setGuardando(true);
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/envios`, { method:"POST", headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) }, body:JSON.stringify({ guia, precio:parseFloat(precio), metodo_pago:metodoPago, referencia:metodoPago==="transaccion"?referencia:null, cantidad }) });
    } catch { console.warn("Backend no disponible"); }
    setGuardando(false); setExito(true);
    setTimeout(() => { setExito(false); onVolver(); }, 2000);
  };

  if (exito) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(16,185,129,0.15)", border:"2px solid #10b981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>✓</div>
      <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>¡Envío registrado!</h3>
      <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Redirigiendo al inicio...</p>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexShrink:0 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:C.accentDim, display:"flex", alignItems:"center", justifyContent:"center", color:C.accent }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:800, color:C.accent, textTransform:"uppercase", letterSpacing:"0.08em" }}>Registrar Envíos</span>
      </div>

      <div style={{ ...card, flex:1, display:"flex", flexDirection:"column", padding:"28px 32px", minHeight:0 }}>
        <Stepper paso={paso} pasos={PASOS}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>

          {/* PASO 1 */}
          {paso===1 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", gap:24, maxWidth:480, margin:"0 auto", width:"100%" }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:900, color:C.textPrimary, margin:"0 0 6px" }}>¿Cuántos envíos deseas registrar?</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Ingresa la cantidad de envíos que deseas agregar.</p>
              </div>
              <input type="number" min="1" max="100" value={cantidad} onChange={e=>setCantidad(Math.max(1,parseInt(e.target.value)||1))} style={{ ...iS, fontSize:32, fontWeight:800, textAlign:"center", color:C.accent, padding:"18px" }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
              <div style={{ display:"flex", gap:12 }}>
                <button onClick={onVolver} style={{ ...bG, flex:1 }} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
                <button onClick={siguiente} style={{ ...bO, flex:2 }} onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Continuar →</button>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {paso===2 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:20, minHeight:0 }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>¿Cómo deseas registrar la información de la guía?</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Selecciona el método que prefieras para ingresar los datos.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4M7 12h10"/></svg>} titulo="Escanear código de barra" badge="Recomendado" desc="Escanea el código de barra de la guía para obtener la información automáticamente." selected={metodoInfo==="escanear"} onClick={()=>setMetodoInfo("escanear")}/>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} titulo="Ingreso manual" desc="Ingresa manualmente el número de guía y la información correspondiente." selected={metodoInfo==="manual"} onClick={()=>setMetodoInfo("manual")}/>
              </div>
              {metodoInfo==="escanear" && (
                <div style={{ ...card, padding:"20px", background:"rgba(255,107,0,0.04)", border:`1px solid ${C.accentDim}`, display:"flex", flexDirection:"column", gap:12 }}>
                  <button onClick={()=>simularEscaneo("guia")} disabled={escaneando} style={{ ...bO, opacity:escaneando?0.7:1 }} onMouseEnter={e=>{if(!escaneando)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>{escaneando?"Escaneando...":"Escanear Código"}</button>
                  {scanMsg && <p style={{ fontSize:13, color:C.success, margin:0, textAlign:"center" }}>{scanMsg}</p>}
                  {guia && <p style={{ fontSize:13, color:C.textPrimary, margin:0, textAlign:"center" }}>Guía detectada: <strong style={{ color:C.accent }}>{guia}</strong></p>}
                </div>
              )}
              {metodoInfo==="manual" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em" }}>N° de Guía</label>
                  <input type="text" placeholder="Ej: GUIA-12345" value={guia} onChange={e=>setGuia(e.target.value)} style={iS} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"auto" }}>
                <button onClick={anterior} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
                <button onClick={siguiente} disabled={!metodoInfo||!guia} style={{ ...bO, opacity:(!metodoInfo||!guia)?0.4:1, cursor:(!metodoInfo||!guia)?"not-allowed":"pointer" }} onMouseEnter={e=>{if(metodoInfo&&guia)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Continuar →</button>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {paso===3 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:20, minHeight:0 }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>¿Cómo deseas registrar el precio?</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Selecciona el método que prefieras para ingresar el precio.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} titulo="Escanear código de precio" badge="Recomendado" desc="Escanea el código de precio del envío para obtener el valor automáticamente." selected={metodoPrecio==="escanear"} onClick={()=>setMetodoPrecio("escanear")}/>
                <MetodoCard icono={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} titulo="Ingreso manual" desc="Ingresa manualmente el precio del envío." selected={metodoPrecio==="manual"} onClick={()=>setMetodoPrecio("manual")}/>
              </div>
              {metodoPrecio==="escanear" && (
                <div style={{ ...card, padding:"20px", background:"rgba(255,107,0,0.04)", border:`1px solid ${C.accentDim}`, display:"flex", flexDirection:"column", gap:12 }}>
                  <button onClick={()=>simularEscaneo("precio")} disabled={escaneando} style={{ ...bO, opacity:escaneando?0.7:1 }} onMouseEnter={e=>{if(!escaneando)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>{escaneando?"Escaneando...":"Escanear Código"}</button>
                  {precio && <p style={{ fontSize:13, color:C.textPrimary, margin:0, textAlign:"center" }}>Precio detectado: <strong style={{ color:C.accent }}>${precio}</strong></p>}
                </div>
              )}
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
          {paso===4 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:20, minHeight:0 }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>Selecciona el método de pago</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Elige cómo se realizará el pago de este envío.</p>
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
                    <div onClick={()=>fileRef.current?.click()} style={{ ...card, padding:"28px 20px", textAlign:"center", cursor:"pointer", border:`1.5px dashed ${comprobante?C.accent:C.cardBorder}`, background:comprobante?"rgba(255,107,0,0.04)":C.inputBg, transition:"all 0.2s" }}>
                      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={e=>setComprobante(e.target.files[0])}/>
                      {comprobante ? <p style={{ fontSize:13, color:C.accent, margin:0, fontWeight:600 }}>✓ {comprobante.name}</p> : <>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={C.textGhost} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:8 }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                        <p style={{ fontSize:13, color:C.textGhost, margin:0 }}>Arrastra y suelta la imagen aquí<br/><span style={{ color:C.textSec }}>o haz clic para seleccionar</span></p>
                        <p style={{ fontSize:11, color:C.textGhost, margin:"6px 0 0" }}>Formatos: JPG, PNG, Máx. 5MB</p>
                      </>}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"auto" }}>
                <button onClick={anterior} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
                <button onClick={guardarEnvio} disabled={!metodoPago||guardando} style={{ ...bO, opacity:(!metodoPago||guardando)?0.5:1, cursor:(!metodoPago||guardando)?"not-allowed":"pointer" }} onMouseEnter={e=>{if(metodoPago&&!guardando)e.currentTarget.style.background="#E55E00";}} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                  {guardando?"Guardando...":"Guardar Envío →"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}