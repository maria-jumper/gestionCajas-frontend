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
    danger:      "#ef4444",
    dangerBg:    "rgba(239,68,68,0.08)",
    warning:     "#f59e0b",
    tableBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    isDark,
  };
}

const API = () => import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const hoy = () => new Date().toISOString().split("T")[0];
const fmtMoney = (n) => `$${Number(n||0).toLocaleString("es-CO")}`;
const fmtHora  = ()   => new Date().toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });

const CATEGORIAS = [
  { key:"alimentacion",  label:"Alimentación",   emoji:"🍽️"  },
  { key:"transporte",    label:"Transporte",      emoji:"🚗"  },
  { key:"papeleria",     label:"Papelería",       emoji:"📋"  },
  { key:"servicios",     label:"Servicios",       emoji:"💡"  },
  { key:"aseo",          label:"Aseo / Limpieza", emoji:"🧹"  },
  { key:"comunicacion",  label:"Comunicación",    emoji:"📞"  },
  { key:"otro",          label:"Otro",            emoji:"📦"  },
];

function CatBadge({ categoria }) {
  const C = useC();
  const cat = CATEGORIAS.find(c => c.key === categoria) || CATEGORIAS[CATEGORIAS.length-1];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:"rgba(245,158,11,0.1)", color:C.warning, border:"1px solid rgba(245,158,11,0.25)" }}>
      {cat.emoji} {cat.label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function GastosPage({ onVolver }) {
  const { user, getToken } = useAuth();
  const C = useC();

  const [gastos,    setGastos]    = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [confirmDel,setConfirmDel]= useState(null);
  const [filtroFecha,setFiltroFecha]=useState(hoy());
  const [filtroCat, setFiltroCat] = useState("Todos");
  const [toastMsg,  setToastMsg]  = useState("");

  // Form
  const [form, setForm] = useState({ descripcion:"", categoria:"alimentacion", valor:"", observaciones:"" });
  const [errs, setErrs] = useState({});
  const [guardando, setGuardando] = useState(false);

  const iS = { width:"100%", boxSizing:"border-box", padding:"11px 14px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s" };
  const lS = { display:"block", fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, fontFamily:"'DM Sans',sans-serif" };
  const thS= { padding:"10px 16px", fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", textAlign:"left", borderBottom:`1px solid ${C.cardBorder}`, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" };
  const tdS= { padding:"12px 16px", fontSize:13, color:C.textSec, fontFamily:"'DM Sans',sans-serif", borderBottom:`1px solid ${C.tableBorder}` };

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  const cargar = async () => {
    setCargando(true);
    try {
      const token = getToken?.();
      const params = new URLSearchParams({ fecha: filtroFecha });
      if (filtroCat !== "Todos") params.set("categoria", filtroCat);
      const res = await fetch(`${API()}/gastos?${params}`, { headers: token?{Authorization:`Bearer ${token}`}:{} });
      if (res.ok) {
        const d = await res.json();
        setGastos(Array.isArray(d) ? d : []);
      } else setGastos([]);
    } catch { setGastos([]); }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, [filtroFecha, filtroCat]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const guardar = async () => {
    const e = {};
    if (!form.descripcion.trim()) e.descripcion = "Requerido";
    if (!form.valor || isNaN(parseFloat(form.valor)) || parseFloat(form.valor) <= 0) e.valor = "Ingresa un valor válido";
    setErrs(e);
    if (Object.keys(e).length) return;
    setGuardando(true);
    const nuevo = {
      descripcion:   form.descripcion.trim(),
      categoria:     form.categoria,
      valor:         parseFloat(form.valor),
      observaciones: form.observaciones.trim(),
      fecha:         hoy(),
      hora:          fmtHora(),
      registrado_por: user?.nombre || user?.username || "Admin",
    };
    try {
      const token = getToken?.();
      const res = await fetch(`${API()}/gastos`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify(nuevo),
      });
      if (res.ok) {
        const saved = await res.json();
        setGastos(p => [{ ...nuevo, id:saved.id||saved._id||Date.now() }, ...p]);
      } else {
        setGastos(p => [{ ...nuevo, id:Date.now() }, ...p]);
      }
    } catch {
      setGastos(p => [{ ...nuevo, id:Date.now() }, ...p]);
    }
    setForm({ descripcion:"", categoria:"alimentacion", valor:"", observaciones:"" });
    setErrs({});
    setGuardando(false);
    setModal(false);
    toast("✓ Gasto registrado correctamente");
  };

  const eliminar = async (id) => {
    try {
      const token = getToken?.();
      await fetch(`${API()}/gastos/${id}`, { method:"DELETE", headers:token?{Authorization:`Bearer ${token}`}:{} });
    } catch {}
    setGastos(p => p.filter(g => g.id !== id));
    setConfirmDel(null);
    toast("Gasto eliminado");
  };

  const filtrados = gastos.filter(g => {
    const mFecha = !filtroFecha || g.fecha === filtroFecha;
    const mCat   = filtroCat === "Todos" || g.categoria === filtroCat;
    return mFecha && mCat;
  });
  const totalDia = filtrados.reduce((s, g) => s + (Number(g.valor)||0), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, overflow:"hidden" }}>

      {/* Título */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0, marginBottom:16, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900, color:C.textPrimary, margin:"0 0 2px", textTransform:"uppercase" }}>Registro de Gastos</h1>
          <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Registra los gastos operativos del día</p>
        </div>
        <button onClick={()=>{ setForm({ descripcion:"", categoria:"alimentacion", valor:"", observaciones:"" }); setErrs({}); setModal(true); }}
          style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase", letterSpacing:"0.05em" }}
          onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Registrar gasto
        </button>
      </div>

      {/* Filtros + total */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginBottom:14, flexWrap:"wrap" }}>
        <input type="date" value={filtroFecha} max={hoy()} onChange={e=>setFiltroFecha(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
        <select value={filtroCat} onChange={e=>setFiltroCat(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer" }}>
          <option value="Todos">Todas las categorías</option>
          {CATEGORIAS.map(c=><option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
        </select>
        <div style={{ marginLeft:"auto", padding:"9px 18px", borderRadius:8, background:C.isDark?"rgba(239,68,68,0.1)":"rgba(239,68,68,0.06)", border:`1px solid rgba(239,68,68,0.2)` }}>
          <span style={{ fontSize:12, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Total gastos: </span>
          <span style={{ fontSize:16, fontWeight:900, color:C.danger, fontFamily:"'Barlow Condensed',sans-serif" }}>{fmtMoney(totalDia)}</span>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ flex:1, overflow:"auto" }}>
          {cargando ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Cargando gastos...</div>
          ) : filtrados.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:10, padding:"40px", textAlign:"center" }}>
              <div style={{ fontSize:44 }}>💸</div>
              <p style={{ fontSize:15, fontWeight:700, color:C.textPrimary, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Sin gastos registrados</p>
              <p style={{ fontSize:12, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Los gastos que registres aparecerán aquí.</p>
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Descripción","Categoría","Valor","Hora","Registrado por","Observaciones",""].map((h,i)=>(
                    <th key={i} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(g => (
                  <tr key={g.id} style={{ transition:"background 0.12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ ...tdS, fontWeight:600, color:C.textPrimary }}>{g.descripcion}</td>
                    <td style={tdS}><CatBadge categoria={g.categoria}/></td>
                    <td style={{ ...tdS, fontWeight:700, color:C.danger }}>{fmtMoney(g.valor)}</td>
                    <td style={{ ...tdS, color:C.textGhost }}>{g.hora || "—"}</td>
                    <td style={tdS}>{g.registrado_por || "—"}</td>
                    <td style={{ ...tdS, color:C.textGhost, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis" }}>{g.observaciones || "—"}</td>
                    <td style={tdS}>
                      <button onClick={()=>setConfirmDel(g)}
                        style={{ width:28, height:28, borderRadius:6, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.1)", color:C.danger, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", outline:"none" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.2)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filtrados.length > 0 && (
          <div style={{ padding:"10px 18px", borderTop:`1px solid ${C.cardBorder}`, flexShrink:0 }}>
            <span style={{ fontSize:12, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{filtrados.length} gasto{filtrados.length>1?"s":""} registrado{filtrados.length>1?"s":""}</span>
          </div>
        )}
      </div>

      {/* Modal registrar gasto */}
      {modal && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:460, padding:"28px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Registrar gasto</h3>
                <p style={{ fontSize:12, color:C.textGhost, margin:"2px 0 0", fontFamily:"'DM Sans',sans-serif" }}>Se registrará con la fecha y hora actual</p>
              </div>
              <button onClick={()=>setModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:24, padding:4, outline:"none" }}>×</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={lS}>Descripción *</label>
                <input type="text" placeholder="Ej: Almuerzo, Botella de agua, Resma de papel..." value={form.descripcion}
                  onChange={e=>{ setF("descripcion",e.target.value); setErrs(v=>({...v,descripcion:""})); }}
                  style={{ ...iS, borderColor:errs.descripcion?"#ef4444":C.inputBorder }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.descripcion?"#ef4444":C.inputBorder}/>
                {errs.descripcion && <p style={{ fontSize:11, color:C.danger, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{errs.descripcion}</p>}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lS}>Categoría</label>
                  <select value={form.categoria} onChange={e=>setF("categoria",e.target.value)} style={iS}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}>
                    {CATEGORIAS.map(c=><option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lS}>Valor ($) *</label>
                  <div style={{ position:"relative" }}>
                    <input type="number" min="0" step="100" placeholder="0" value={form.valor}
                      onChange={e=>{ setF("valor",e.target.value); setErrs(v=>({...v,valor:""})); }}
                      style={{ ...iS, paddingRight:32, borderColor:errs.valor?"#ef4444":C.inputBorder }}
                      onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.valor?"#ef4444":C.inputBorder}/>
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:C.textGhost, fontSize:13 }}>$</span>
                  </div>
                  {errs.valor && <p style={{ fontSize:11, color:C.danger, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{errs.valor}</p>}
                </div>
              </div>

              <div>
                <label style={lS}>Observaciones (opcional)</label>
                <textarea placeholder="Algún detalle adicional..." value={form.observaciones} onChange={e=>setF("observaciones",e.target.value)} rows={2}
                  style={{ ...iS, resize:"none", lineHeight:1.5 }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
              </div>

              {/* Preview */}
              {form.descripcion && form.valor && (
                <div style={{ padding:"10px 14px", borderRadius:8, background:C.isDark?"rgba(239,68,68,0.08)":"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:C.textPrimary, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{form.descripcion}</p>
                      <p style={{ fontSize:11, color:C.textGhost, margin:"2px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{CATEGORIAS.find(c=>c.key===form.categoria)?.emoji} {CATEGORIAS.find(c=>c.key===form.categoria)?.label} · {fmtHora()}</p>
                    </div>
                    <p style={{ fontSize:18, fontWeight:900, color:C.danger, margin:0, fontFamily:"'Barlow Condensed',sans-serif" }}>{form.valor ? fmtMoney(parseFloat(form.valor)||0) : "—"}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={()=>setModal(false)} style={{ flex:1, padding:"11px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={guardar} disabled={guardando} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase", opacity:guardando?0.7:1 }}
                onMouseEnter={e=>{ if(!guardando) e.currentTarget.style.background="#E55E00"; }}
                onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                {guardando ? "Guardando..." : "Registrar gasto →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmDel && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:14, maxWidth:360, width:"100%", padding:"24px" }}>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:"0 0 8px", textTransform:"uppercase" }}>¿Eliminar gasto?</h3>
            <p style={{ fontSize:13, color:C.textSec, margin:"0 0 6px", fontFamily:"'DM Sans',sans-serif" }}>
              <strong style={{ color:C.textPrimary }}>{confirmDel.descripcion}</strong>
            </p>
            <p style={{ fontSize:15, fontWeight:900, color:C.danger, margin:"0 0 18px", fontFamily:"'Barlow Condensed',sans-serif" }}>{fmtMoney(confirmDel.valor)}</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"10px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={()=>eliminar(confirmDel.id)} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:C.danger, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase" }}
                onMouseEnter={e=>e.currentTarget.style.background="#dc2626"} onMouseLeave={e=>e.currentTarget.style.background=C.danger}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position:"fixed", bottom:24, right:24, background:toastMsg.startsWith("✓")?C.success:C.textGhost, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 16px rgba(0,0,0,0.3)", zIndex:600 }}>
          {toastMsg}
        </div>
      )}

      <style>{`select option{background:${C.isDark?"#161616":"#fff"};color:${C.isDark?"#f0f4f8":"#1a1d23"};} input[type="date"]::-webkit-calendar-picker-indicator{filter:${C.isDark?"invert(1)":"none"};opacity:0.6;cursor:pointer;}`}</style>
    </div>
  );
}
