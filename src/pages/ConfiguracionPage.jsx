import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

// ── Paleta dinámica según tema ────────────────────────────────────────────────
function useC() {
  const { isDark } = useTheme();
  return {
    bg:          isDark ? "#0d0d0d"  : "#f0f2f5",
    card:        isDark ? "#111111"  : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)",
    cardBg2:     isDark ? "#1a1a1a"  : "#f5f5f5",
    accent:      "#FF6B00",
    textPrimary: isDark ? "#f0f4f8"  : "#111111",
    textSec:     isDark ? "#8a9bb0"  : "#4a5568",
    textGhost:   isDark ? "#4a5568"  : "#9aa3ae",
    inputBg:     isDark ? "#0a0a0a"  : "#f9f9f9",
    inputBorder: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.15)",
    sectionBg:   isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    toggleOff:   isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
    isDark,
  };
}

function Toggle({ value, onChange, color="#FF6B00", offColor }) {
  // offColor se pasa desde SettingRow que ya tiene acceso a useC()
  const bg = value ? color : (offColor || "rgba(0,0,0,0.15)");
  return (
    <button type="button" onClick={()=>onChange(!value)}
      style={{ width:44, height:24, borderRadius:12, background:bg, border:"none", cursor:"pointer", position:"relative", flexShrink:0, transition:"background 0.25s" }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?23:3, transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
    </button>
  );
}

function SettingRow({ icon, title, desc, children }) {
  const C = useC();
  // Clonar el hijo (Toggle) pasándole offColor dinámico
  const child = React.isValidElement(children)
    ? React.cloneElement(children, { offColor: C.toggleOff })
    : children;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:10, background:C.sectionBg, border:`1px solid ${C.cardBorder}` }}>
      <div style={{ width:38, height:38, borderRadius:9, background:C.cardBg2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>{title}</div>
        <div style={{ fontSize:12, color:C.textSec, fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>{desc}</div>
      </div>
      <div style={{ flexShrink:0 }}>
        {child}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  const C = useC();
  return (
    <p style={{ fontSize:10, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 0 10px", fontFamily:"'DM Sans',sans-serif" }}>
      {children}
    </p>
  );
}

// ── Preferencias guardadas localmente ─────────────────────────────────────────
function loadPref(key, def) {
  try { const v = localStorage.getItem(`cf-pref-${key}`); return v !== null ? JSON.parse(v) : def; } catch { return def; }
}
function savePref(key, val) {
  try { localStorage.setItem(`cf-pref-${key}`, JSON.stringify(val)); } catch {}
}

export default function ConfiguracionPage({ onVolver }) {
  const { theme, toggle: toggleTheme, isDark } = useTheme();
  const C = useC();

  // Preferencias
  const [notifSonido,   setNotifSonido]   = useState(()=>loadPref("notif-sonido", true));
  const [notifEscritorio,setNotifEscritorio]=useState(()=>loadPref("notif-escritorio", false));
  const [compactMode,   setCompactMode]   = useState(()=>loadPref("compact-mode", false));
  const [animaciones,   setAnimaciones]   = useState(()=>loadPref("animaciones", true));
  const [autoGuardado,  setAutoGuardado]  = useState(()=>loadPref("auto-guardado", true));
  const [idioma,        setIdioma]        = useState(()=>loadPref("idioma", "es"));
  const [densidad,      setDensidad]      = useState(()=>loadPref("densidad", "normal"));
  const [guardado,      setGuardado]      = useState(false);

  const set = (setter, key) => (val) => {
    setter(val);
    savePref(key, val);
  };

  const guardarConfig = () => {
    setGuardado(true);
    setTimeout(()=>setGuardado(false), 2500);
  };

  const btnOrg = { display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 20px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", transition:"background 0.2s" };
  const btnGh  = { ...btnOrg, background:"transparent", color:C.textPrimary, border:`1px solid ${C.cardBorder}` };

  const selectS = {
    padding:"9px 12px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`,
    background:C.inputBg, color:C.textPrimary,
    fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, background:C.bg, transition:"background 0.3s" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexShrink:0, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30, fontWeight:900, color:C.textPrimary, margin:"0 0 4px", textTransform:"uppercase" }}>Configuración</h1>
          <p style={{ fontSize:13, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Personaliza tu experiencia en el sistema</p>
        </div>
        {onVolver && (
          <button onClick={onVolver} style={{ ...btnGh }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Volver</button>
        )}
      </div>

      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:24 }}>

        {/* ── APARIENCIA ── */}
        <div>
          <SectionTitle>🎨 Apariencia</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

            {/* Tema — selector visual */}
            <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"18px 18px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>Tema de la interfaz</div>
              <div style={{ fontSize:12, color:C.textSec, fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>Elige entre modo oscuro o claro para toda la aplicación.</div>
              <div style={{ display:"flex", gap:12 }}>
                {[
                  { key:"dark",  label:"Oscuro",  icon:"🌙", bg:"#0d0d0d", fg:"#f0f4f8", accent:"#FF6B00" },
                  { key:"light", label:"Claro",   icon:"☀️", bg:"#f5f5f5", fg:"#111",    accent:"#FF6B00" },
                ].map(opt => (
                  <button key={opt.key} onClick={()=>{ if(theme!==opt.key) toggleTheme(); }}
                    style={{ flex:1, padding:"14px 12px", borderRadius:10, border:`2px solid ${theme===opt.key?"#FF6B00":"rgba(255,255,255,0.1)"}`, background:theme===opt.key?"rgba(255,107,0,0.08)":C.cardBg2, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10, transition:"all 0.2s", position:"relative" }}>
                    {theme===opt.key && (
                      <div style={{ position:"absolute", top:8, right:8, width:18, height:18, borderRadius:"50%", background:"#FF6B00", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg viewBox="0 0 12 12" width="9" height="9" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                    {/* Mini preview */}
                    <div style={{ width:80, height:44, borderRadius:6, background:opt.bg, overflow:"hidden", position:"relative", border:`1px solid ${opt.key==="light"?"rgba(0,0,0,0.1)":"rgba(255,255,255,0.08)"}` }}>
                      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:20, background:opt.key==="dark"?"#0a0a0a":"#ebebeb", borderRight:`1px solid ${opt.key==="dark"?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}` }}/>
                      <div style={{ position:"absolute", right:4, top:4, left:26, height:6, borderRadius:2, background:opt.accent, opacity:0.9 }}/>
                      <div style={{ position:"absolute", right:4, top:14, left:26, height:4, borderRadius:2, background:opt.fg, opacity:0.3 }}/>
                      <div style={{ position:"absolute", right:4, top:22, left:26, height:4, borderRadius:2, background:opt.fg, opacity:0.2, width:"60%" }}/>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:theme===opt.key?"#FF6B00":C.textSec, fontFamily:"'DM Sans',sans-serif" }}>
                      {opt.icon} {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <SettingRow icon="📐" title="Modo compacto" desc="Reduce el espaciado para mostrar más contenido en pantalla.">
              <Toggle value={compactMode} onChange={set(setCompactMode,"compact-mode")}/>
            </SettingRow>

            <SettingRow icon="✨" title="Animaciones" desc="Activa o desactiva las transiciones y animaciones de la interfaz.">
              <Toggle value={animaciones} onChange={set(setAnimaciones,"animaciones")}/>
            </SettingRow>

            <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:10, background:C.sectionBg, border:`1px solid ${C.cardBorder}` }}>
              <div style={{ width:38, height:38, borderRadius:9, background:C.cardBg2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🌍</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>Idioma</div>
                <div style={{ fontSize:12, color:C.textSec, fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>Idioma de la interfaz del sistema.</div>
              </div>
              <select value={idioma} onChange={e=>{ setIdioma(e.target.value); savePref("idioma",e.target.value); }} style={selectS}>
                <option value="es">🇨🇴 Español</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:10, background:C.sectionBg, border:`1px solid ${C.cardBorder}` }}>
              <div style={{ width:38, height:38, borderRadius:9, background:C.cardBg2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>📏</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>Densidad de contenido</div>
                <div style={{ fontSize:12, color:C.textSec, fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>Controla qué tan juntos se ven los elementos.</div>
              </div>
              <select value={densidad} onChange={e=>{ setDensidad(e.target.value); savePref("densidad",e.target.value); }} style={selectS}>
                <option value="compacto">Compacto</option>
                <option value="normal">Normal</option>
                <option value="amplio">Amplio</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── NOTIFICACIONES ── */}
        <div>
          <SectionTitle>🔔 Notificaciones</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <SettingRow icon="🔊" title="Sonido de notificaciones" desc="Reproduce un sonido al recibir alertas del sistema.">
              <Toggle value={notifSonido} onChange={set(setNotifSonido,"notif-sonido")}/>
            </SettingRow>
            <SettingRow icon="🖥️" title="Notificaciones de escritorio" desc="Muestra alertas emergentes del navegador cuando haya actualizaciones.">
              <Toggle value={notifEscritorio} onChange={v=>{
                if (v && "Notification" in window) {
                  Notification.requestPermission().then(p => {
                    const allowed = p==="granted";
                    set(setNotifEscritorio,"notif-escritorio")(allowed);
                  });
                } else {
                  set(setNotifEscritorio,"notif-escritorio")(v);
                }
              }}/>
            </SettingRow>
          </div>
        </div>

        {/* ── SISTEMA ── */}
        <div>
          <SectionTitle>⚙️ Sistema</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <SettingRow icon="💾" title="Guardado automático" desc="Guarda automáticamente los formularios mientras los completas.">
              <Toggle value={autoGuardado} onChange={set(setAutoGuardado,"auto-guardado")}/>
            </SettingRow>

            <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:10, background:C.sectionBg, border:`1px solid ${C.cardBorder}` }}>
              <div style={{ width:38, height:38, borderRadius:9, background:C.cardBg2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🗑️</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>Limpiar caché local</div>
                <div style={{ fontSize:12, color:C.textSec, fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>Borra los datos temporales guardados en el navegador.</div>
              </div>
              <button onClick={()=>{ const keys=["cf-pref-notif-sonido","cf-pref-notif-escritorio","cf-pref-compact-mode","cf-pref-animaciones","cf-pref-auto-guardado","cf-pref-idioma","cf-pref-densidad"]; keys.forEach(k=>localStorage.removeItem(k)); alert("Caché limpiado correctamente."); }}
                style={{ padding:"7px 14px", borderRadius:7, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textSec, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                Limpiar
              </button>
            </div>

            {/* Versión del sistema */}
            <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:10, background:C.sectionBg, border:`1px solid ${C.cardBorder}` }}>
              <div style={{ width:38, height:38, borderRadius:9, background:C.cardBg2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>ℹ️</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>Versión del sistema</div>
                <div style={{ fontSize:12, color:C.textSec, fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>CajasFlow / Inter Rapidísimo</div>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:"#FF6B00", fontFamily:"'DM Sans',sans-serif", background:"rgba(255,107,0,0.1)", padding:"4px 10px", borderRadius:20, border:"1px solid rgba(255,107,0,0.2)" }}>
                v1.0.0
              </span>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div style={{ display:"flex", gap:10, paddingBottom:4, flexShrink:0 }}>
          <button onClick={guardarConfig}
            style={{ ...btnOrg, background:guardado?"#10b981":"#FF6B00", minWidth:160 }}
            onMouseEnter={e=>{ if(!guardado) e.currentTarget.style.background="#E55E00"; }}
            onMouseLeave={e=>e.currentTarget.style.background=guardado?"#10b981":"#FF6B00"}>
            {guardado?"✓ Configuración guardada":"Guardar configuración"}
          </button>
        </div>
      </div>

      <style>{`select option { background:${isDark?"#111":"#fff"}; color:${isDark?"#f0f4f8":"#111"}; }`}</style>
    </div>
  );
}