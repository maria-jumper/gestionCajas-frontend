import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// ── Paleta reactiva ───────────────────────────────────────────────────────────
function useC() {
  const { isDark } = useTheme();
  return {
    bg:          isDark ? "#0d0d0d"  : "#f4f5f7",
    card:        isDark ? "#161616"  : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    textPrimary: isDark ? "#f0f4f8"  : "#1a1d23",
    textSec:     isDark ? "#8a9bb0"  : "#5a6478",
    textGhost:   isDark ? "#4a5568"  : "#9aa5b4",
    inputBg:     isDark ? "#111111"  : "#f9fafb",
    inputBorder: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.12)",
    hover:       isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    accent:      "#FF6B00",
    danger:      "#ef4444",
    success:     "#10b981",
    warning:     "#f59e0b",
    isDark,
  };
}

const MODULOS = [
  { key:"entregas",   label:"Entregas",   emoji:"📦", desc:"Registrar y gestionar entregas" },
  { key:"envios",     label:"Envíos",     emoji:"🚚", desc:"Registrar y gestionar envíos"   },
  { key:"inventario", label:"Inventario", emoji:"🗄️", desc:"Ver inventario del sistema"     },
  { key:"informes",   label:"Informes",   emoji:"📊", desc:"Ver reportes y métricas"         },
  { key:"gastos",     label:"Gastos",     emoji:"💰", desc:"Registrar gastos operativos"     },
];

const ROLES = [
  { value:"admin",      label:"Administrador", color:"#6366f1", emoji:"🛡️" },
  { value:"secretaria", label:"Secretaria",    color:"#10b981", emoji:"📋" },
];

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:4000/api"
  : "https://api-gestion-cajas.onrender.com/api";

// ── Helpers de UI ─────────────────────────────────────────────────────────────
function RolBadge({ rol }) {
  const r = ROLES.find(x => x.value === rol?.toLowerCase()) || ROLES[1];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:r.color+"1a", color:r.color, border:`1px solid ${r.color}40` }}>
      {r.emoji} {r.label}
    </span>
  );
}

function Avatar({ nombre, rol, size=36 }) {
  const r = ROLES.find(x => x.value === rol?.toLowerCase()) || ROLES[1];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:r.color+"22", border:`2px solid ${r.color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:size*0.4, color:r.color, fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
      {(nombre||"?").charAt(0).toUpperCase()}
    </div>
  );
}

function EyeIcon({ open }) {
  return open
    ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

// ── Modal permisos ─────────────────────────────────────────────────────────────
function ModalPermisos({ usuario, onGuardar, onCerrar }) {
  const C = useC();
  const [sel, setSel] = useState(usuario.modulos || []);
  const toggle = k => setSel(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:480, padding:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <Avatar nombre={usuario.nombre} rol={usuario.rol} size={38}/>
          <div>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Gestionar accesos</h3>
            <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{usuario.nombre} · @{usuario.username}</p>
          </div>
          <button onClick={onCerrar} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:22, padding:4, outline:"none" }}>×</button>
        </div>
        <p style={{ fontSize:12, color:C.textGhost, margin:"0 0 16px", fontFamily:"'DM Sans',sans-serif" }}>
          Activa o desactiva los módulos. Los cambios se aplican al guardar.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
          {MODULOS.map(mod => {
            const on = sel.includes(mod.key);
            return (
              <button key={mod.key} onClick={() => toggle(mod.key)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`1.5px solid ${on ? C.accent : C.cardBorder}`, background:on ? "rgba(255,107,0,0.08)" : C.inputBg, cursor:"pointer", transition:"all 0.18s", textAlign:"left", outline:"none" }}>
                <div style={{ width:36, height:20, borderRadius:10, background:on ? C.accent : "rgba(128,128,128,0.3)", position:"relative", flexShrink:0, transition:"background 0.2s" }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:on ? 18 : 2, transition:"left 0.2s" }}/>
                </div>
                <span style={{ fontSize:17 }}>{mod.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:on ? C.textPrimary : C.textSec, fontFamily:"'DM Sans',sans-serif" }}>{mod.label}</div>
                  <div style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{mod.desc}</div>
                </div>
                {on && <span style={{ fontSize:11, fontWeight:700, color:C.accent, background:"rgba(255,107,0,0.12)", padding:"2px 8px", borderRadius:20, fontFamily:"'DM Sans',sans-serif" }}>Activo</span>}
              </button>
            );
          })}
        </div>
        <div style={{ padding:"10px 14px", borderRadius:8, background:C.hover, marginBottom:16 }}>
          <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
            {sel.length === 0 ? "⚠️ Sin módulos — solo verá el dashboard básico." : `✓ ${sel.length} módulo${sel.length > 1 ? "s" : ""}: ${sel.map(k => MODULOS.find(m => m.key === k)?.label).join(", ")}`}
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCerrar} style={{ flex:1, padding:"10px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
            onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            Cancelar
          </button>
          <button onClick={() => onGuardar(sel)} style={{ flex:2, padding:"10px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", outline:"none" }}
            onMouseEnter={e => e.currentTarget.style.background = "#E55E00"} onMouseLeave={e => e.currentTarget.style.background = C.accent}>
            Guardar accesos →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal editar usuario ───────────────────────────────────────────────────────
function ModalEditar({ usuario, onGuardar, onCerrar }) {
  const C = useC();
  const iS = { width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s" };
  const lS = { display:"block", fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
  const eS = { fontSize:11, color:C.danger, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" };

  const [form,  setForm]   = useState({ nombre:usuario.nombre, email:usuario.email || "" });
  const [pwF,   setPwF]    = useState({ nueva:"", confirmar:"" });
  const [showPw,setShowPw] = useState({ nueva:false, confirmar:false });
  const [tab,   setTab]    = useState("info");
  const [errs,  setErrs]   = useState({});
  const [msg,   setMsg]    = useState("");

  const guardarInfo = () => {
    if (!form.nombre.trim()) { setErrs({ nombre:"Requerido" }); return; }
    onGuardar({ ...usuario, nombre:form.nombre.trim(), email:form.email.trim() });
    setMsg("✓ Información actualizada."); setTimeout(() => setMsg(""), 2000);
  };
  const guardarPw = () => {
    const e = {};
    if (pwF.nueva.length < 6)           e.nueva     = "Mínimo 6 caracteres";
    if (pwF.nueva !== pwF.confirmar)     e.confirmar = "No coinciden";
    setErrs(e); if (Object.keys(e).length) return;
    onGuardar({ ...usuario, _newPassword:pwF.nueva });
    setMsg("✓ Contraseña actualizada."); setPwF({ nueva:"", confirmar:"" }); setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:440, padding:"28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Avatar nombre={usuario.nombre} rol={usuario.rol} size={40}/>
            <div>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Editar usuario</h3>
              <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>@{usuario.username}</p>
            </div>
          </div>
          <button onClick={onCerrar} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:22, padding:4, outline:"none" }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:C.hover, borderRadius:8, padding:3, marginBottom:18 }}>
          {[{ k:"info", l:"Información" }, { k:"password", l:"Contraseña" }].map(t => (
            <button key={t.k} onClick={() => { setTab(t.k); setErrs({}); setMsg(""); }}
              style={{ flex:1, padding:"7px 0", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:tab===t.k?700:500, background:tab===t.k?C.accent:"transparent", color:tab===t.k?"#fff":C.textSec, outline:"none", transition:"all 0.18s" }}>
              {t.l}
            </button>
          ))}
        </div>

        {msg && <div style={{ padding:"9px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:C.success, fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{msg}</div>}

        {tab === "info" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={lS}>Nombre completo</label>
              <input type="text" value={form.nombre} onChange={e => { setForm(f => ({ ...f, nombre:e.target.value })); setErrs({}); }}
                style={{ ...iS, borderColor:errs.nombre ? "#ef4444" : C.inputBorder }}
                onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = errs.nombre ? "#ef4444" : C.inputBorder}/>
              {errs.nombre && <p style={eS}>{errs.nombre}</p>}
            </div>
            <div>
              <label style={lS}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} placeholder="correo@ejemplo.com"
                style={iS} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder}/>
            </div>
            <div>
              <label style={lS}>Usuario</label>
              <input type="text" value={`@${usuario.username}`} disabled style={{ ...iS, opacity:0.5, cursor:"default" }}/>
              <p style={{ fontSize:11, color:C.textGhost, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>No se puede cambiar.</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onCerrar} style={{ flex:1, padding:"10px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
                onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Cancelar</button>
              <button onClick={guardarInfo} style={{ flex:2, padding:"10px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", outline:"none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#E55E00"} onMouseLeave={e => e.currentTarget.style.background = C.accent}>Guardar →</button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={lS}>Nueva contraseña</label>
              <div style={{ position:"relative" }}>
                <input type={showPw.nueva ? "text" : "password"} value={pwF.nueva}
                  onChange={e => { setPwF(f => ({ ...f, nueva:e.target.value })); setErrs(v => ({ ...v, nueva:"" })); }}
                  placeholder="Mínimo 6 caracteres"
                  style={{ ...iS, paddingRight:42, borderColor:errs.nueva ? "#ef4444" : C.inputBorder }}
                  onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = errs.nueva ? "#ef4444" : C.inputBorder}/>
                <button type="button" onClick={() => setShowPw(v => ({ ...v, nueva:!v.nueva }))} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0, outline:"none" }}>
                  <EyeIcon open={showPw.nueva}/>
                </button>
              </div>
              {errs.nueva && <p style={eS}>{errs.nueva}</p>}
            </div>
            <div>
              <label style={lS}>Confirmar contraseña</label>
              <div style={{ position:"relative" }}>
                <input type={showPw.confirmar ? "text" : "password"} value={pwF.confirmar}
                  onChange={e => { setPwF(f => ({ ...f, confirmar:e.target.value })); setErrs(v => ({ ...v, confirmar:"" })); }}
                  placeholder="Repite la contraseña"
                  style={{ ...iS, paddingRight:42, borderColor:errs.confirmar ? "#ef4444" : C.inputBorder }}
                  onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder}/>
                <button type="button" onClick={() => setShowPw(v => ({ ...v, confirmar:!v.confirmar }))} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0, outline:"none" }}>
                  <EyeIcon open={showPw.confirmar}/>
                </button>
              </div>
              {errs.confirmar && <p style={eS}>{errs.confirmar}</p>}
              {pwF.confirmar && pwF.confirmar === pwF.nueva && <p style={{ fontSize:11, color:C.success, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>✓ Coinciden</p>}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onCerrar} style={{ flex:1, padding:"10px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
                onMouseEnter={e => e.currentTarget.style.background = C.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Cancelar</button>
              <button onClick={guardarPw} style={{ flex:2, padding:"10px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", outline:"none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#E55E00"} onMouseLeave={e => e.currentTarget.style.background = C.accent}>Cambiar contraseña →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function GestionUsuarios({ onVolver }) {
  const { getToken } = useAuth();
  const C = useC();

  const [vista,         setVista]         = useState("lista");
  const [usuarios,      setUsuarios]      = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [modalPermisos, setModalPermisos] = useState(null);
  const [modalEditar,   setModalEditar]   = useState(null);
  const [confirmDel,    setConfirmDel]    = useState(null);
  const [creando,       setCreando]       = useState(false);
  const [exito,         setExito]         = useState("");
  const [errGlobal,     setErrGlobal]     = useState("");
  const [form,          setForm]          = useState({ username:"", nombre:"", password:"", confirmar:"", modulos:[] });
  const [showP1,        setShowP1]        = useState(false);
  const [showP2,        setShowP2]        = useState(false);
  const [errs,          setErrs]          = useState({});

  // Estilos dependientes del tema — definidos aquí, después de useC()
  const iS  = { width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s" };
  const lS  = { display:"block", fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
  const eS  = { fontSize:11, color:C.danger, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" };
  const bO  = { display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 18px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", outline:"none", whiteSpace:"nowrap" };
  const bG  = { ...bO, background:"transparent", color:C.textPrimary, border:`1px solid ${C.cardBorder}` };

  const setF = (k, v) => setForm(f => ({ ...f, [k]:v }));

  // Cargar usuarios del backend
  useEffect(() => {
    (async () => {
      setCargando(true);
      try {
        const token = getToken?.();
        const res = await fetch(`${API_URL}/usuarios`, { headers: token ? { Authorization:`Bearer ${token}` } : {} });
        if (res.ok) {
          const d = await res.json();
          if (Array.isArray(d)) setUsuarios(d.map(u => ({ ...u, modulos:u.modulos||[], activo:u.activo!==false })));
        }
      } catch (e) { console.error(e); }
      setCargando(false);
    })();
  }, []);

  const validar = () => {
    const e = {};
    if (!form.username.trim())           e.username  = "Requerido";
    if (form.username.includes(" "))     e.username  = "Sin espacios";
    if (!form.nombre.trim())             e.nombre    = "Requerido";
    if (form.password.length < 6)        e.password  = "Mínimo 6 caracteres";
    if (form.password !== form.confirmar) e.confirmar = "No coinciden";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const crear = async () => {
    if (!validar()) return;
    setCreando(true); setErrGlobal("");
    try {
      const token = getToken?.();
      const res = await fetch(`${API_URL}/usuarios`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body:JSON.stringify({ username:form.username.trim().toLowerCase(), nombre:form.nombre.trim(), password:form.password, rol:"secretaria", modulos:form.modulos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Error al crear usuario");
      const nuevo = { id:data.id||data._id||Date.now(), username:form.username.trim().toLowerCase(), nombre:form.nombre.trim(), rol:"secretaria", email:data.email||`${form.username}@cajasflow.com`, activo:true, creado:new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"}), modulos:form.modulos };
      setUsuarios(p => [...p, nuevo]);
      setExito(`@${nuevo.username} creado correctamente.`);
      setForm({ username:"", nombre:"", password:"", confirmar:"", modulos:[] });
      setErrs({});
      setTimeout(() => { setExito(""); setVista("lista"); }, 1800);
    } catch (err) {
      setErrGlobal(err.message || "No se pudo conectar con el servidor.");
    }
    setCreando(false);
  };

  const guardarPermisos = async (uid, mods) => {
    setUsuarios(p => p.map(u => u.id===uid ? { ...u, modulos:mods } : u));
    try {
      localStorage.setItem(`cf-modulos-${uid}`, JSON.stringify(mods));
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${uid}`, { method:"PUT", headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) }, body:JSON.stringify({ modulos:mods }) });
    } catch {}
    setModalPermisos(null);
  };

  const guardarEdicion = async (u) => {
    setUsuarios(p => p.map(x => x.id===u.id ? { ...x, nombre:u.nombre, email:u.email } : x));
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${u.id}`, { method:"PUT", headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) }, body:JSON.stringify(u) });
    } catch {}
  };

  const toggleActivo = async (u) => {
    const nv = !u.activo;
    setUsuarios(p => p.map(x => x.id===u.id ? { ...x, activo:nv } : x));
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${u.id}`, { method:"PUT", headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) }, body:JSON.stringify({ activo:nv }) });
    } catch {}
  };

  const eliminar = async (id) => {
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${id}`, { method:"DELETE", headers:token?{Authorization:`Bearer ${token}`}:{} });
    } catch {}
    setUsuarios(p => p.filter(u => u.id !== id));
    setConfirmDel(null);
  };

  const toggleMod = k => setF("modulos", form.modulos.includes(k) ? form.modulos.filter(x=>x!==k) : [...form.modulos, k]);

  // ══ LISTA ══════════════════════════════════════════════════════════════════
  if (vista === "lista") return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:C.textPrimary, margin:"0 0 4px", textTransform:"uppercase" }}>Gestión de Usuarios</h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{usuarios.length} usuarios registrados</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setVista("nuevo")} style={bO} onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo usuario
          </button>
          {onVolver && <button onClick={onVolver} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
        {cargando ? (
          <div style={{ textAlign:"center", padding:"40px", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>No hay usuarios. Crea el primero.</div>
        ) : usuarios.map(u => {
          const esAdmin = u.rol === "admin" || u.rol === "administrador";
          return (
            <div key={u.id} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"14px 18px", opacity:u.activo?1:0.7, transition:"all 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <Avatar nombre={u.nombre} rol={u.rol} size={42}/>
                <div style={{ flex:1, minWidth:150 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:15, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{u.nombre}</span>
                    <RolBadge rol={u.rol}/>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:u.activo?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.1)", color:u.activo?C.success:C.danger, border:`1px solid ${u.activo?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}` }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:u.activo?C.success:C.danger }}/>{u.activo?"Activo":"Inactivo"}
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:C.textSec, marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>@{u.username}{u.email && ` · ${u.email}`}</div>
                </div>

                {!esAdmin ? (
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", maxWidth:260 }}>
                    {u.modulos?.length > 0
                      ? u.modulos.map(k => { const m=MODULOS.find(x=>x.key===k); return m ? <span key={k} style={{ fontSize:11, padding:"2px 7px", borderRadius:20, background:"rgba(255,107,0,0.1)", color:C.accent, border:"1px solid rgba(255,107,0,0.2)", fontFamily:"'DM Sans',sans-serif" }}>{m.emoji} {m.label}</span> : null; })
                      : <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic" }}>Sin módulos</span>}
                  </div>
                ) : (
                  <span style={{ fontSize:11, color:"#6366f1", fontFamily:"'DM Sans',sans-serif", fontWeight:600, background:"rgba(99,102,241,0.1)", padding:"4px 10px", borderRadius:20, border:"1px solid rgba(99,102,241,0.25)" }}>🛡️ Acceso total</span>
                )}

                <div style={{ display:"flex", gap:6, flexShrink:0, flexWrap:"wrap" }}>
                  {!esAdmin && <>
                    <button onClick={() => setModalPermisos(u)} style={{ padding:"5px 10px", borderRadius:7, border:"1px solid rgba(255,107,0,0.3)", background:"rgba(255,107,0,0.1)", color:C.accent, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", outline:"none" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,0,0.2)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,107,0,0.1)"}>🔑 Accesos</button>
                    <button onClick={() => toggleActivo(u)} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${u.activo?"rgba(245,158,11,0.3)":"rgba(16,185,129,0.3)"}`, background:u.activo?"rgba(245,158,11,0.1)":"rgba(16,185,129,0.1)", color:u.activo?C.warning:C.success, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", outline:"none" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{u.activo ? "⏸ Desactivar" : "▶ Activar"}</button>
                  </>}
                  <button onClick={() => setModalEditar(u)} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${C.cardBorder}`, background:C.hover, color:C.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", outline:"none" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>✏️ Editar</button>
                  {!esAdmin && <button onClick={() => setConfirmDel({ id:u.id, username:u.username })} style={{ padding:"5px 10px", borderRadius:7, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.1)", color:C.danger, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", outline:"none" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.2)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>🗑 Eliminar</button>}
                </div>
              </div>
              <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${C.cardBorder}`, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Creado: {u.creado||"—"}</span>
                {!esAdmin && <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{(u.modulos||[]).length}/{MODULOS.length} módulos</span>}
              </div>
            </div>
          );
        })}
      </div>

      {modalPermisos && <ModalPermisos usuario={modalPermisos} onGuardar={m => guardarPermisos(modalPermisos.id, m)} onCerrar={() => setModalPermisos(null)}/>}
      {modalEditar   && <ModalEditar   usuario={modalEditar}   onGuardar={u => { guardarEdicion(u); setModalEditar(null); }} onCerrar={() => setModalEditar(null)}/>}

      {confirmDel && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, maxWidth:360, width:"100%", padding:"24px" }}>
            <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:17, fontWeight:700, color:C.textPrimary, margin:"0 0 10px" }}>¿Eliminar usuario?</h3>
            <p style={{ fontSize:13, color:C.textSec, margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif" }}>Se eliminará <strong style={{ color:C.textPrimary }}>@{confirmDel.username}</strong> permanentemente.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1, padding:"10px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer", outline:"none" }} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={() => eliminar(confirmDel.id)} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", outline:"none" }} onMouseEnter={e=>e.currentTarget.style.background="#dc2626"} onMouseLeave={e=>e.currentTarget.style.background="#ef4444"}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} ::placeholder{color:rgba(128,128,128,0.4)!important;}`}</style>
    </div>
  );

  // ══ NUEVO USUARIO ══════════════════════════════════════════════════════════
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:C.textPrimary, margin:"0 0 4px", textTransform:"uppercase" }}>Nuevo Usuario</h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Completa la información y asigna los módulos de acceso</p>
        </div>
        <button onClick={() => { setVista("lista"); setErrs({}); setErrGlobal(""); }} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Lista de usuarios</button>
      </div>

      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 280px", gap:16, minHeight:0, overflow:"hidden" }}>
        <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"22px", display:"flex", flexDirection:"column", overflowY:"auto" }}>

          {exito     && <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:C.success, fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>✓ {exito}</div>}
          {errGlobal && <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:C.danger, fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>⚠️ {errGlobal}</div>}

          <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>
            <div>
              <label style={lS}>Nombre de usuario</label>
              <input type="text" placeholder="ej: maria.garcia" value={form.username} onChange={e => { setF("username", e.target.value.replace(/\s/g,"")); setErrs(v=>({...v,username:""})); }}
                style={{ ...iS, borderColor:errs.username?"#ef4444":C.inputBorder }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.username?"#ef4444":C.inputBorder}/>
              {errs.username && <p style={eS}>{errs.username}</p>}
            </div>
            <div>
              <label style={lS}>Nombre completo</label>
              <input type="text" placeholder="ej: María García" value={form.nombre} onChange={e => { setF("nombre", e.target.value); setErrs(v=>({...v,nombre:""})); }}
                style={{ ...iS, borderColor:errs.nombre?"#ef4444":C.inputBorder }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.nombre?"#ef4444":C.inputBorder}/>
              {errs.nombre && <p style={eS}>{errs.nombre}</p>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={lS}>Contraseña</label>
                <div style={{ position:"relative" }}>
                  <input type={showP1?"text":"password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={e=>{setF("password",e.target.value);setErrs(v=>({...v,password:""}));}}
                    style={{ ...iS, paddingRight:40, borderColor:errs.password?"#ef4444":C.inputBorder }}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.password?"#ef4444":C.inputBorder}/>
                  <button type="button" onClick={()=>setShowP1(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0, outline:"none" }}><EyeIcon open={showP1}/></button>
                </div>
                {errs.password && <p style={eS}>{errs.password}</p>}
              </div>
              <div>
                <label style={lS}>Confirmar contraseña</label>
                <div style={{ position:"relative" }}>
                  <input type={showP2?"text":"password"} placeholder="Repite la contraseña" value={form.confirmar} onChange={e=>{setF("confirmar",e.target.value);setErrs(v=>({...v,confirmar:""}));}}
                    style={{ ...iS, paddingRight:40, borderColor:errs.confirmar?"#ef4444":C.inputBorder }}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.confirmar?"#ef4444":C.inputBorder}/>
                  <button type="button" onClick={()=>setShowP2(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0, outline:"none" }}><EyeIcon open={showP2}/></button>
                </div>
                {errs.confirmar && <p style={eS}>{errs.confirmar}</p>}
              </div>
            </div>

            <div>
              <label style={lS}>Módulos de acceso</label>
              <p style={{ fontSize:11, color:C.textGhost, margin:"0 0 8px", fontFamily:"'DM Sans',sans-serif" }}>Selecciona los módulos que podrá usar este usuario.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {MODULOS.map(mod => {
                  const on = form.modulos.includes(mod.key);
                  return (
                    <button key={mod.key} type="button" onClick={() => toggleMod(mod.key)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, border:`1.5px solid ${on?C.accent:C.cardBorder}`, background:on?"rgba(255,107,0,0.08)":C.inputBg, cursor:"pointer", transition:"all 0.18s", textAlign:"left", outline:"none" }}>
                      <div style={{ width:30, height:16, borderRadius:8, background:on?C.accent:"rgba(128,128,128,0.3)", position:"relative", flexShrink:0 }}>
                        <div style={{ width:12, height:12, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:on?16:2, transition:"left 0.2s" }}/>
                      </div>
                      <span style={{ fontSize:14 }}>{mod.emoji}</span>
                      <span style={{ fontSize:13, fontWeight:on?700:500, color:on?C.textPrimary:C.textSec, fontFamily:"'DM Sans',sans-serif", flex:1 }}>{mod.label}</span>
                      <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{mod.desc}</span>
                    </button>
                  );
                })}
              </div>
              {form.modulos.length === 0 && <p style={{ fontSize:11, color:C.warning, margin:"6px 0 0", fontFamily:"'DM Sans',sans-serif" }}>⚠️ Sin módulos — solo verá el dashboard básico.</p>}
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:16, flexShrink:0 }}>
            <button onClick={() => { setVista("lista"); setErrs({}); setErrGlobal(""); }} style={bG} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
            <button onClick={crear} disabled={creando} style={{ ...bO, flex:2, opacity:creando?0.7:1 }} onMouseEnter={e=>{ if(!creando) e.currentTarget.style.background="#E55E00"; }} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
              {creando ? "Creando..." : "Crear usuario →"}
            </button>
          </div>
        </div>

        {/* Vista previa */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"18px", flex:1 }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 14px", fontFamily:"'DM Sans',sans-serif" }}>Vista previa</p>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"#10b98122", border:"2px solid #10b98145", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:20, color:"#10b981" }}>
                {form.nombre ? form.nombre.charAt(0).toUpperCase() : form.username ? form.username.charAt(0).toUpperCase() : "?"}
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, fontWeight:700, color:form.nombre?C.textPrimary:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{form.nombre||"Nombre completo"}</div>
                <div style={{ fontSize:12, color:form.username?C.textSec:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{form.username?`@${form.username}`:"@usuario"}</div>
              </div>
              <RolBadge rol="secretaria"/>
            </div>
            <div style={{ marginBottom:10 }}>
              <p style={{ fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px", fontFamily:"'DM Sans',sans-serif" }}>Módulos asignados</p>
              {form.modulos.length === 0
                ? <p style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic" }}>Ninguno</p>
                : <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{form.modulos.map(k => { const m=MODULOS.find(x=>x.key===k); return m?<span key={k} style={{ fontSize:11, padding:"2px 7px", borderRadius:20, background:"rgba(255,107,0,0.1)", color:C.accent, border:"1px solid rgba(255,107,0,0.2)", fontFamily:"'DM Sans',sans-serif" }}>{m.emoji} {m.label}</span>:null; })}</div>}
            </div>
          </div>
          <div style={{ background:"rgba(255,107,0,0.06)", border:"1px solid rgba(255,107,0,0.14)", borderRadius:10, padding:"12px 14px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.accent, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Acceso del rol</p>
            <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>📋 Solo accede a los módulos que le asignes.</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} ::placeholder{color:rgba(128,128,128,0.4)!important;}`}</style>
    </div>
  );
}