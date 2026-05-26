import React, { useState, useEffect } from "react";
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
  warning:     "#f59e0b",
};

// ── Módulos disponibles para dar acceso ───────────────────────────────────────
const MODULOS_DISPONIBLES = [
  { key: "entregas",   label: "Entregas",   emoji: "📦", desc: "Registrar y gestionar entregas" },
  { key: "envios",     label: "Envíos",     emoji: "🚚", desc: "Registrar y gestionar envíos"  },
  { key: "inventario", label: "Inventario", emoji: "🗄️", desc: "Ver inventario del sistema"    },
  { key: "informes",   label: "Informes",   emoji: "📊", desc: "Ver reportes y métricas"        },
  { key: "gastos",     label: "Gastos",     emoji: "💰", desc: "Registrar gastos operativos"    },
];

const ROLES = [
  { value: "secretaria", label: "Secretaria", color: "#10b981", emoji: "📋" },
];
const ROLES_ALL = [
  { value: "admin",      label: "Administrador", color: "#6366f1", emoji: "🛡️" },
  { value: "secretaria", label: "Secretaria",    color: "#10b981", emoji: "📋" },
];

const DEMO_USUARIOS = [
  { id: 1, username: "admin",     nombre: "Administrador Principal", rol: "admin",      email: "admin@cajasflow.com",  activo: true,  creado: "06 may 2026", modulos: ["entregas","envios","inventario","informes","gastos"] },
  { id: 2, username: "secretaria1",nombre: "María García",           rol: "secretaria", email: "maria@cajasflow.com",  activo: true,  creado: "10 may 2026", modulos: ["entregas","envios"] },
  { id: 3, username: "secretaria2",nombre: "Juan López",             rol: "secretaria", email: "juan@cajasflow.com",   activo: false, creado: "12 may 2026", modulos: [] },
];

// ── Estilos base ──────────────────────────────────────────────────────────────
const inputS = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", borderRadius: 8,
  border: "1.5px solid rgba(255,255,255,0.09)",
  background: "#0a0a0a", color: "#f0f4f8",
  fontSize: 14, outline: "none",
  fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
};
const labelS = { display:"block", fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
const errS   = { fontSize:11, color:C.danger, margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" };
const btnOrg = { display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 18px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", transition:"background 0.2s", whiteSpace:"nowrap" };
const btnGh  = { ...btnOrg, background:"transparent", color:C.textPrimary, border:"1px solid rgba(255,255,255,0.14)" };

function RolBadge({ rol }) {
  const r = ROLES_ALL.find(x => x.value === rol?.toLowerCase()) || ROLES_ALL[1];
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:r.color+"1a", color:r.color, border:`1px solid ${r.color}40` }}>{r.emoji} {r.label}</span>;
}

function AvatarCircle({ nombre, rol, size=36 }) {
  const r = ROLES_ALL.find(x => x.value === rol?.toLowerCase()) || ROLES_ALL[1];
  return <div style={{ width:size, height:size, borderRadius:"50%", background:r.color+"25", border:`2px solid ${r.color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:size*0.4, color:r.color, fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>{(nombre||"?").charAt(0).toUpperCase()}</div>;
}

function EyeIcon({ open }) {
  return open
    ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

// ── Modal de permisos ─────────────────────────────────────────────────────────
function ModalPermisos({ usuario, onGuardar, onCerrar }) {
  const [seleccionados, setSeleccionados] = useState(usuario.modulos || []);

  const toggle = (key) => setSeleccionados(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, width:"100%", maxWidth:480, padding:"28px", animation:"fadeInUp 0.2s ease" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,107,0,0.14)", border:"2px solid rgba(255,107,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:C.accent, flexShrink:0 }}>
            {(usuario.nombre||"?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Gestionar accesos</h3>
            <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{usuario.nombre} · @{usuario.username}</p>
          </div>
          <button onClick={onCerrar} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:20, padding:4 }}>×</button>
        </div>

        <p style={{ fontSize:12, color:C.textGhost, margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif" }}>
          Selecciona los módulos a los que este usuario tendrá acceso. Los cambios se aplican en tiempo real.
        </p>

        {/* Módulos */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:22 }}>
          {MODULOS_DISPONIBLES.map(mod => {
            const activo = seleccionados.includes(mod.key);
            return (
              <button key={mod.key} onClick={() => toggle(mod.key)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`1.5px solid ${activo ? C.accent : "rgba(255,255,255,0.07)"}`, background:activo ? "rgba(255,107,0,0.08)" : "#0a0a0a", cursor:"pointer", transition:"all 0.18s", textAlign:"left" }}>
                {/* Toggle visual */}
                <div style={{ width:36, height:20, borderRadius:10, background:activo ? C.accent : "rgba(255,255,255,0.12)", position:"relative", flexShrink:0, transition:"background 0.2s" }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:activo ? 18 : 2, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }}/>
                </div>
                <span style={{ fontSize:18, lineHeight:1 }}>{mod.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:activo ? C.textPrimary : C.textSec, fontFamily:"'DM Sans',sans-serif" }}>{mod.label}</div>
                  <div style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{mod.desc}</div>
                </div>
                {activo && <span style={{ fontSize:11, fontWeight:700, color:C.accent, fontFamily:"'DM Sans',sans-serif", background:"rgba(255,107,0,0.12)", padding:"2px 8px", borderRadius:20 }}>Activo</span>}
              </button>
            );
          })}
        </div>

        {/* Resumen */}
        <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,0.04)", marginBottom:20 }}>
          <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
            {seleccionados.length === 0
              ? "⚠️ Sin módulos activos — solo verá el dashboard básico."
              : `✓ Acceso a ${seleccionados.length} módulo${seleccionados.length>1?"s":""}: ${seleccionados.map(k => MODULOS_DISPONIBLES.find(m=>m.key===k)?.label).join(", ")}`}
          </p>
        </div>

        {/* Botones */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCerrar} style={{ ...btnGh, flex:1 }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
          <button onClick={() => onGuardar(seleccionados)} style={{ ...btnOrg, flex:2 }}
            onMouseEnter={e=>e.currentTarget.style.background="#E55E00"}
            onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Guardar accesos →</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal editar usuario ──────────────────────────────────────────────────────
function ModalEditarUsuario({ usuario, onGuardar, onCerrar }) {
  const [form, setForm] = useState({ nombre: usuario.nombre, email: usuario.email || "" });
  const [pwForm, setPwForm] = useState({ nueva:"", confirmar:"" });
  const [showPw, setShowPw] = useState({ nueva:false, confirmar:false });
  const [tab, setTab] = useState("info"); // info | password
  const [errs, setErrs] = useState({});
  const [exito, setExito] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPw = (k, v) => { setPwForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: "" })); };

  const guardarInfo = () => {
    if (!form.nombre.trim()) { setErrs({ nombre: "Requerido" }); return; }
    onGuardar({ ...usuario, nombre: form.nombre.trim(), email: form.email.trim() });
    setExito("✓ Información actualizada.");
    setTimeout(() => setExito(""), 2000);
  };

  const guardarPassword = () => {
    const e = {};
    if (pwForm.nueva.length < 6)              e.nueva     = "Mínimo 6 caracteres";
    if (pwForm.nueva !== pwForm.confirmar)     e.confirmar = "No coinciden";
    setErrs(e);
    if (Object.keys(e).length) return;
    onGuardar({ ...usuario, _newPassword: pwForm.nueva });
    setExito("✓ Contraseña actualizada.");
    setPwForm({ nueva:"", confirmar:"" });
    setTimeout(() => setExito(""), 2000);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, width:"100%", maxWidth:440, padding:"28px", animation:"fadeInUp 0.2s ease" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <AvatarCircle nombre={usuario.nombre} rol={usuario.rol} size={40}/>
            <div>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Editar usuario</h3>
              <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>@{usuario.username}</p>
            </div>
          </div>
          <button onClick={onCerrar} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:20, padding:4 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.04)", borderRadius:8, padding:3, marginBottom:20 }}>
          {[{k:"info",l:"Información"},{k:"password",l:"Contraseña"}].map(t => (
            <button key={t.k} onClick={() => { setTab(t.k); setErrs({}); setExito(""); }}
              style={{ flex:1, padding:"7px 0", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:tab===t.k?700:500, background:tab===t.k?C.accent:"transparent", color:tab===t.k?"#fff":C.textSec, transition:"all 0.18s" }}>
              {t.l}
            </button>
          ))}
        </div>

        {exito && <div style={{ padding:"9px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:C.success, fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{exito}</div>}

        {tab === "info" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={labelS}>Nombre completo</label>
              <input type="text" value={form.nombre} onChange={e => { set("nombre",e.target.value); setErrs({}); }}
                style={{ ...inputS, borderColor:errs.nombre?"#ef4444":"rgba(255,255,255,0.09)" }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.nombre?"#ef4444":"rgba(255,255,255,0.09)"}/>
              {errs.nombre && <p style={errS}>{errs.nombre}</p>}
            </div>
            <div>
              <label style={labelS}>Email</label>
              <input type="email" value={form.email} onChange={e => set("email",e.target.value)} placeholder="correo@ejemplo.com"
                style={inputS} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}/>
            </div>
            <div>
              <label style={labelS}>Usuario</label>
              <input type="text" value={`@${usuario.username}`} disabled style={{ ...inputS, opacity:0.5, cursor:"default" }}/>
              <p style={{ ...errS, color:C.textGhost }}>El nombre de usuario no se puede cambiar.</p>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button onClick={onCerrar} style={{ ...btnGh, flex:1 }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={guardarInfo} style={{ ...btnOrg, flex:2 }} onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Guardar →</button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={labelS}>Nueva contraseña</label>
              <div style={{ position:"relative" }}>
                <input type={showPw.nueva?"text":"password"} value={pwForm.nueva} onChange={e=>setPw("nueva",e.target.value)} placeholder="Mínimo 6 caracteres"
                  style={{ ...inputS, paddingRight:42, borderColor:errs.nueva?"#ef4444":"rgba(255,255,255,0.09)" }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.nueva?"#ef4444":"rgba(255,255,255,0.09)"}/>
                <button type="button" onClick={()=>setShowPw(v=>({...v,nueva:!v.nueva}))} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}>
                  <EyeIcon open={showPw.nueva}/>
                </button>
              </div>
              {errs.nueva && <p style={errS}>{errs.nueva}</p>}
              {pwForm.nueva && (
                <div style={{ marginTop:5 }}>
                  <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:2, transition:"all 0.3s", width:pwForm.nueva.length<6?"30%":pwForm.nueva.length<10?"60%":"100%", background:pwForm.nueva.length<6?"#ef4444":pwForm.nueva.length<10?"#f59e0b":"#10b981" }}/>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={labelS}>Confirmar contraseña</label>
              <div style={{ position:"relative" }}>
                <input type={showPw.confirmar?"text":"password"} value={pwForm.confirmar} onChange={e=>setPw("confirmar",e.target.value)} placeholder="Repite la contraseña"
                  style={{ ...inputS, paddingRight:42, borderColor:errs.confirmar?"#ef4444":pwForm.confirmar&&pwForm.confirmar===pwForm.nueva?"rgba(16,185,129,0.5)":"rgba(255,255,255,0.09)" }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.confirmar?"#ef4444":"rgba(255,255,255,0.09)"}/>
                <button type="button" onClick={()=>setShowPw(v=>({...v,confirmar:!v.confirmar}))} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}>
                  <EyeIcon open={showPw.confirmar}/>
                </button>
              </div>
              {errs.confirmar && <p style={errS}>{errs.confirmar}</p>}
              {pwForm.confirmar && pwForm.confirmar===pwForm.nueva && <p style={{ ...errS, color:C.success }}>✓ Coinciden</p>}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button onClick={onCerrar} style={{ ...btnGh, flex:1 }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={guardarPassword} style={{ ...btnOrg, flex:2 }} onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>Cambiar contraseña →</button>
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
  const API_URL = import.meta.env.VITE_API_URL || "https://api-gestion-cajas.onrender.com/api";

  const [vista,          setVista]          = useState("lista"); // lista | nuevo
  const [usuarios,       setUsuarios]       = useState(DEMO_USUARIOS);
  const [modalPermisos,  setModalPermisos]  = useState(null); // usuario | null
  const [modalEditar,    setModalEditar]    = useState(null); // usuario | null
  const [confirmDel,     setConfirmDel]     = useState(null);
  const [cargando,       setCargando]       = useState(false);
  const [exito,          setExito]          = useState("");
  const [errGlobal,      setErrGlobal]      = useState("");
  const [form,           setForm]           = useState({ username:"", nombre:"", password:"", confirmar:"", rol:"secretaria", modulos:[] });
  const [showP1,         setShowP1]         = useState(false);
  const [showP2,         setShowP2]         = useState(false);
  const [errs,           setErrs]           = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const rolActual = ROLES_ALL.find(r => r.value === form.rol) || ROLES_ALL[1];

  // Cargar usuarios del backend
  useEffect(() => {
    (async () => {
      try {
        const token = getToken?.();
        const res = await fetch(`${API_URL}/usuarios`, { headers: token ? { Authorization:`Bearer ${token}` } : {} });
        if (res.ok) { const d = await res.json(); if (Array.isArray(d) && d.length) setUsuarios(d.map(u => ({ ...u, modulos: u.modulos || [], activo: u.activo !== false }))); }
      } catch {}
    })();
  }, []);

  // Validar formulario nuevo usuario
  const validar = () => {
    const e = {};
    if (!form.username.trim())       e.username  = "Requerido";
    if (form.username.includes(" ")) e.username  = "Sin espacios";
    if (!form.nombre.trim())         e.nombre    = "Requerido";
    if (form.password.length < 6)    e.password  = "Mínimo 6 caracteres";
    if (form.password !== form.confirmar) e.confirmar = "No coinciden";
    setErrs(e);
    return !Object.keys(e).length;
  };

  // Crear usuario
  const crear = async () => {
    if (!validar()) return;
    setCargando(true); setErrGlobal("");
    try {
      const token = getToken?.();
      const res = await fetch(`${API_URL}/usuarios`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body:JSON.stringify({ username:form.username.trim().toLowerCase(), nombre:form.nombre.trim(), password:form.password, rol:form.rol, modulos:form.modulos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear usuario");
      const nuevo = { id:data.id||Date.now(), username:form.username.trim().toLowerCase(), nombre:form.nombre.trim(), rol:form.rol, email:`${form.username}@cajasflow.com`, activo:true, creado:new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"}), modulos:form.modulos };
      setUsuarios(p => [...p, nuevo]);
    } catch (err) {
      // Offline — crear local
      const nuevo = { id:Date.now(), username:form.username.trim().toLowerCase(), nombre:form.nombre.trim(), rol:form.rol, email:`${form.username}@cajasflow.com`, activo:true, creado:new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"}), modulos:form.modulos };
      setUsuarios(p => [...p, nuevo]);
    }
    setCargando(false);
    setExito(`@${form.username.trim().toLowerCase()} creado correctamente.`);
    setForm({ username:"", nombre:"", password:"", confirmar:"", rol:"secretaria", modulos:[] });
    setErrs({});
    setTimeout(() => { setExito(""); setVista("lista"); }, 1800);
  };

  // Guardar permisos desde modal
  const guardarPermisos = async (usuarioId, nuevosModulos) => {
    setUsuarios(prev => prev.map(u => u.id === usuarioId ? { ...u, modulos: nuevosModulos } : u));
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${usuarioId}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body:JSON.stringify({ modulos: nuevosModulos }),
      });
    } catch {}
    setModalPermisos(null);
  };

  // Guardar edición de usuario
  const guardarEdicion = async (usuarioActualizado) => {
    setUsuarios(prev => prev.map(u => u.id === usuarioActualizado.id ? { ...u, nombre:usuarioActualizado.nombre, email:usuarioActualizado.email } : u));
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${usuarioActualizado.id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body:JSON.stringify(usuarioActualizado),
      });
    } catch {}
  };

  // Toggle estado activo/inactivo
  const toggleActivo = async (usuario) => {
    const nuevoEstado = !usuario.activo;
    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, activo: nuevoEstado } : u));
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${usuario.id}`, { method:"PUT", headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) }, body:JSON.stringify({ activo: nuevoEstado }) });
    } catch {}
  };

  // Eliminar usuario
  const eliminar = async (id) => {
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${id}`, { method:"DELETE", headers:token?{Authorization:`Bearer ${token}`}:{} });
    } catch {}
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setConfirmDel(null);
  };

  const toggleModuloForm = (key) => set("modulos", form.modulos.includes(key) ? form.modulos.filter(k=>k!==key) : [...form.modulos, key]);

  // ══ VISTA LISTA ════════════════════════════════════════════════════════════
  if (vista === "lista") return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:C.textPrimary, margin:"0 0 4px", textTransform:"uppercase" }}>Gestión de Usuarios</h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{usuarios.length} usuarios registrados</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>setVista("nuevo")} style={{ ...btnOrg }}
            onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo usuario
          </button>
          {onVolver && <button onClick={onVolver} style={{ ...btnGh }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>}
        </div>
      </div>

      {/* Cards de usuarios */}
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12 }}>
        {usuarios.map(u => {
          const esAdmin = u.rol === "admin" || u.rol === "administrador";
          return (
            <div key={u.id} style={{ background:C.card, border:`1px solid ${u.activo?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)"}`, borderRadius:12, padding:"16px 20px", opacity:u.activo?1:0.7, transition:"all 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>

                {/* Avatar + info básica */}
                <AvatarCircle nombre={u.nombre} rol={u.rol} size={44}/>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:15, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{u.nombre}</span>
                    <RolBadge rol={u.rol}/>
                    {/* Estado activo/inactivo */}
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:u.activo?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.1)", color:u.activo?C.success:C.danger, border:`1px solid ${u.activo?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}` }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:u.activo?C.success:C.danger }}/>
                      {u.activo?"Activo":"Inactivo"}
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:C.textSec, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>
                    @{u.username} {u.email && `· ${u.email}`}
                  </div>
                </div>

                {/* Módulos activos */}
                {!esAdmin && (
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", maxWidth:280 }}>
                    {u.modulos && u.modulos.length > 0
                      ? u.modulos.map(k => {
                          const mod = MODULOS_DISPONIBLES.find(m=>m.key===k);
                          return mod ? (
                            <span key={k} style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:"rgba(255,107,0,0.1)", color:C.accent, border:"1px solid rgba(255,107,0,0.2)", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                              {mod.emoji} {mod.label}
                            </span>
                          ) : null;
                        })
                      : <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic" }}>Sin módulos asignados</span>
                    }
                  </div>
                )}
                {esAdmin && (
                  <span style={{ fontSize:11, color:"#6366f1", fontFamily:"'DM Sans',sans-serif", fontWeight:600, background:"rgba(99,102,241,0.1)", padding:"4px 10px", borderRadius:20, border:"1px solid rgba(99,102,241,0.25)" }}>
                    🛡️ Acceso total
                  </span>
                )}

                {/* Acciones */}
                <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                  {!esAdmin && (
                    <>
                      <button onClick={() => setModalPermisos(u)}
                        style={{ padding:"6px 12px", borderRadius:7, border:"1px solid rgba(255,107,0,0.3)", background:"rgba(255,107,0,0.1)", color:C.accent, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,0,0.2)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,107,0,0.1)"}>
                        🔑 Accesos
                      </button>
                      <button onClick={() => toggleActivo(u)}
                        style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${u.activo?"rgba(245,158,11,0.3)":"rgba(16,185,129,0.3)"}`, background:u.activo?"rgba(245,158,11,0.1)":"rgba(16,185,129,0.1)", color:u.activo?C.warning:C.success, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.opacity="0.8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                        {u.activo ? "⏸ Desactivar" : "▶ Activar"}
                      </button>
                    </>
                  )}
                  <button onClick={() => setModalEditar(u)}
                    style={{ padding:"6px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:C.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                    ✏️ Editar
                  </button>
                  {!esAdmin && (
                    <button onClick={() => setConfirmDel({ id:u.id, username:u.username })}
                      style={{ padding:"6px 12px", borderRadius:7, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.1)", color:C.danger, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.2)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
                      🗑 Eliminar
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de creación */}
              <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Creado: {u.creado}</span>
                {!esAdmin && u.modulos && (
                  <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>
                    {u.modulos.length}/{MODULOS_DISPONIBLES.length} módulos habilitados
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal permisos */}
      {modalPermisos && (
        <ModalPermisos
          usuario={modalPermisos}
          onGuardar={(nuevosModulos) => guardarPermisos(modalPermisos.id, nuevosModulos)}
          onCerrar={() => setModalPermisos(null)}/>
      )}

      {/* Modal editar */}
      {modalEditar && (
        <ModalEditarUsuario
          usuario={modalEditar}
          onGuardar={(u) => { guardarEdicion(u); setModalEditar(null); }}
          onCerrar={() => setModalEditar(null)}/>
      )}

      {/* Modal confirmar eliminación */}
      {confirmDel && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, maxWidth:360, width:"100%", padding:"26px" }}>
            <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:17, fontWeight:700, color:C.textPrimary, margin:"0 0 10px" }}>¿Eliminar usuario?</h3>
            <p style={{ fontSize:13, color:C.textSec, margin:"0 0 20px", fontFamily:"'DM Sans',sans-serif" }}>
              Se eliminará <strong style={{ color:C.textPrimary }}>@{confirmDel.username}</strong> permanentemente.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={()=>eliminar(confirmDel.id)} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.background="#dc2626"} onMouseLeave={e=>e.currentTarget.style.background="#ef4444"}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} ::placeholder{color:rgba(255,255,255,0.18)!important;}`}</style>
    </div>
  );

  // ══ VISTA NUEVO USUARIO ════════════════════════════════════════════════════
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:C.textPrimary, margin:"0 0 4px", textTransform:"uppercase" }}>Nuevo Usuario</h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Completa la información y asigna los módulos de acceso</p>
        </div>
        <button onClick={()=>{ setVista("lista"); setErrs({}); setErrGlobal(""); }} style={{ ...btnGh }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          ← Lista de usuarios
        </button>
      </div>

      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 300px", gap:16, minHeight:0, overflow:"hidden" }}>

        {/* Formulario */}
        <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"22px 24px", display:"flex", flexDirection:"column", overflowY:"auto" }}>

          {exito    && <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:C.success, fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>✓ {exito}</div>}
          {errGlobal&& <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:C.danger, fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{errGlobal}</div>}

          <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>

            <div>
              <label style={labelS}>Nombre de usuario</label>
              <input type="text" placeholder="ej: maria.garcia" value={form.username}
                onChange={e=>{ set("username",e.target.value.replace(/\s/g,"")); setErrs(v=>({...v,username:""})); }}
                style={{ ...inputS, borderColor:errs.username?"#ef4444":"rgba(255,255,255,0.09)" }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.username?"#ef4444":"rgba(255,255,255,0.09)"}/>
              {errs.username && <p style={errS}>{errs.username}</p>}
            </div>

            <div>
              <label style={labelS}>Nombre completo</label>
              <input type="text" placeholder="ej: María García" value={form.nombre}
                onChange={e=>{ set("nombre",e.target.value); setErrs(v=>({...v,nombre:""})); }}
                style={{ ...inputS, borderColor:errs.nombre?"#ef4444":"rgba(255,255,255,0.09)" }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.nombre?"#ef4444":"rgba(255,255,255,0.09)"}/>
              {errs.nombre && <p style={errS}>{errs.nombre}</p>}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={labelS}>Contraseña</label>
                <div style={{ position:"relative" }}>
                  <input type={showP1?"text":"password"} placeholder="Mínimo 6 caracteres" value={form.password}
                    onChange={e=>{ set("password",e.target.value); setErrs(v=>({...v,password:""})); }}
                    style={{ ...inputS, paddingRight:40, borderColor:errs.password?"#ef4444":"rgba(255,255,255,0.09)" }}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.password?"#ef4444":"rgba(255,255,255,0.09)"}/>
                  <button type="button" onClick={()=>setShowP1(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}><EyeIcon open={showP1}/></button>
                </div>
                {errs.password && <p style={errS}>{errs.password}</p>}
              </div>
              <div>
                <label style={labelS}>Confirmar contraseña</label>
                <div style={{ position:"relative" }}>
                  <input type={showP2?"text":"password"} placeholder="Repite la contraseña" value={form.confirmar}
                    onChange={e=>{ set("confirmar",e.target.value); setErrs(v=>({...v,confirmar:""})); }}
                    style={{ ...inputS, paddingRight:40, borderColor:errs.confirmar?"#ef4444":"rgba(255,255,255,0.09)" }}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errs.confirmar?"#ef4444":"rgba(255,255,255,0.09)"}/>
                  <button type="button" onClick={()=>setShowP2(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}><EyeIcon open={showP2}/></button>
                </div>
                {errs.confirmar && <p style={errS}>{errs.confirmar}</p>}
              </div>
            </div>

            {/* Módulos de acceso */}
            <div>
              <label style={labelS}>Módulos de acceso</label>
              <p style={{ fontSize:11, color:C.textGhost, margin:"0 0 10px", fontFamily:"'DM Sans',sans-serif" }}>Selecciona los módulos a los que tendrá acceso este usuario.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {MODULOS_DISPONIBLES.map(mod => {
                  const activo = form.modulos.includes(mod.key);
                  return (
                    <button key={mod.key} type="button" onClick={() => toggleModuloForm(mod.key)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, border:`1.5px solid ${activo?C.accent:"rgba(255,255,255,0.07)"}`, background:activo?"rgba(255,107,0,0.08)":"#0a0a0a", cursor:"pointer", transition:"all 0.18s", textAlign:"left" }}>
                      <div style={{ width:30, height:16, borderRadius:8, background:activo?C.accent:"rgba(255,255,255,0.12)", position:"relative", flexShrink:0, transition:"background 0.2s" }}>
                        <div style={{ width:12, height:12, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:activo?16:2, transition:"left 0.2s" }}/>
                      </div>
                      <span style={{ fontSize:14 }}>{mod.emoji}</span>
                      <span style={{ fontSize:13, fontWeight:activo?700:500, color:activo?C.textPrimary:C.textSec, fontFamily:"'DM Sans',sans-serif", flex:1 }}>{mod.label}</span>
                      <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{mod.desc}</span>
                    </button>
                  );
                })}
              </div>
              {form.modulos.length === 0 && (
                <p style={{ fontSize:11, color:C.warning, margin:"8px 0 0", fontFamily:"'DM Sans',sans-serif" }}>⚠️ Sin módulos — solo verá el dashboard básico.</p>
              )}
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:18, flexShrink:0 }}>
            <button onClick={()=>{ setVista("lista"); setErrs({}); setErrGlobal(""); }} style={{ ...btnGh, flex:1 }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
            <button onClick={crear} disabled={cargando} style={{ ...btnOrg, flex:2, opacity:cargando?0.7:1 }}
              onMouseEnter={e=>{ if(!cargando) e.currentTarget.style.background="#E55E00"; }} onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
              {cargando?"Creando...":"Crear usuario →"}
            </button>
          </div>
        </div>

        {/* Vista previa */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"20px", flex:1 }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 16px", fontFamily:"'DM Sans',sans-serif" }}>Vista previa</p>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:rolActual.color+"22", border:`2px solid ${rolActual.color}45`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:22, color:rolActual.color, fontFamily:"'DM Sans',sans-serif" }}>
                {form.nombre?form.nombre.charAt(0).toUpperCase():form.username?form.username.charAt(0).toUpperCase():"?"}
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:15, fontWeight:700, color:form.nombre?C.textPrimary:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{form.nombre||"Nombre completo"}</div>
                <div style={{ fontSize:12, color:form.username?C.textSec:C.textGhost, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{form.username?`@${form.username}`:"@usuario"}</div>
              </div>
              <RolBadge rol="secretaria"/>
            </div>

            {/* Módulos asignados en preview */}
            <div style={{ marginBottom:12 }}>
              <p style={{ fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px", fontFamily:"'DM Sans',sans-serif" }}>Módulos asignados</p>
              {form.modulos.length === 0
                ? <p style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic" }}>Ninguno — solo dashboard básico</p>
                : <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {form.modulos.map(k => {
                      const mod = MODULOS_DISPONIBLES.find(m=>m.key===k);
                      return mod ? <span key={k} style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:"rgba(255,107,0,0.1)", color:C.accent, border:"1px solid rgba(255,107,0,0.2)", fontFamily:"'DM Sans',sans-serif" }}>{mod.emoji} {mod.label}</span> : null;
                    })}
                  </div>
              }
            </div>

            {[
              { l:"Usuario",  v:form.username?`@${form.username}`:"—" },
              { l:"Nombre",   v:form.nombre||"—" },
              { l:"Rol",      v:"Secretaria" },
              { l:"Estado",   v:"Activo" },
            ].map((row,i,arr)=>(
              <div key={row.l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                <span style={{ fontSize:11, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>{row.l}</span>
                <span style={{ fontSize:12, color:row.v==="—"?C.textGhost:C.textPrimary, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{row.v}</span>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(255,107,0,0.06)", border:"1px solid rgba(255,107,0,0.14)", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.accent, margin:"0 0 5px", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Acceso del rol</p>
            <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif", lineHeight:1.55 }}>
              📋 Secretaria: solo accede a los módulos que le asignes. Sin acceso a gestión de usuarios ni configuración.
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} ::placeholder{color:rgba(255,255,255,0.18)!important;}`}</style>
    </div>
  );
}