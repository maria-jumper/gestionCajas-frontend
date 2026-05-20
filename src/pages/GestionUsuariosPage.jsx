import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const C = {
  cardBg:      "#111111",
  accent:      "#FF6B00",
  textPrimary: "#f0f4f8",
  textSec:     "#8a9bb0",
  textGhost:   "#4a5568",
  danger:      "#ef4444",
  success:     "#10b981",
};

const ROLES = [
  { value: "secretaria", label: "Secretaria", color: "#10b981", emoji: "📋", desc: "Registro de operaciones" },
  { value: "mensajero",  label: "Mensajero",  color: "#f59e0b", emoji: "🛵", desc: "Entregas en ruta" },
];

const ROLES_ALL = [
  { value: "admin",      label: "Administrador", color: "#6366f1", emoji: "🛡️" },
  ...ROLES,
];

const btnOrange = {
  display:"flex", alignItems:"center", justifyContent:"center", gap:7,
  padding:"10px 20px", borderRadius:8, border:"none",
  background:"#FF6B00", color:"#fff",
  fontFamily:"'DM Sans',sans-serif",
  fontSize:14, fontWeight:700, cursor:"pointer",
  transition:"background 0.2s", whiteSpace:"nowrap",
};

const btnGhost = {
  ...btnOrange,
  background:"transparent", color:"#f0f4f8",
  border:"1px solid rgba(255,255,255,0.14)",
};

const inputBase = {
  width:"100%", boxSizing:"border-box",
  padding:"11px 14px", borderRadius:8,
  border:"1.5px solid rgba(255,255,255,0.09)",
  background:"#0a0a0a", color:"#f0f4f8",
  fontSize:14, outline:"none",
  fontFamily:"'DM Sans',sans-serif",
  transition:"border-color 0.2s",
};

function RolBadge({ rol }) {
  const r = ROLES_ALL.find(r => r.value === rol?.toLowerCase()) || ROLES_ALL[0];
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 11px", borderRadius:20,
      fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif",
      background:r.color+"1a", color:r.color,
      border:`1px solid ${r.color}40`,
      whiteSpace: "nowrap"
    }}>
      {r.emoji} {r.label}
    </span>
  );
}

function Avatar({ nombre, rol }) {
  const r = ROLES_ALL.find(r => r.value === rol?.toLowerCase()) || ROLES_ALL[0];
  return (
    <div style={{
      width:36, height:36, borderRadius:"50%", flexShrink:0,
      background:r.color+"25", border:`2px solid ${r.color}50`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans',sans-serif", fontWeight:900,
      fontSize:15, color:r.color,
    }}>
      {(nombre||"?").charAt(0).toUpperCase()}
    </div>
  );
}

function EyeIcon({ open }) {
  return open
    ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

const DEMO = [
  { id:1, username:"admin",  nombre:"Administrador", rol:"admin",      creado:"06 de may de 2026" },
];

export default function GestionUsuarios({ onVolver }) {
  const { getToken } = useAuth();

  const [vista,      setVista]      = useState("lista");
  const [usuarios,   setUsuarios]   = useState(DEMO);
  const [confirmDel, setConfirmDel] = useState(null);
  const [cargando,   setCargando]   = useState(false);
  const [exito,      setExito]      = useState("");
  const [errGlobal,  setErrGlobal]  = useState("");
  const [form,       setForm]       = useState({ username:"", nombre:"", password:"", confirmar:"", rol:"secretaria" });
  const [showP1,     setShowP1]     = useState(false);
  const [showP2,     setShowP2]     = useState(false);
  const [errs,       setErrs]       = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "https://api-gestion-cajas.onrender.com/api"; 

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const token = getToken?.();
        const res = await fetch(`${API_URL}/usuarios`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const d = await res.json();
          if (Array.isArray(d)) setUsuarios(d);
        }
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };
    cargarUsuarios();
  }, [API_URL]);

  const validar = () => {
    const e = {};
    if (!form.username.trim())        e.username  = "Requerido";
    if (form.username.includes(" "))  e.username  = "Sin espacios";
    if (!form.nombre.trim())          e.nombre    = "Requerido";
    if (!form.password || form.password.length < 6) e.password  = "Mínimo 6 caracteres";
    if (form.password !== form.confirmar) e.confirmar = "No coinciden";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const crear = async () => {
    if (!validar()) return;
    setCargando(true);
    setErrGlobal("");
    
    try {
      const token = getToken?.();
      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify({ 
          username: form.username.trim().toLowerCase(), 
          nombre: form.nombre.trim(), 
          password: form.password, 
          rol: form.rol 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al procesar la solicitud.");
      }

      const nuevo = {
        id: data.id || Date.now(),
        username: form.username.trim().toLowerCase(),
        nombre: form.nombre.trim(),
        rol: form.rol,
        creado: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
      };

      setUsuarios(prev => [...prev, nuevo]);
      setExito(`@${nuevo.username} creado correctamente.`);
      setForm({ username: "", nombre: "", password: "", confirmar: "", rol: "secretaria" });
      setErrs({});
      setTimeout(() => { setExito(""); setVista("lista"); }, 1800);

    } catch (err) {
      setErrGlobal(err.message || "No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (id) => {
    try {
      const token = getToken?.();
      const res = await fetch(`${API_URL}/usuarios/${id}`, { 
        method: "DELETE", 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });
      if (res.ok) {
        setUsuarios(prev => prev.filter(u => u.id !== id));
      } else {
        alert("No se pudo eliminar el usuario del servidor.");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
    setConfirmDel(null);
  };

  const rolActual = ROLES_ALL.find(r => r.value === form.rol) || ROLES[0];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, width:"100%" }}>
      
      {/* ── CABECERA GENERAL ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:28, fontWeight:900, color:C.textPrimary, margin:"0 0 4px" }}>
            Gestión de Usuarios
          </h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
            {usuarios.length} {usuarios.length===1?"usuario registrado":"usuarios registrados"}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, width: "auto" }}>
          {vista === "lista" ? (
            <button onClick={() => { setVista("nuevo"); setErrGlobal(""); setErrs({}); }}
              style={btnOrange}
              onMouseEnter={e=>e.currentTarget.style.background="#E55E00"}
              onMouseLeave={e=>e.currentTarget.style.background="#FF6B00"}>
              + Nuevo usuario
            </button>
          ) : (
            <button onClick={()=>{ setVista("lista"); setErrs({}); setErrGlobal(""); }} style={btnGhost}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              ← Lista de usuarios
            </button>
          )}
          {onVolver && (
            <button onClick={onVolver} style={btnGhost}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              ← Volver
            </button>
          )}
        </div>
      </div>

      {/* ── SECCIÓN CENTRAL DINÁMICA ── */}
      {vista === "lista" ? (
        
        /* [VISTA A]: TABLA DE USUARIOS CON SCROLL RESPONSIVO */
        <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ flex:1, overflowY:"auto", overflowX:"auto" }} className="custom-table-container">
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth: 620 }}>
              <thead>
                <tr>
                  {["Usuario","Nombre","Rol","Creado","Acciones"].map(h => (
                    <th key={h} style={{ padding:"12px 22px", fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.1em", textAlign:"left", fontFamily:"'DM Sans',sans-serif", borderBottom:"1px solid rgba(255,255,255,0.05)", position:"sticky", top:0, background:"#111111", zIndex:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:"40px", textAlign:"center", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Sin usuarios</td></tr>
                ) : (
                  usuarios.map(u => (
                    <tr key={u.id}
                      style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.12s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"14px 22px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <Avatar nombre={u.nombre||u.username} rol={u.rol} />
                          <span style={{ fontSize:14, fontWeight:700, color:C.textSec, fontFamily:"'DM Sans',sans-serif" }}>@{u.username}</span>
                        </div>
                      </td>
                      <td style={{ padding:"14px 22px", fontSize:14, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{u.nombre}</td>
                      <td style={{ padding:"14px 22px" }}><RolBadge rol={u.rol} /></td>
                      <td style={{ padding:"14px 22px", fontSize:13, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{u.creado}</td>
                      <td style={{ padding:"14px 22px" }}>
                        <button
                          onClick={() => setConfirmDel({ id:u.id, username:u.username })}
                          disabled={u.rol==="admin"}
                          style={{ padding:"5px 14px", borderRadius:6, fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif",
                            cursor:u.rol==="admin"?"not-allowed":"pointer",
                            border:`1px solid ${u.rol==="admin"?"rgba(255,255,255,0.07)":"rgba(239,68,68,0.3)"}`,
                            background:u.rol==="admin"?"transparent":"rgba(239,68,68,0.1)",
                            color:u.rol==="admin"?C.textGhost:"#ef4444",
                            transition:"all 0.15s",
                          }}
                          onMouseEnter={e=>{ if(u.rol!=="admin") e.currentTarget.style.background="rgba(239,68,68,0.2)"; }}
                          onMouseLeave={e=>{ if(u.rol!=="admin") e.currentTarget.style.background="rgba(239,68,68,0.1)"; }}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* [VISTA B]: CREAR NUEVO USUARIO TOTALMENTE RESPONSIVO */
        <div className="responsive-user-layout" style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 320px", gap:16, minHeight:0 }}>
          
          {/* Panel del Formulario */}
          <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px 22px", display:"flex", flexDirection:"column", overflowY:"auto" }}>
            <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:700, color:C.textPrimary, margin:"0 0 16px" }}>Nuevo usuario</h3>

            {exito && <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>✓ {exito}</div>}
            {errGlobal && <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>⚠️ {errGlobal}</div>}

            <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>Nombre de usuario</label>
                <input type="text" placeholder="ej: juan.perez" value={form.username}
                  onChange={e=>{ set("username",e.target.value.replace(/\s/g,"")); setErrs(v=>({...v,username:""})); }}
                  style={{ ...inputBase, borderColor:errs.username?"#ef4444":"rgba(255,255,255,0.09)" }} />
                {errs.username && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{errs.username}</p>}
              </div>

              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>Nombre completo</label>
                <input type="text" placeholder="ej: Juan Pérez" value={form.nombre}
                  onChange={e=>{ set("nombre",e.target.value); setErrs(v=>({...v,nombre:""})); }}
                  style={{ ...inputBase, borderColor:errs.nombre?"#ef4444":"rgba(255,255,255,0.09)" }} />
                {errs.nombre && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{errs.nombre}</p>}
              </div>

              {/* Contraseñas en Rejilla Adaptable */}
              <div className="responsive-pwd-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>Contraseña</label>
                  <div style={{ position:"relative" }}>
                    <input type={showP1?"text":"password"} placeholder="Mínimo 6 caracteres" value={form.password}
                      onChange={e=>{ set("password",e.target.value); setErrs(v=>({...v,password:""})); }}
                      style={{ ...inputBase, paddingRight:40, borderColor:errs.password?"#ef4444":"rgba(255,255,255,0.09)" }} />
                    <button type="button" onClick={()=>setShowP1(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}>
                      <EyeIcon open={showP1} />
                    </button>
                  </div>
                  {errs.password && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{errs.password}</p>}
                </div>
                <div>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>Confirmar contraseña</label>
                  <div style={{ position:"relative" }}>
                    <input type={showP2?"text":"password"} placeholder="Repite la contraseña" value={form.confirmar}
                      onChange={e=>{ set("confirmar",e.target.value); setErrs(v=>({...v,confirmar:""})); }}
                      style={{ ...inputBase, paddingRight:40, borderColor:errs.confirmar?"#ef4444":"rgba(255,255,255,0.09)" }} />
                    <button type="button" onClick={()=>setShowP2(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textGhost, display:"flex", padding:0 }}>
                      <EyeIcon open={showP2} />
                    </button>
                  </div>
                  {errs.confirmar && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{errs.confirmar}</p>}
                </div>
              </div>

              {/* Selector de Rol en Botones Responsivos */}
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Rol del usuario</label>
                <div className="responsive-role-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {ROLES.map(r => {
                    const sel = form.rol === r.value;
                    return (
                      <button key={r.value} type="button"
                        onClick={()=>{ set("rol",r.value); setErrs(v=>({...v,rol:""})); }}
                        style={{
                          padding:"16px 12px", borderRadius:10, cursor:"pointer",
                          border:`2px solid ${sel?r.color:"rgba(255,255,255,0.07)"}`,
                          background:sel?r.color+"12":"#0a0a0a",
                          display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                          transition:"all 0.18s", position:"relative", width: "100%", boxSizing: "border-box"
                        }}
                        onMouseEnter={e=>{ if(!sel) e.currentTarget.style.borderColor=r.color+"55"; }}
                        onMouseLeave={e=>{ if(!sel) e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
                        {sel && (
                          <div style={{ position:"absolute", top:8, right:8, width:18, height:18, borderRadius:"50%", background:r.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <svg viewBox="0 0 12 12" width="9" height="9" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                        <span style={{ fontSize:28, lineHeight:1 }}>{r.emoji}</span>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:13, fontWeight:800, color:sel?r.color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{r.label}</div>
                          <div style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Botones del Formulario */}
            <div style={{ display:"flex", gap:10, marginTop:18, flexShrink:0 }}>
              <button onClick={()=>{ setVista("lista"); setErrs({}); setErrGlobal(""); }} style={{ ...btnGhost, flex:1 }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={crear} disabled={cargando}
                style={{ ...btnOrange, flex:2, opacity:cargando?0.7:1 }}
                onMouseEnter={e=>{ if(!cargando) e.currentTarget.style.background="#E55E00"; }}
                onMouseLeave={e=>{ if(!cargando) e.currentTarget.style.background="#FF6B00" }}>
                {cargando?"Creando...":"Crear usuario →"}
              </button>
            </div>
          </div>

          {/* Panel de Vista Previa Lateral */}
          <div className="responsive-preview-panel" style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px", flex:1 }}>
              <p style={{ fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 16px", fontFamily:"'DM Sans',sans-serif" }}>Vista previa</p>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:rolActual.color+"22", border:`2px solid ${rolActual.color}45`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:22, color:rolActual.color, fontFamily:"'DM Sans',sans-serif" }}>
                  {form.nombre?form.nombre.charAt(0).toUpperCase():form.username?form.username.charAt(0).toUpperCase():"?"}
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:15, fontWeight:700, color:form.nombre?C.textPrimary:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{form.nombre||"Nombre completo"}</div>
                  <div style={{ fontSize:12, color:form.username?C.textSec:C.textGhost, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{form.username?`@${form.username}`:"@usuario"}</div>
                </div>
                <RolBadge rol={form.rol} />
              </div>
              
              {[
                { l:"Usuario",    v:form.username?`@${form.username}`:"—" },
                { l:"Nombre",     v:form.nombre||"—" },
                { l:"Rol",        v:rolActual.label },
                { l:"Contraseña", v:form.password?"•".repeat(Math.min(form.password.length,8)):"—" },
              ].map((row,i,arr)=>(
                <div key={row.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <span style={{ fontSize:11, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>{row.l}</span>
                  <span style={{ fontSize:13, color:row.v==="—"?C.textGhost:C.textPrimary, fontWeight:600, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginLeft:10 }}>{row.v}</span>
                </div>
              ))}
            </div>
            
            {/* Aviso Dinámico de Permisos */}
            <div style={{ background:"rgba(255,107,0,0.06)", border:"1px solid rgba(255,107,0,0.14)", borderRadius:10, padding:"14px 16px" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#FF6B00", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Acceso del rol</p>
              <p style={{ fontSize:12, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif", lineHeight:1.55 }}>
                {form.rol === "secretaria" ? "📋 Puede registrar entregas y envíos. Sin acceso a inventario ni reportes." : "🛵 Solo puede confirmar sus entregas asignadas del día."}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── MODAL: CONFIRMAR ELIMINACIÓN ── */}
      {confirmDel && (
        <div style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, maxWidth:380, width:"100%", padding:"26px" }}>
            <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:17, fontWeight:700, color:C.textPrimary, margin:"0 0 12px" }}>¿Eliminar usuario?</h3>
            <p style={{ fontSize:13, color:C.textSec, margin:"0 0 20px", fontFamily:"'DM Sans',sans-serif" }}>
              Se eliminará <strong style={{ color:C.textPrimary }}>@{confirmDel.username}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmDel(null)}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancelar</button>
              <button onClick={()=>eliminar(confirmDel.id)}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ESTILOS GLOBALES Y MEDIA QUERIES INTEGRADOS ── */}
      <style>{`
        ::placeholder { color:rgba(255,255,255,0.18)!important; } 
        select option { background:#111; color:#f0f4f8; }
        
        @media (max-width: 820px) {
          .responsive-user-layout {
            grid-template-columns: 1fr !important;
            overflow-y: auto !important;
          }
          .responsive-pwd-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .responsive-role-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-preview-panel {
            margin-top: 10px;
          }
        }
        @media (max-width: 480px) {
          .custom-table-container {
            margin: 0 -4px;
          }
        }
      `}</style>
    </div>
  );
}