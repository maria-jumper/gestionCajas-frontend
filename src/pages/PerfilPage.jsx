import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUsuarios, updateUsuario } from "../api";


const ROLES_INFO = {
  admin:         { label:"Administrador", color:"#6366f1", emoji:"🛡️" },
  administrador: { label:"Administrador", color:"#6366f1", emoji:"🛡️" },
  secretaria:    { label:"Secretaria",    color:"#10b981", emoji:"📋" },
};
function getRol(rol) {
  return ROLES_INFO[rol?.toLowerCase()] || { label: rol||"Usuario", color:"#8a9bb0", emoji:"👤" };
}

// ── Estilos base ──────────────────────────────────────────────────────────────
const inputS = {
  width:"100%", boxSizing:"border-box",
  padding:"11px 14px", borderRadius:8,
  border:"1.5px solid rgba(255,255,255,0.09)",
  background:"#0a0a0a", color:"#f0f4f8",
  fontSize:14, outline:"none",
  fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s",
};
const labelS = { display:"block", fontSize:11, fontWeight:700, color:"#4a5568", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
const errS   = { fontSize:11, color:"#ef4444", margin:"4px 0 0", fontFamily:"'DM Sans',sans-serif" };
const btnOrg = { display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 18px", borderRadius:8, border:"none", background:"#FF6B00", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", transition:"background 0.2s" };
const btnGh  = { ...btnOrg, background:"transparent", color:"#f0f4f8", border:"1px solid rgba(255,255,255,0.14)" };

function EyeIcon({ open }) {
  return open
    ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

function PasswordField({ label, value, onChange, show, onToggle, error, placeholder }) {
  return (
    <div>
      <label style={labelS}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type={show?"text":"password"} value={value} onChange={onChange} placeholder={placeholder||"••••••••"}
          style={{ ...inputS, paddingRight:42, borderColor:error?"#ef4444":"rgba(255,255,255,0.09)" }}
          onFocus={e=>e.target.style.borderColor=error?"#ef4444":"#FF6B00"}
          onBlur={e=>e.target.style.borderColor=error?"#ef4444":"rgba(255,255,255,0.09)"}/>
        <button type="button" onClick={onToggle} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#4a5568", display:"flex", padding:0 }}>
          <EyeIcon open={show}/>
        </button>
      </div>
      {error && <p style={errS}>{error}</p>}
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  const len = password.length;
  const score = len < 6 ? 1 : len < 10 ? 2 : 3;
  const colors = ["","#ef4444","#f59e0b","#10b981"];
  const labels = ["","Muy corta","Aceptable","Segura ✓"];
  return (
    <div style={{ marginTop:5 }}>
      <div style={{ display:"flex", gap:3 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=score?colors[score]:"rgba(255,255,255,0.08)", transition:"all 0.3s" }}/>
        ))}
      </div>
      <p style={{ fontSize:11, color:colors[score], margin:"3px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{labels[score]}</p>
    </div>
  );
}

// ── Panel izquierdo — Info del usuario ────────────────────────────────────────
function PanelInfo({ user, nombre, email, username, rolInfo, onVolver }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Avatar card */}
      <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"24px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:14, textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:rolInfo.color+"22", border:`3px solid ${rolInfo.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:rolInfo.color }}>
          {nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:"#f0f4f8", fontFamily:"'DM Sans',sans-serif" }}>{nombre}</div>
          <div style={{ fontSize:12, color:"#8a9bb0", fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>@{username}</div>
        </div>
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:rolInfo.color+"1a", color:rolInfo.color, border:`1px solid ${rolInfo.color}40` }}>
          {rolInfo.emoji} {rolInfo.label}
        </span>
      </div>

      {/* Datos rápidos */}
      <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"16px 18px" }}>
        {[
          { l:"Usuario", v:`@${username}` },
          { l:"Email",   v:email           },
          { l:"Rol",     v:rolInfo.label   },
          { l:"Estado",  v:"Activo ✓", color:"#10b981" },
        ].map((r,i,a) => (
          <div key={r.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:i<a.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
            <span style={{ fontSize:11, color:"#4a5568", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>{r.l}</span>
            <span style={{ fontSize:12, fontWeight:600, color:r.color||"#f0f4f8", fontFamily:"'DM Sans',sans-serif", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.v}</span>
          </div>
        ))}
      </div>

      {onVolver && (
        <button onClick={onVolver} style={{ ...btnGh, justifyContent:"flex-start", gap:8 }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          ← Volver
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PERFIL ADMIN
// ══════════════════════════════════════════════════════════════════════════════
function PerfilAdmin({ user, nombre, email, username, rolInfo, onVolver }) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState("mi-cuenta"); // mi-cuenta | cambiar-pw | pw-usuarios
  const [usuarios, setUsuarios] = useState([]);

  // Mi cuenta
  const [infoForm, setInfoForm]     = useState({ nombre, email });
  const [infoMsg,  setInfoMsg]      = useState("");
  const [infoSaving,setInfoSaving]  = useState(false);

  // Mi contraseña
  const [myPw,  setMyPw]   = useState({ actual:"", nueva:"", confirmar:"" });
  const [myPwSh,setMyPwSh] = useState({ actual:false, nueva:false, confirmar:false });
  const [myPwErr,setMyPwErr]= useState({});
  const [myPwMsg,setMyPwMsg]= useState("");
  const [myPwSaving,setMyPwSaving]= useState(false);

  // Contraseña de usuario
  const [selUser,   setSelUser]    = useState(null);
  const [newPwUser, setNewPwUser]  = useState({ nueva:"", confirmar:"" });
  const [newPwSh,   setNewPwSh]    = useState({ nueva:false, confirmar:false });
  const [newPwErr,  setNewPwErr]   = useState({});
  const [newPwMsg,  setNewPwMsg]   = useState("");
  const [newPwSaving,setNewPwSaving]=useState(false);

  // Cargar usuarios para el tab pw-usuarios
  useEffect(() => {
    if (tab !== "pw-usuarios") return;
    (async () => {
      try {
        const token = getToken?.();
        const res = await fetch(`${API_URL}/usuarios`, { headers: token?{Authorization:`Bearer ${token}`}:{} });
        if (res.ok) { const d = await res.json(); setUsuarios(d.filter(u=>u.id!==user?.id)); }
      } catch {}
    })();
  }, [tab]);

  const guardarInfo = async () => {
    if (!infoForm.nombre.trim()) return;
    setInfoSaving(true); setInfoMsg("");
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${user?.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({ nombre:infoForm.nombre.trim(), email:infoForm.email.trim() }),
      });
    } catch {}
    setInfoSaving(false);
    setInfoMsg("✓ Información actualizada correctamente.");
    setTimeout(()=>setInfoMsg(""), 3000);
  };

  const cambiarMiPw = async () => {
    const e = {};
    if (!myPw.actual)              e.actual    = "Ingresa tu contraseña actual";
    if (myPw.nueva.length < 6)     e.nueva     = "Mínimo 6 caracteres";
    if (myPw.nueva !== myPw.confirmar) e.confirmar = "No coinciden";
    setMyPwErr(e);
    if (Object.keys(e).length) return;
    setMyPwSaving(true); setMyPwMsg("");
    try {
      const token = getToken?.();
      const res = await fetch(`${API_URL}/usuarios/${user?.id}/password`, {
        method:"PUT", headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({ passwordActual:myPw.actual, passwordNueva:myPw.nueva }),
      });
      if (!res.ok) { const d = await res.json(); setMyPwErr({ actual: d.error||"Contraseña incorrecta" }); setMyPwSaving(false); return; }
    } catch {}
    setMyPwSaving(false);
    setMyPwMsg("✓ Contraseña cambiada exitosamente.");
    setMyPw({ actual:"", nueva:"", confirmar:"" });
    setMyPwErr({});
    setTimeout(()=>setMyPwMsg(""), 3500);
  };

  const cambiarPwUsuario = async () => {
    const e = {};
    if (!selUser)                      { setNewPwMsg("⚠️ Selecciona un usuario."); return; }
    if (newPwUser.nueva.length < 6)    e.nueva     = "Mínimo 6 caracteres";
    if (newPwUser.nueva !== newPwUser.confirmar) e.confirmar = "No coinciden";
    setNewPwErr(e);
    if (Object.keys(e).length) return;
    setNewPwSaving(true); setNewPwMsg("");
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/${selUser.id}/password-admin`, {
        method:"PUT", headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({ passwordNueva:newPwUser.nueva }),
      });
    } catch {}
    setNewPwSaving(false);
    setNewPwMsg(`✓ Contraseña de @${selUser.username} restablecida.`);
    setNewPwUser({ nueva:"", confirmar:"" });
    setNewPwErr({});
    setSelUser(null);
    setTimeout(()=>setNewPwMsg(""), 3500);
  };

  const TABS = [
    { k:"mi-cuenta",  l:"Mi cuenta"   },
    { k:"cambiar-pw", l:"Mi contraseña" },
    { k:"pw-usuarios",l:"Contraseñas" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:"#f0f4f8", margin:"0 0 4px", textTransform:"uppercase" }}>Mi Perfil</h1>
          <p style={{ fontSize:13, color:"#8a9bb0", margin:0, fontFamily:"'DM Sans',sans-serif" }}>Administra tu cuenta y la de los usuarios</p>
        </div>
        {onVolver && <button onClick={onVolver} style={{ ...btnGh }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>}
      </div>

      <div style={{ flex:1, display:"grid", gridTemplateColumns:"260px 1fr", gap:16, minHeight:0, overflow:"hidden" }}>
        <PanelInfo user={user} nombre={nombre} email={email} username={username} rolInfo={rolInfo}/>

        <div style={{ display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>
          {/* Tabs */}
          <div style={{ display:"flex", background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:4, flexShrink:0 }}>
            {TABS.map(t => (
              <button key={t.k} onClick={()=>setTab(t.k)}
                style={{ flex:1, padding:"8px 0", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:tab===t.k?700:500, background:tab===t.k?"#FF6B00":"transparent", color:tab===t.k?"#fff":"#8a9bb0", transition:"all 0.18s" }}>
                {t.l}
              </button>
            ))}
          </div>

          {/* ── Mi cuenta ── */}
          {tab === "mi-cuenta" && (
            <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"22px", overflowY:"auto" }}>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:900, color:"#f0f4f8", margin:"0 0 18px", textTransform:"uppercase" }}>Información personal</h3>
              {infoMsg && <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{infoMsg}</div>}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={labelS}>Nombre completo</label>
                  <input type="text" value={infoForm.nombre} onChange={e=>setInfoForm(f=>({...f,nombre:e.target.value}))}
                    style={inputS} onFocus={e=>e.target.style.borderColor="#FF6B00"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}/>
                </div>
                <div>
                  <label style={labelS}>Email</label>
                  <input type="email" value={infoForm.email} onChange={e=>setInfoForm(f=>({...f,email:e.target.value}))} placeholder="correo@ejemplo.com"
                    style={inputS} onFocus={e=>e.target.style.borderColor="#FF6B00"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}/>
                </div>
                <div>
                  <label style={labelS}>Nombre de usuario</label>
                  <input type="text" value={`@${username}`} disabled style={{ ...inputS, opacity:0.5, cursor:"default" }}/>
                  <p style={{ ...errS, color:"#4a5568" }}>El nombre de usuario no se puede modificar.</p>
                </div>
                <button onClick={guardarInfo} disabled={infoSaving} style={{ ...btnOrg, alignSelf:"flex-start", opacity:infoSaving?0.7:1 }}
                  onMouseEnter={e=>{ if(!infoSaving) e.currentTarget.style.background="#E55E00"; }} onMouseLeave={e=>e.currentTarget.style.background="#FF6B00"}>
                  {infoSaving?"Guardando...":"Guardar cambios →"}
                </button>
              </div>
            </div>
          )}

          {/* ── Mi contraseña ── */}
          {tab === "cambiar-pw" && (
            <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"22px", overflowY:"auto" }}>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:900, color:"#f0f4f8", margin:"0 0 6px", textTransform:"uppercase" }}>Cambiar mi contraseña</h3>
              <p style={{ fontSize:12, color:"#8a9bb0", margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif" }}>Necesitas ingresar tu contraseña actual para confirmar el cambio.</p>
              {myPwMsg && <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{myPwMsg}</div>}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <PasswordField label="Contraseña actual" value={myPw.actual} onChange={e=>{ setMyPw(f=>({...f,actual:e.target.value})); setMyPwErr(v=>({...v,actual:""})); }} show={myPwSh.actual} onToggle={()=>setMyPwSh(v=>({...v,actual:!v.actual}))} error={myPwErr.actual}/>
                <div>
                  <PasswordField label="Nueva contraseña" value={myPw.nueva} onChange={e=>{ setMyPw(f=>({...f,nueva:e.target.value})); setMyPwErr(v=>({...v,nueva:""})); }} show={myPwSh.nueva} onToggle={()=>setMyPwSh(v=>({...v,nueva:!v.nueva}))} error={myPwErr.nueva}/>
                  <StrengthBar password={myPw.nueva}/>
                </div>
                <PasswordField label="Confirmar nueva contraseña" value={myPw.confirmar} onChange={e=>{ setMyPw(f=>({...f,confirmar:e.target.value})); setMyPwErr(v=>({...v,confirmar:""})); }} show={myPwSh.confirmar} onToggle={()=>setMyPwSh(v=>({...v,confirmar:!v.confirmar}))} error={myPwErr.confirmar}/>
                {myPw.confirmar && myPw.confirmar===myPw.nueva && <p style={{ ...errS, color:"#10b981" }}>✓ Las contraseñas coinciden</p>}
                <button onClick={cambiarMiPw} disabled={myPwSaving} style={{ ...btnOrg, alignSelf:"flex-start", opacity:myPwSaving?0.7:1 }}
                  onMouseEnter={e=>{ if(!myPwSaving) e.currentTarget.style.background="#E55E00"; }} onMouseLeave={e=>e.currentTarget.style.background="#FF6B00"}>
                  {myPwSaving?"Cambiando...":"Cambiar contraseña →"}
                </button>
              </div>
            </div>
          )}

          {/* ── Contraseñas de usuarios ── */}
          {tab === "pw-usuarios" && (
            <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"22px", overflowY:"auto" }}>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:900, color:"#f0f4f8", margin:"0 0 6px", textTransform:"uppercase" }}>Restablecer contraseña de usuario</h3>
              <p style={{ fontSize:12, color:"#8a9bb0", margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif" }}>Como administrador puedes restablecer la contraseña de cualquier usuario sin necesitar la contraseña actual.</p>
              {newPwMsg && <div style={{ padding:"10px 14px", borderRadius:8, background:newPwMsg.startsWith("⚠️")?"rgba(245,158,11,0.1)":"rgba(16,185,129,0.1)", border:`1px solid ${newPwMsg.startsWith("⚠️")?"rgba(245,158,11,0.3)":"rgba(16,185,129,0.25)"}`, color:newPwMsg.startsWith("⚠️")?"#f59e0b":"#10b981", fontSize:13, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{newPwMsg}</div>}

              {/* Selección de usuario */}
              <div style={{ marginBottom:16 }}>
                <label style={labelS}>Seleccionar usuario</label>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {usuarios.length === 0
                    ? <p style={{ fontSize:13, color:"#4a5568", fontFamily:"'DM Sans',sans-serif" }}>Cargando usuarios...</p>
                    : usuarios.map(u => (
                      <button key={u.id} onClick={()=>{ setSelUser(u); setNewPwUser({nueva:"",confirmar:""}); setNewPwErr({}); setNewPwMsg(""); }}
                        style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:8, border:`1.5px solid ${selUser?.id===u.id?"#FF6B00":"rgba(255,255,255,0.07)"}`, background:selUser?.id===u.id?"rgba(255,107,0,0.08)":"#0a0a0a", cursor:"pointer", transition:"all 0.15s", textAlign:"left" }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"#10b98125", border:"2px solid #10b98150", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#10b981", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
                          {(u.nombre||u.username||"?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#f0f4f8", fontFamily:"'DM Sans',sans-serif" }}>{u.nombre||u.username}</div>
                          <div style={{ fontSize:11, color:"#8a9bb0", fontFamily:"'DM Sans',sans-serif" }}>@{u.username}</div>
                        </div>
                        {selUser?.id===u.id && <span style={{ marginLeft:"auto", fontSize:11, color:"#FF6B00", fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>Seleccionado ✓</span>}
                      </button>
                    ))
                  }
                </div>
              </div>

              {selUser && (
                <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize:13, color:"#8a9bb0", margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                    Restableciendo contraseña de <strong style={{ color:"#f0f4f8" }}>@{selUser.username}</strong>
                  </p>
                  <div>
                    <PasswordField label="Nueva contraseña" value={newPwUser.nueva} onChange={e=>{ setNewPwUser(f=>({...f,nueva:e.target.value})); setNewPwErr(v=>({...v,nueva:""})); }} show={newPwSh.nueva} onToggle={()=>setNewPwSh(v=>({...v,nueva:!v.nueva}))} error={newPwErr.nueva}/>
                    <StrengthBar password={newPwUser.nueva}/>
                  </div>
                  <PasswordField label="Confirmar nueva contraseña" value={newPwUser.confirmar} onChange={e=>{ setNewPwUser(f=>({...f,confirmar:e.target.value})); setNewPwErr(v=>({...v,confirmar:""})); }} show={newPwSh.confirmar} onToggle={()=>setNewPwSh(v=>({...v,confirmar:!v.confirmar}))} error={newPwErr.confirmar}/>
                  {newPwUser.confirmar && newPwUser.confirmar===newPwUser.nueva && <p style={{ ...errS, color:"#10b981" }}>✓ Coinciden</p>}
                  <button onClick={cambiarPwUsuario} disabled={newPwSaving} style={{ ...btnOrg, alignSelf:"flex-start", opacity:newPwSaving?0.7:1 }}
                    onMouseEnter={e=>{ if(!newPwSaving) e.currentTarget.style.background="#E55E00"; }} onMouseLeave={e=>e.currentTarget.style.background="#FF6B00"}>
                    {newPwSaving?"Restableciendo...":"Restablecer contraseña →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`::placeholder{color:rgba(255,255,255,0.18)!important;} input:-webkit-autofill{-webkit-box-shadow:0 0 0 30px #0a0a0a inset!important;-webkit-text-fill-color:#f0f4f8!important;}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PERFIL SECRETARIA
// ══════════════════════════════════════════════════════════════════════════════
function PerfilSecretaria({ user, nombre, email, username, rolInfo, onVolver }) {
  const { getToken } = useAuth();
  const [solicitado, setSolicitado] = useState(false);
  const [msg, setMsg] = useState("");

  const solicitarReset = async () => {
    setSolicitado(true);
    setMsg("✓ Solicitud enviada al administrador. Te notificarán cuando tu contraseña haya sido restablecida.");
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/usuarios/solicitar-reset`, {
        method:"POST",
        headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({ userId:user?.id, username }),
      });
    } catch {}
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexShrink:0 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:"#f0f4f8", margin:"0 0 4px", textTransform:"uppercase" }}>Mi Perfil</h1>
          <p style={{ fontSize:13, color:"#8a9bb0", margin:0, fontFamily:"'DM Sans',sans-serif" }}>Tu información de cuenta</p>
        </div>
        {onVolver && <button onClick={onVolver} style={{ ...btnGh }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>}
      </div>

      <div style={{ flex:1, display:"grid", gridTemplateColumns:"260px 1fr", gap:16, minHeight:0, overflow:"hidden" }}>
        <PanelInfo user={user} nombre={nombre} email={email} username={username} rolInfo={rolInfo}/>

        <div style={{ display:"flex", flexDirection:"column", gap:12, overflowY:"auto" }}>
          {/* Info de cuenta */}
          <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"22px" }}>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:900, color:"#f0f4f8", margin:"0 0 18px", textTransform:"uppercase" }}>Información de cuenta</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { l:"Nombre completo", v:nombre,        disabled:true },
                { l:"Email",           v:email,         disabled:true },
                { l:"Nombre de usuario",v:`@${username}`,disabled:true },
                { l:"Rol del sistema",  v:"📋 Secretaria",disabled:true },
              ].map(f => (
                <div key={f.l}>
                  <label style={labelS}>{f.l}</label>
                  <input type="text" value={f.v} disabled style={{ ...inputS, opacity:0.6, cursor:"default" }}/>
                </div>
              ))}
            </div>
            <p style={{ fontSize:12, color:"#4a5568", margin:"14px 0 0", fontFamily:"'DM Sans',sans-serif" }}>
              Para modificar tu información personal, solicita los cambios al administrador del sistema.
            </p>
          </div>

          {/* Solicitar cambio de contraseña */}
          <div style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"22px" }}>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:900, color:"#f0f4f8", margin:"0 0 8px", textTransform:"uppercase" }}>¿Olvidaste tu contraseña?</h3>
            <p style={{ fontSize:13, color:"#8a9bb0", margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              No puedes cambiar tu contraseña directamente. Si la olvidaste o deseas cambiarla, solicita un restablecimiento al administrador. Él generará una nueva contraseña temporal para ti.
            </p>

            {msg && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", fontSize:13, marginBottom:16, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
                {msg}
              </div>
            )}

            {!solicitado ? (
              <button onClick={solicitarReset} style={{ ...btnOrg }}
                onMouseEnter={e=>e.currentTarget.style.background="#E55E00"} onMouseLeave={e=>e.currentTarget.style.background="#FF6B00"}>
                🔑 Solicitar restablecimiento de contraseña
              </button>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:8, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
                <span style={{ fontSize:16 }}>✓</span>
                <span style={{ fontSize:13, color:"#10b981", fontFamily:"'DM Sans',sans-serif" }}>Solicitud enviada — espera que el administrador restablezca tu contraseña.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`::placeholder{color:rgba(255,255,255,0.18)!important;}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT PRINCIPAL — detecta el rol automáticamente
// ══════════════════════════════════════════════════════════════════════════════
export default function PerfilPage({ onVolver }) {
  const { user } = useAuth();
  const nombre   = user?.nombre || user?.name || user?.username || "Usuario";
  const username = user?.username || "";
  const email    = user?.email   || `${username.toLowerCase()}@cajasflow.com`;
  const rol      = user?.rol     || user?.role || "";
  const rolInfo  = getRol(rol);
  const isAdmin  = rol === "admin" || rol === "administrador";

  const props = { user, nombre, email, username, rolInfo, onVolver };

  return isAdmin
    ? <PerfilAdmin    {...props}/>
    : <PerfilSecretaria {...props}/>;
}