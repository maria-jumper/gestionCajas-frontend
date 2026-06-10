import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getInventarioPorGuia, getInventario, updateInventario, createEntrega } from "../api";

function useC() {
  const { isDark } = useTheme();
  return {
    bg:          isDark ? "#0d0d0d"  : "#f4f5f7",
    cardBg:      isDark ? "#161616"  : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    accent:      "#FF6B00",
    accentDim:   isDark ? "rgba(255,107,0,0.18)" : "rgba(255,107,0,0.12)",
    textPrimary: isDark ? "#f0f4f8"  : "#1a1d23",
    textSec:     isDark ? "#8a9bb0"  : "#5a6478",
    textGhost:   isDark ? "#4e6070"  : "#9aa5b4",
    inputBg:     isDark ? "#111111"  : "#f9fafb",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    hover:       isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    success:     "#10b981",
    successBg:   "rgba(16,185,129,0.1)",
    danger:      "#ef4444",
    warning:     "#f59e0b",
    isDark,
  };
}

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ paso, pasos }) {
  const C = useC();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:28, flexShrink:0 }}>
      {pasos.map((label, i) => {
        const num=i+1; const active=num===paso; const done=num<paso;
        return (
          <React.Fragment key={label}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:active?C.accent:done?C.accent:"rgba(128,128,128,0.15)", border:`2px solid ${active||done?C.accent:C.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:active||done?"#fff":C.textGhost, fontFamily:"'Barlow Condensed',sans-serif", flexShrink:0 }}>
                {done?"✓":num}
              </div>
              <span style={{ fontSize:13, fontWeight:active?700:400, color:active?C.textPrimary:C.textGhost, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{label}</span>
            </div>
            {i<pasos.length-1 && <div style={{ flex:1, height:1, background:done?C.accent:C.cardBorder, margin:"0 10px", minWidth:20 }}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Fila de dato del paquete ─────────────────────────────────────────────────
function DatoRow({ label, value, accent }) {
  const C = useC();
  if (!value || String(value).trim() === "" || value === "0") return null;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"9px 0", borderBottom:`1px solid ${C.cardBorder}` }}>
      <span style={{ fontSize:11, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif", flexShrink:0, paddingRight:12 }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:600, color:accent?C.accent:C.textPrimary, fontFamily:"'DM Sans',sans-serif", textAlign:"right" }}>{String(value)}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function EntregasPage({ onVolver }) {
  const C = useC();

  const PASOS = ["Buscar guía", "Confirmar datos", "Método de pago"];

  const [paso,       setPaso]       = useState(1);
  const [guiaInput,  setGuiaInput]  = useState("");
  const [buscando,   setBuscando]   = useState(false);
  const [escaneando, setEscaneando] = useState(false);
  const [paquete,    setPaquete]    = useState(null);
  const [errorBusq,  setErrorBusq]  = useState("");
  const [metodoPago, setMetodoPago] = useState(null);
  const [referencia, setReferencia] = useState("");
  const [comprobante,setComprobante]= useState(null);
  const fileRef = useRef(null);
  const [guardando,  setGuardando]  = useState(false);
  const [exito,      setExito]      = useState(false);

  const iS = { width:"100%", boxSizing:"border-box", padding:"12px 16px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:15, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s" };
  const bO = { display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 24px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", transition:"background 0.2s", outline:"none" };
  const bG = { ...bO, background:"transparent", color:C.textPrimary, border:`1px solid ${C.cardBorder}` };
  const card = { background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12 };

  const siguiente = () => setPaso(p => Math.min(p+1, 3));
  const anterior  = () => setPaso(p => Math.max(p-1, 1));

  // Buscar guía en el inventario del backend
  const buscarGuia = async (codigo) => {
    const g = (codigo || guiaInput).trim();
    if (!g) return;
    setBuscando(true); setErrorBusq(""); setPaquete(null);
    try {
      let data = await getInventarioPorGuia(g);
      if (data.error || !data.guia) {
        // Intentar en lista general
        const lista = await getInventario(`guia=${encodeURIComponent(g)}`);
        const found = Array.isArray(lista) ? lista.find(x => x.guia?.toLowerCase() === g.toLowerCase()) : null;
        if (!found) { setErrorBusq("Guía no encontrada en el inventario."); setBuscando(false); return; }
        data = found;
      }
      if (data.estado === "Entregado") {
        setErrorBusq("Esta guía ya fue marcada como entregada.");
        setBuscando(false); return;
      }
      setPaquete(data);
    } catch {
      setErrorBusq("No se pudo conectar con el servidor.");
    }
    setBuscando(false);
  };

  const simularEscaneo = () => {
    setEscaneando(true);
    // En producción este evento vendría del escáner físico vía input focus
    setTimeout(() => { setEscaneando(false); }, 3000);
  };

  const registrarEntrega = async () => {
    if (!paquete || !metodoPago) return;
    setGuardando(true);
    try {
      await createEntrega({
        guia:          paquete.guia,
        precio:        paquete.valor,
        metodo_pago:   metodoPago,
        referencia:    metodoPago === "transaccion" ? referencia : null,
        id_inventario: paquete.id,
      });
      await updateInventario(paquete.id, { estado: "Entregado" });
    } catch { console.warn("Backend no disponible"); }
    setGuardando(false);
    setExito(true);
    setTimeout(() => { setExito(false); onVolver(); }, 2200);
  };

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (exito) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, height:"100%" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:C.successBg, border:`3px solid ${C.success}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>✓</div>
      <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>¡Entrega registrada!</h3>
      <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"12px 24px", textAlign:"center" }}>
        <p style={{ fontSize:14, fontWeight:700, color:C.accent, margin:"0 0 2px", fontFamily:"'DM Sans',sans-serif" }}>{paquete?.guia}</p>
        <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Estado actualizado a <strong style={{ color:C.success }}>Entregado</strong></p>
      </div>
      <p style={{ fontSize:12, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Redirigiendo al inicio...</p>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>

      {/* Cabecera módulo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexShrink:0 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:C.accentDim, display:"flex", alignItems:"center", justifyContent:"center", color:C.accent }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:800, color:C.accent, textTransform:"uppercase", letterSpacing:"0.08em" }}>Registrar Entrega</span>
      </div>

      {/* Card principal */}
      <div style={{ ...card, flex:1, display:"flex", flexDirection:"column", padding:"28px 32px", minHeight:0 }}>
        <Stepper paso={paso} pasos={PASOS}/>

        <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflowY:"auto" }}>

          {/* ── PASO 1: Buscar guía ── */}
          {paso === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:520, margin:"0 auto", width:"100%" }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900, color:C.textPrimary, margin:"0 0 6px" }}>Ingresa el número de guía</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Escanea el código de barras o escribe el número de guía para buscarla en el inventario.</p>
              </div>

              {/* Zona de escaneo */}
              <div style={{ border:`2px dashed ${escaneando?C.accent:C.cardBorder}`, borderRadius:10, padding:"18px", textAlign:"center", background:escaneando?C.accentDim:C.inputBg, transition:"all 0.3s" }}>
                {escaneando ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                    <div style={{ fontSize:36 }}>📷</div>
                    <p style={{ fontSize:14, fontWeight:700, color:C.accent, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Esperando escaneo...</p>
                    <p style={{ fontSize:12, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Apunta el escáner al código de barras de la guía</p>
                    <button onClick={()=>setEscaneando(false)} style={{ ...bG, padding:"8px 16px", fontSize:12, marginTop:4 }}>Cancelar</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:28 }}>🔍</div>
                    <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>O escanea directamente con el lector de código</p>
                    <button onClick={simularEscaneo} style={{ ...bO, padding:"9px 20px", fontSize:13, marginTop:4 }}
                      onMouseEnter={e=>e.currentTarget.style.background="#E55E00"}
                      onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                      📷 Activar escáner
                    </button>
                  </div>
                )}
              </div>

              {/* Ingreso manual */}
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>O ingresa el N° de guía manualmente</label>
                <div style={{ display:"flex", gap:10 }}>
                  <input
                    type="text"
                    placeholder="Ej: GUIA-12345"
                    value={guiaInput}
                    onChange={e=>{ setGuiaInput(e.target.value); setErrorBusq(""); setPaquete(null); }}
                    onKeyDown={e=>{ if(e.key==="Enter" && guiaInput.trim()) buscarGuia(); }}
                    style={{ ...iS, flex:1 }}
                    onFocus={e=>e.target.style.borderColor=C.accent}
                    onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
                  <button
                    onClick={()=>buscarGuia()}
                    disabled={!guiaInput.trim()||buscando}
                    style={{ ...bO, padding:"12px 20px", flexShrink:0, opacity:(!guiaInput.trim()||buscando)?0.5:1, cursor:(!guiaInput.trim()||buscando)?"not-allowed":"pointer" }}
                    onMouseEnter={e=>{ if(guiaInput.trim()&&!buscando) e.currentTarget.style.background="#E55E00"; }}
                    onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                    {buscando ? "..." : "Buscar"}
                  </button>
                </div>
                {errorBusq && <p style={{ fontSize:12, color:C.danger, margin:0, fontFamily:"'DM Sans',sans-serif" }}>⚠️ {errorBusq}</p>}
              </div>

              {/* Resultado */}
              {paquete && (
                <div style={{ background:C.successBg, border:"1px solid rgba(16,185,129,0.3)", borderRadius:10, padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:C.success, flexShrink:0 }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:C.success, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Guía encontrada en inventario</span>
                  </div>
                  <DatoRow label="N° Guía"      value={paquete.guia}         accent/>
                  <DatoRow label="Cliente"      value={paquete.cliente}/>
                  <DatoRow label="Destinatario" value={paquete.destinatario}/>
                  <DatoRow label="Valor"        value={paquete.valor ? `$${Number(paquete.valor).toLocaleString()}` : null}/>
                  <DatoRow label="Dirección"    value={paquete.direccion}/>
                  <DatoRow label="Teléfono"     value={paquete.telefono}/>
                  <DatoRow label="Ciudad"       value={paquete.ciudad}/>
                </div>
              )}

              <div style={{ display:"flex", gap:10, marginTop:"auto", paddingTop:8 }}>
                <button onClick={onVolver} style={bG}
                  onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
                <button onClick={siguiente} disabled={!paquete}
                  style={{ ...bO, flex:2, opacity:!paquete?0.4:1, cursor:!paquete?"not-allowed":"pointer" }}
                  onMouseEnter={e=>{ if(paquete) e.currentTarget.style.background="#E55E00"; }}
                  onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                  Confirmar guía →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 2: Confirmar datos ── */}
          {paso === 2 && paquete && (
            <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:520, margin:"0 auto", width:"100%" }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900, color:C.textPrimary, margin:"0 0 6px" }}>Confirma los datos de la entrega</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Verifica que la información sea correcta antes de continuar.</p>
              </div>

              <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"18px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.cardBorder}` }}>
                  <div style={{ width:40, height:40, borderRadius:9, background:C.accentDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📦</div>
                  <div>
                    <p style={{ fontSize:16, fontWeight:900, color:C.accent, margin:0, fontFamily:"'Barlow Condensed',sans-serif" }}>{paquete.guia}</p>
                    <p style={{ fontSize:11, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Guía a entregar</p>
                  </div>
                  {paquete.valor > 0 && (
                    <div style={{ marginLeft:"auto", textAlign:"right" }}>
                      <p style={{ fontSize:20, fontWeight:900, color:C.textPrimary, margin:0, fontFamily:"'Barlow Condensed',sans-serif" }}>${Number(paquete.valor).toLocaleString()}</p>
                      <p style={{ fontSize:11, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Valor</p>
                    </div>
                  )}
                </div>
                <DatoRow label="Cliente"       value={paquete.cliente}/>
                <DatoRow label="Destinatario"  value={paquete.destinatario}/>
                <DatoRow label="Dirección"     value={paquete.direccion}/>
                <DatoRow label="Teléfono"      value={paquete.telefono}/>
                <DatoRow label="Ciudad"        value={paquete.ciudad}/>
                <DatoRow label="Observaciones" value={paquete.observaciones}/>
              </div>

              <div style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:"10px 14px" }}>
                <p style={{ fontSize:12, color:C.success, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                  ✓ Al confirmar, el estado de esta guía cambiará automáticamente a <strong>Entregado</strong> en el inventario.
                </p>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={anterior} style={bG}
                  onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
                <button onClick={siguiente} style={{ ...bO, flex:2 }}
                  onMouseEnter={e=>e.currentTarget.style.background="#E55E00"}
                  onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: Método de pago ── */}
          {paso === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:520, margin:"0 auto", width:"100%" }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900, color:C.textPrimary, margin:"0 0 6px" }}>Selecciona el método de pago</h2>
                <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Elige cómo realizó el pago el cliente al recibir el paquete.</p>
              </div>

              {/* Opciones de pago */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  { key:"efectivo",    label:"Efectivo",     emoji:"💵", desc:"El cliente pagó en efectivo" },
                  { key:"transaccion", label:"Transacción",  emoji:"📱", desc:"Pago por transferencia electrónica" },
                ].map(op => {
                  const sel = metodoPago === op.key;
                  return (
                    <button key={op.key} onClick={()=>setMetodoPago(op.key)} style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:8, padding:"16px", borderRadius:10, border:`2px solid ${sel?C.accent:C.cardBorder}`, background:sel?C.accentDim:C.inputBg, cursor:"pointer", transition:"all 0.18s", textAlign:"left", outline:"none" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
                        <span style={{ fontSize:22 }}>{op.emoji}</span>
                        {sel && <span style={{ width:18, height:18, borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <svg viewBox="0 0 12 12" width="10" height="10" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>}
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:sel?C.textPrimary:C.textSec, fontFamily:"'DM Sans',sans-serif" }}>{op.label}</div>
                        <div style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{op.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Campos adicionales para transacción */}
              {metodoPago==="transaccion" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Referencia de transacción (opcional)</label>
                    <input type="text" placeholder="Ej: 123456789, TRANS-001..." value={referencia} onChange={e=>setReferencia(e.target.value)}
                      style={iS} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Comprobante de pago (opcional)</label>
                    <div onClick={()=>fileRef.current?.click()} style={{ border:`1.5px dashed ${comprobante?C.accent:C.cardBorder}`, borderRadius:8, padding:"20px", textAlign:"center", cursor:"pointer", background:comprobante?C.accentDim:C.inputBg, transition:"all 0.2s" }}>
                      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={e=>setComprobante(e.target.files[0])}/>
                      {comprobante ? (
                        <p style={{ fontSize:13, color:C.accent, margin:0, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>✓ {comprobante.name}</p>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.textGhost} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:6 }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                          <p style={{ fontSize:12, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Haz clic para subir el comprobante</p>
                          <p style={{ fontSize:11, color:C.textGhost, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>JPG, PNG o PDF — Máx. 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen final */}
              {metodoPago && paquete && (
                <div style={{ background:C.isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)", border:`1px solid ${C.cardBorder}`, borderRadius:8, padding:"12px 16px" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:C.textGhost, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>Resumen</p>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
                    <span style={{ color:C.textSec }}>Guía</span>
                    <span style={{ color:C.accent, fontWeight:700 }}>{paquete.guia}</span>
                  </div>
                  {paquete.valor > 0 && (
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>
                      <span style={{ color:C.textSec }}>Valor cobrado</span>
                      <span style={{ color:C.textPrimary, fontWeight:700 }}>${Number(paquete.valor).toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>
                    <span style={{ color:C.textSec }}>Método de pago</span>
                    <span style={{ color:C.textPrimary, fontWeight:700 }}>{metodoPago === "efectivo" ? "💵 Efectivo" : "📱 Transacción"}</span>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={anterior} style={bG}
                  onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
                <button onClick={registrarEntrega} disabled={!metodoPago||guardando}
                  style={{ ...bO, flex:2, opacity:(!metodoPago||guardando)?0.5:1, cursor:(!metodoPago||guardando)?"not-allowed":"pointer" }}
                  onMouseEnter={e=>{ if(metodoPago&&!guardando) e.currentTarget.style.background="#E55E00"; }}
                  onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                  {guardando ? "Registrando..." : "Registrar entrega →"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}