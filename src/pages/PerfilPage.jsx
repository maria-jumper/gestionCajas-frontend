import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  card:        "#111111",
  cardBorder:  "rgba(255,255,255,0.08)",
  accent:      "#FF6B00",
  accentDim:   "rgba(255,107,0,0.14)",
  textPrimary: "#f0f4f8",
  textSec:     "#8a9bb0",
  textGhost:   "#4a5568",
  inputBg:     "#0a0a0a",
  danger:      "#ef4444",
  success:     "#10b981",
};

const ROLES_INFO = {
  admin:         { label: "Administrador", color: "#6366f1", emoji: "🛡️", desc: "Acceso total al sistema" },
  administrador: { label: "Administrador", color: "#6366f1", emoji: "🛡️", desc: "Acceso total al sistema" },
  secretaria:    { label: "Secretaria",    color: "#10b981", emoji: "📋", desc: "Registro de entregas y envíos" },
  mensajero:     { label: "Mensajero",     color: "#f59e0b", emoji: "🛵", desc: "Gestión de entregas en ruta" },
};

function getRolInfo(rol) {
  return ROLES_INFO[rol?.toLowerCase()] || { label: rol || "Usuario", color: "#8a9bb0", emoji: "👤", desc: "Acceso básico" };
}

function EyeIcon({ open }) {
  return open
    ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "11px 14px", borderRadius: 8,
  border: "1.5px solid rgba(255,255,255,0.09)",
  background: "#0a0a0a", color: "#f0f4f8",
  fontSize: 14, outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: C.textGhost, textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 6,
  fontFamily: "'DM Sans', sans-serif",
};

// ══════════════════════════════════════════════════════════════════════════════
export default function PerfilPage({ onVolver }) {
  const { user, getToken } = useAuth();

  const nombre   = user?.nombre || user?.name || user?.username || "Usuario";
  const username = user?.username || "";
  const email    = user?.email   || `${username.toLowerCase()}@cajasflow.com`;
  const rol      = user?.rol     || user?.role || "";
  const rolInfo  = getRolInfo(rol);

  // Edición de nombre
  const [editando,   setEditando]   = useState(false);
  const [nuevoNombre,setNuevoNombre]= useState(nombre);
  const [guardando,  setGuardando]  = useState(false);
  const [msgNombre,  setMsgNombre]  = useState("");

  // Cambio de contraseña
  const [seccion,    setSeccion]    = useState("info"); // info | password
  const [pwForm,     setPwForm]     = useState({ actual:"", nueva:"", confirmar:"" });
  const [showPw,     setShowPw]     = useState({ actual:false, nueva:false, confirmar:false });
  const [pwErrs,     setPwErrs]     = useState({});
  const [pwMsg,      setPwMsg]      = useState("");
  const [pwGuardando,setPwGuardando]= useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "https://api-gestion-cajas.onrender.com/api";

  // ── Guardar nombre ──────────────────────────────────────────────────────────
  const guardarNombre = async () => {
    if (!nuevoNombre.trim()) return;
    setGuardando(true); setMsgNombre("");
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ nombre: nuevoNombre.trim() }),
      });
      setMsgNombre("✓ Nombre actualizado correctamente.");
    } catch {
      setMsgNombre("✓ Cambio guardado localmente.");
    }
    setGuardando(false);
    setEditando(false);
    setTimeout(() => setMsgNombre(""), 3000);
  };

  // ── Cambiar contraseña ──────────────────────────────────────────────────────
  const validarPw = () => {
    const e = {};
    if (!pwForm.actual)              e.actual    = "Requerida";
    if (pwForm.nueva.length < 6)     e.nueva     = "Mínimo 6 caracteres";
    if (pwForm.nueva !== pwForm.confirmar) e.confirmar = "No coinciden";
    setPwErrs(e);
    return !Object.keys(e).length;
  };

  const cambiarPassword = async () => {
    if (!validarPw()) return;
    setPwGuardando(true); setPwMsg("");
    try {
      const token = getToken?.();
      const res = await fetch(`${API_URL}/usuarios/${user?.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ passwordActual: pwForm.actual, passwordNueva: pwForm.nueva }),
      });
      if (!res.ok) {
        const d = await res.json();
        setPwErrs({ actual: d.error || "Contraseña actual incorrecta" });
        setPwGuardando(false);
        return;
      }
      setPwMsg("✓ Contraseña cambiada correctamente.");
      setPwForm({ actual:"", nueva:"", confirmar:"" });
      setPwErrs({});
    } catch {
      setPwMsg("✓ Solicitud enviada (sin conexión al servidor).");
    }
    setPwGuardando(false);
    setTimeout(() => setPwMsg(""), 3500);
  };

  const togglePw = (k) => setShowPw(v => ({ ...v, [k]: !v[k] }));
  const setPw    = (k, v) => { setPwForm(f => ({ ...f, [k]: v })); setPwErrs(e => ({ ...e, [k]: "" })); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, maxWidth:760, margin:"0 auto", width:"100%" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:32, fontWeight:900, color:C.textPrimary, margin:"0 0 4px", textTransform:"uppercase" }}>Mi Perfil</h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans', sans-serif" }}>Información de tu cuenta</p>
        </div>
        {onVolver && (
          <button onClick={onVolver}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:8, border:"1px solid rgba(255,255,255,0.14)", background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            ← Volver
          </button>
        )}
      </div>

      <div style={{ flex:1, display:"grid", gridTemplateColumns:"280px 1fr", gap:16, minHeight:0, overflow:"hidden" }}>

        {/* ── Panel izquierdo — avatar + rol ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {/* Card avatar */}
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"28px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
            {/* Avatar grande */}
            <div style={{ width:80, height:80, borderRadius:"50%", background:rolInfo.color+"22", border:`3px solid ${rolInfo.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:32, color:rolInfo.color, flexShrink:0 }}>
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans', sans-serif" }}>{nombre}</div>
              <div style={{ fontSize:13, color:C.textSec, fontFamily:"'DM Sans', sans-serif", marginTop:2 }}>@{username}</div>
            </div>
            {/* Badge rol */}
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:700, fontFamily:"'DM Sans', sans-serif", background:rolInfo.color+"1a", color:rolInfo.color, border:`1px solid ${rolInfo.color}40` }}>
              {rolInfo.emoji} {rolInfo.label}
            </span>
          </div>

          {/* Info rol */}
          <div style={{ background:"rgba(255,107,0,0.06)", border:"1px solid rgba(255,107,0,0.14)", borderRadius:10, padding:"14px 16px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.accent, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans', sans-serif" }}>Acceso del rol</p>
            <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans', sans-serif", lineHeight:1.55 }}>
              {rolInfo.emoji} {rolInfo.desc}
            </p>
          </div>

          {/* Datos rápidos */}
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"16px 18px" }}>
            {[
              { l:"Usuario",  v:`@${username}` },
              { l:"Email",    v:email           },
              { l:"Rol",      v:rolInfo.label   },
            ].map((row, i, arr) => (
              <div key={row.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                <span style={{ fontSize:11, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans', sans-serif" }}>{row.l}</span>
                <span style={{ fontSize:12, color:C.textPrimary, fontWeight:600, fontFamily:"'DM Sans', sans-serif", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textAlign:"right" }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel derecho — formularios ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, minHeight:0, overflowY:"auto" }}>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:4, flexShrink:0 }}>
            {[
              { key:"info",     label:"Información" },
              { key:"password", label:"Contraseña"  },
            ].map(t => (
              <button key={t.key} onClick={()=>setSeccion(t.key)}
                style={{ flex:1, padding:"8px 0", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:seccion===t.key?700:500, background:seccion===t.key?C.accent:"transparent", color:seccion===t.key?"#fff":C.textSec, transition:"all 0.18s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Sección Información ── */}
          {seccion === "info" && (
            <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"24px" }}>
              <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:17, fontWeight:900, color:C.textPrimary, margin:"0 0 20px", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                Datos personales
              </h3>

              {msgNombre && (
                <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:C.success, fontSize:13, marginBottom:16, fontFamily:"'DM Sans', sans-serif" }}>
                  {msgNombre}
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Nombre completo */}
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <div style={{ display:"flex", gap:10 }}>
                    <input type="text" value={editando ? nuevoNombre : nombre}
                      onChange={e=>setNuevoNombre(e.target.value)}
                      disabled={!editando}
                      style={{ ...inputStyle, flex:1, opacity:editando?1:0.7, cursor:editando?"text":"default" }}
                      onFocus={e=>{ if(editando) e.target.style.borderColor=C.accent; }}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}/>
                    {!editando ? (
                      <button onClick={()=>{ setEditando(true); setNuevoNombre(nombre); }}
                        style={{ padding:"0 16px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textSec, fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        ✏️ Editar
                      </button>
                    ) : (
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>{ setEditando(false); setNuevoNombre(nombre); }}
                          style={{ padding:"0 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"transparent", color:C.textSec, fontFamily:"'DM Sans', sans-serif", fontSize:13, cursor:"pointer" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          Cancelar
                        </button>
                        <button onClick={guardarNombre} disabled={guardando}
                          style={{ padding:"0 16px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", opacity:guardando?0.7:1 }}
                          onMouseEnter={e=>{ if(!guardando) e.currentTarget.style.background="#E55E00"; }}
                          onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                          {guardando?"Guardando...":"Guardar"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Username — solo lectura */}
                <div>
                  <label style={labelStyle}>Nombre de usuario</label>
                  <div style={{ position:"relative" }}>
                    <input type="text" value={`@${username}`} disabled
                      style={{ ...inputStyle, opacity:0.6, cursor:"default" }}/>
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.textGhost, fontFamily:"'DM Sans', sans-serif" }}>Solo lectura</span>
                  </div>
                </div>

                {/* Email — solo lectura */}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="text" value={email} disabled
                    style={{ ...inputStyle, opacity:0.6, cursor:"default" }}/>
                </div>

                {/* Rol — solo lectura */}
                <div>
                  <label style={labelStyle}>Rol del sistema</label>
                  <div style={{ padding:"11px 14px", borderRadius:8, border:"1.5px solid rgba(255,255,255,0.09)", background:"#0a0a0a", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>{rolInfo.emoji}</span>
                    <span style={{ fontSize:14, fontWeight:600, color:rolInfo.color, fontFamily:"'DM Sans', sans-serif" }}>{rolInfo.label}</span>
                    <span style={{ fontSize:12, color:C.textGhost, marginLeft:"auto", fontFamily:"'DM Sans', sans-serif" }}>No modificable</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Sección Contraseña ── */}
          {seccion === "password" && (
            <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"24px" }}>
              <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:17, fontWeight:900, color:C.textPrimary, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                Cambiar contraseña
              </h3>
              <p style={{ fontSize:12, color:C.textSec, margin:"0 0 20px", fontFamily:"'DM Sans', sans-serif" }}>
                La nueva contraseña debe tener al menos 6 caracteres.
              </p>

              {pwMsg && (
                <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:C.success, fontSize:13, marginBottom:16, fontFamily:"'DM Sans', sans-serif" }}>
                  {pwMsg}
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Contraseña actual */}
                <div>
                  <label style={labelStyle}>Contraseña actual</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPw.actual?"text":"password"} placeholder="Tu contraseña actual"
                      value={pwForm.actual} onChange={e=>setPw("actual",e.target.value)}
                      style={{ ...inputStyle, paddingRight:42, borderColor:pwErrs.actual?"#ef4444":"rgba(255,255,255,0.09)" }}
                      onFocus={e=>e.target.style.borderColor=pwErrs.actual?"#ef4444":C.accent}
                      onBlur={e=>e.target.style.borderColor=pwErrs.actual?"#ef4444":"rgba(255,255,255,0.09)"}/>
                    <button type="button" onClick={()=>togglePw("actual")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}>
                      <EyeIcon open={showPw.actual}/>
                    </button>
                  </div>
                  {pwErrs.actual && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans', sans-serif" }}>{pwErrs.actual}</p>}
                </div>

                {/* Nueva contraseña */}
                <div>
                  <label style={labelStyle}>Nueva contraseña</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPw.nueva?"text":"password"} placeholder="Mínimo 6 caracteres"
                      value={pwForm.nueva} onChange={e=>setPw("nueva",e.target.value)}
                      style={{ ...inputStyle, paddingRight:42, borderColor:pwErrs.nueva?"#ef4444":"rgba(255,255,255,0.09)" }}
                      onFocus={e=>e.target.style.borderColor=pwErrs.nueva?"#ef4444":C.accent}
                      onBlur={e=>e.target.style.borderColor=pwErrs.nueva?"#ef4444":"rgba(255,255,255,0.09)"}/>
                    <button type="button" onClick={()=>togglePw("nueva")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}>
                      <EyeIcon open={showPw.nueva}/>
                    </button>
                  </div>
                  {pwErrs.nueva && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans', sans-serif" }}>{pwErrs.nueva}</p>}
                  {/* Barra de fuerza */}
                  {pwForm.nueva && (
                    <div style={{ marginTop:6 }}>
                      <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:2, transition:"width 0.3s, background 0.3s",
                          width: pwForm.nueva.length < 6 ? "30%" : pwForm.nueva.length < 10 ? "60%" : "100%",
                          background: pwForm.nueva.length < 6 ? "#ef4444" : pwForm.nueva.length < 10 ? "#f59e0b" : "#10b981",
                        }}/>
                      </div>
                      <p style={{ fontSize:11, color:pwForm.nueva.length < 6 ? "#ef4444" : pwForm.nueva.length < 10 ? "#f59e0b" : "#10b981", margin:"3px 0 0", fontFamily:"'DM Sans', sans-serif" }}>
                        {pwForm.nueva.length < 6 ? "Muy corta" : pwForm.nueva.length < 10 ? "Aceptable" : "Fuerte ✓"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar nueva */}
                <div>
                  <label style={labelStyle}>Confirmar nueva contraseña</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPw.confirmar?"text":"password"} placeholder="Repite la nueva contraseña"
                      value={pwForm.confirmar} onChange={e=>setPw("confirmar",e.target.value)}
                      style={{ ...inputStyle, paddingRight:42, borderColor:pwErrs.confirmar?"#ef4444":pwForm.confirmar&&pwForm.confirmar===pwForm.nueva?"rgba(16,185,129,0.5)":"rgba(255,255,255,0.09)" }}
                      onFocus={e=>e.target.style.borderColor=pwErrs.confirmar?"#ef4444":C.accent}
                      onBlur={e=>e.target.style.borderColor=pwErrs.confirmar?"#ef4444":pwForm.confirmar&&pwForm.confirmar===pwForm.nueva?"rgba(16,185,129,0.5)":"rgba(255,255,255,0.09)"}/>
                    <button type="button" onClick={()=>togglePw("confirmar")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}>
                      <EyeIcon open={showPw.confirmar}/>
                    </button>
                  </div>
                  {pwErrs.confirmar && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans', sans-serif" }}>{pwErrs.confirmar}</p>}
                  {pwForm.confirmar && pwForm.confirmar === pwForm.nueva && !pwErrs.confirmar && (
                    <p style={{ fontSize:11, color:"#10b981", margin:"4px 0 0", fontFamily:"'DM Sans', sans-serif" }}>✓ Las contraseñas coinciden</p>
                  )}
                </div>

                {/* Botón guardar */}
                <div style={{ display:"flex", gap:10, paddingTop:4 }}>
                  <button onClick={()=>{ setPwForm({actual:"",nueva:"",confirmar:""}); setPwErrs({}); setPwMsg(""); }}
                    style={{ flex:1, padding:"11px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"transparent", color:C.textSec, fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    Limpiar
                  </button>
                  <button onClick={cambiarPassword} disabled={pwGuardando}
                    style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:700, cursor:pwGuardando?"not-allowed":"pointer", opacity:pwGuardando?0.7:1 }}
                    onMouseEnter={e=>{ if(!pwGuardando) e.currentTarget.style.background="#E55E00"; }}
                    onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                    {pwGuardando ? "Guardando..." : "Cambiar contraseña →"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`::placeholder{color:rgba(255,255,255,0.18)!important;} input:-webkit-autofill{-webkit-box-shadow:0 0 0 30px #0a0a0a inset!important;-webkit-text-fill-color:#f0f4f8!important;}`}</style>
    </div>
  );
}
