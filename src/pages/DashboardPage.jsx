import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import EntregasPage from "./EntregasPage";
import EnviosPage from "./EnviosPage";
import InventarioPage from "./InventarioPage";
import GestionUsuarios from "./GestionUsuariosPage";
import PerfilPage from "./PerfilPage";
import ConfiguracionPage from "./ConfiguracionPage";
import InformesPage from "./InformesPage";
import GastosPage from "./GastosPage";

// ── Paleta reactiva ───────────────────────────────────────────────────────────
function useC() {
  const { isDark } = useTheme();
  return {
    // Sidebar: oscuro en dark, gris muy oscuro en light (para que contraste con naranja)
    sidebarBg:     isDark ? "#0d0d0d" : "#1e2027",
    sidebarBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.07)",
    sidebarText:   "rgba(255,255,255,0.5)",
    sidebarActive: "rgba(255,255,255,0.08)",
    sidebarHover:  "rgba(255,255,255,0.06)",
    // Todo lo demás responde al tema
    headerBg:     isDark ? "#0d0d0d"  : "#ffffff",
    headerBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
    mainBg:       isDark ? "#0d0d0d"  : "#f4f5f7",
    cardBg:       isDark ? "#161616"  : "#ffffff",
    cardBorder:   isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    accent:       "#FF6B00",
    accentDim:    "rgba(255,107,0,0.12)",
    navText:      "rgba(255,255,255,0.45)",
    textPrimary:  isDark ? "#f0f4f8"  : "#1a1d23",
    textSec:      isDark ? "#8a9bb0"  : "#5a6478",
    textGhost:    isDark ? "#4e6070"  : "#9aa5b4",
    inputBg:      isDark ? "#111111"  : "#f9fafb",
    hover:        isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    danger:       "#ef4444",
    success:      "#10b981",
    warning:      "#f59e0b",
    isDark,
  };
}

const IC = {
  Home:     ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Box:      ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Truck:    ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  List:     ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Chart:    ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Receipt:  ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Users:    ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Settings: ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M19.07 19.07l-1.41-1.41M20 12h2"/></svg>,
  Help:     ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Menu:     ()=><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Logout:   ()=><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  User:     ()=><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Chevron:  ()=><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

function Logo({ collapsed }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:collapsed?0:10, overflow:"hidden" }}>
      <div style={{ width:34, height:34, background:"#FF6B00", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#fff"/></svg>
      </div>
      {!collapsed && (
        <div style={{ lineHeight:1 }}>
          <div style={{ fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif", fontSize:14, fontWeight:900, color:"#fff", textTransform:"uppercase", letterSpacing:"0.04em" }}>INTER</div>
          <div style={{ fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif", fontSize:11, fontWeight:700, color:"#FF6B00", textTransform:"uppercase", letterSpacing:"0.08em" }}>RAPIDÍSIMO</div>
        </div>
      )}
    </div>
  );
}

function ModuloPlaceholder({ titulo, emoji, descripcion, color, onVolver }) {
  const C = useC();
  return (
    <div style={{ maxWidth:500,margin:"0 auto",textAlign:"center",padding:"2rem 1rem" }}>
      <div style={{ fontSize:56,marginBottom:16 }}>{emoji}</div>
      <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:C.textPrimary,margin:"0 0 10px",textTransform:"uppercase" }}>{titulo}</h2>
      <p style={{ fontSize:14,color:C.textSec,marginBottom:20,lineHeight:1.6 }}>{descripcion}</p>
      <span style={{ display:"inline-block",padding:"5px 16px",borderRadius:20,border:`1px solid ${color}44`,color,background:`${color}11`,fontSize:12,fontWeight:600,marginBottom:20 }}>En desarrollo</span><br/>
      <button onClick={onVolver} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:8,border:`1px solid ${C.cardBorder}`,background:"transparent",color:C.textSec,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:8 }}
        onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        ← Volver al inicio
      </button>
    </div>
  );
}

function OpCard({ Icon, title, desc, onClick }) {
  const C = useC();
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:C.cardBg, border:`1px solid ${hov?"#FF6B00":C.cardBorder}`, borderRadius:12, padding:"20px 22px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:16, transition:"all 0.2s", transform:hov?"translateY(-2px)":"translateY(0)", boxShadow:hov?"0 4px 14px rgba(255,107,0,0.12)":"none", width:"100%" }}>
      <div style={{ width:46, height:46, borderRadius:10, flexShrink:0, background:hov?"rgba(255,107,0,0.14)":C.hover, display:"flex", alignItems:"center", justifyContent:"center", color:hov?"#FF6B00":C.textSec, transition:"all 0.2s" }}><Icon/></div>
      <div style={{ flex:1 }}>
        <h4 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:C.textPrimary, margin:"0 0 3px", textTransform:"uppercase" }}>{title}</h4>
        <p style={{ fontSize:13, color:C.textSec, margin:0, lineHeight:1.3 }}>{desc}</p>
      </div>
      <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, background:hov?"#FF6B00":C.hover, display:"flex", alignItems:"center", justifyContent:"center", color:hov?"#fff":C.textGhost, fontSize:14, fontWeight:700 }}>→</div>
    </button>
  );
}

function AdminCard({ titulo, Icon, desc, color, onClick }) {
  const C = useC();
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:C.cardBg, border:`1px solid ${hov?color:C.cardBorder}`, borderRadius:12, padding:"18px 20px", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:14, cursor:"pointer", transition:"all 0.2s", transform:hov?"translateY(-2px)":"translateY(0)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ width:38, height:38, borderRadius:8, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", color }}><Icon/></div>
        <span style={{ fontSize:12, color:C.textGhost, fontWeight:600 }}>Módulo</span>
      </div>
      <div>
        <h4 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:900, color:C.textPrimary, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.02em" }}>{titulo}</h4>
        <p style={{ fontSize:12, color:C.textSec, margin:0, lineHeight:1.3 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── DASHBOARD PRINCIPAL ───────────────────────────────────────────────────────
export default function DashboardPage({ onLogout }) {
  const { user, logout } = useAuth();
  const C = useC();
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [activeNav,    setActiveNav]    = useState("inicio");
  const [vista,        setVista]        = useState("inicio");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const check = () => { const m = window.innerWidth <= 768; setIsMobile(m); setSidebarOpen(!m); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fn = e => { if(menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = () => { logout(); if(onLogout) onLogout(); };
  if (!user) return null;

  const nombre  = user?.nombre || user?.name || user?.username || "Usuario";
  const rol     = user?.rol || user?.role || "";
  const email   = user?.email || `${(user?.username||"admin").toLowerCase()}@cajasflow.com`;
  const isAdmin = rol === "administrador" || rol === "admin";

  const navItems = [
    { key:"inicio",        label:"Inicio",        Icon:IC.Home     },
    { key:"entregas",      label:"Entregas",      Icon:IC.Box      },
    { key:"envios",        label:"Envíos",        Icon:IC.Truck    },
    ...(isAdmin ? [
      { key:"inventario",  label:"Inventario",    Icon:IC.List     },
      { key:"informes",    label:"Informes",      Icon:IC.Chart    },
      { key:"gastos",      label:"Gastos",        Icon:IC.Receipt  },
      { key:"usuarios",    label:"Usuarios",      Icon:IC.Users    },
    ] : []),
    { key:"configuracion", label:"Configuración", Icon:IC.Settings },
  ];

  const MODULOS_META = {
    informes: { titulo:"Informes", emoji:"📊", descripcion:"Visualiza reportes detallados de entregas, envíos e ingresos.", color:"#f59e0b" },
    gastos:   { titulo:"Gastos",   emoji:"💰", descripcion:"Registra gastos de operación, nómina, insumos y otros egresos.", color:"#ef4444" },
  };

  const handleNav = key => {
    setActiveNav(key);
    if(isMobile) setSidebarOpen(false);
    if(key==="inicio")         { setVista("inicio");         return; }
    if(key==="entregas")       { setVista("entregas");       return; }
    if(key==="envios")         { setVista("envios");         return; }
    if(key==="usuarios")       { setVista("usuarios");       return; }
    if(key==="inventario")     { setVista("inventario");     return; }
    if(key==="configuracion")  { setVista("configuracion");  return; }
    if(MODULOS_META[key])       { setVista(key);               return; }
  };

  const abrirPerfil = () => { setVista("perfil"); setActiveNav("perfil"); setShowUserMenu(false); };
  const abrirConfig = () => { setVista("configuracion"); setActiveNav("configuracion"); setShowUserMenu(false); if(isMobile) setSidebarOpen(false); };
  const volver      = () => { setVista("inicio"); setActiveNav("inicio"); };

  const paginaTitulo = activeNav==="perfil" ? "Mi Perfil" : navItems.find(n=>n.key===activeNav)?.label || "Inicio";
  const paginaSub    = activeNav==="inicio" ? "Resumen general de operaciones" : activeNav==="entregas" ? "Gestión de entregas" : activeNav==="envios" ? "Registro de envíos" : activeNav==="perfil" ? "Información de tu cuenta" : activeNav==="configuracion" ? "Preferencias del sistema" : "Módulo del sistema";

  const renderVista = () => {
    if(vista==="informes")       return <InformesPage  onVolver={volver}/>;
    if(vista==="gastos")         return <GastosPage    onVolver={volver}/>;
    if(vista==="entregas")   return <EntregasPage  onVolver={volver}/>;
    if(vista==="envios")     return <EnviosPage    onVolver={volver}/>;
    if(vista==="usuarios")       return <GestionUsuarios    onVolver={volver}/>;
    if(vista==="inventario")     return <InventarioPage     onVolver={volver}/>;
    if(vista==="perfil")         return <PerfilPage         onVolver={volver}/>;
    if(vista==="configuracion")  return <ConfiguracionPage  onVolver={volver}/>;
    if(MODULOS_META[vista])      return <ModuloPlaceholder  {...MODULOS_META[vista]} onVolver={volver}/>;

    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, gap:14 }}>
        <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:isMobile?"16px":"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:"#FF6B00", borderRadius:"12px 0 0 12px" }}/>
          <div style={{ paddingLeft:isMobile?8:16 }}>
            <p style={{ fontSize:11, color:C.textSec, margin:"0 0 2px" }}>{new Date().toLocaleDateString("es-CO",{weekday:"short",year:"numeric",month:"short",day:"numeric"})}</p>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:isMobile?22:26, fontWeight:900, color:C.textPrimary, margin:"0 0 4px", textTransform:"uppercase" }}>¡Bienvenido, {nombre}! 👋</h2>
            <p style={{ fontSize:12, color:C.textSec, margin:0 }}>Gestiona tus operaciones de forma rápida y eficiente.</p>
          </div>
          {!isMobile && <div style={{ opacity:0.08, flexShrink:0 }}><svg viewBox="0 0 120 70" width="120" height="70"><rect x="8" y="20" width="38" height="44" rx="4" fill="#FF6B00"/><rect x="16" y="6" width="22" height="14" rx="3" fill="#FF6B00"/><circle cx="92" cy="36" r="26" fill="#FF6B00"/><polyline points="80,36 90,46 106,26" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
        </div>

        <div style={{ flexShrink:0 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.textGhost, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 10px" }}>¿Qué operación deseas realizar hoy?</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 }}>
            {[{ key:"entregas", Icon:IC.Box, title:"Entregas", desc:"Registra guías y completa entregas de paquetes." },{ key:"envios", Icon:IC.Truck, title:"Envíos", desc:"Registra nuevos paquetes para enviar." }].map(op=><OpCard key={op.key} {...op} onClick={()=>{ setVista(op.key); setActiveNav(op.key); }}/>)}
          </div>
        </div>

        {isAdmin && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textGhost, letterSpacing:"0.1em", textTransform:"uppercase", margin:"10px 0 10px", flexShrink:0 }}>Administración</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, flex:1, minHeight:0 }}>
              {[{ key:"inventario", titulo:"Inventario", Icon:IC.List, desc:"Stock de paquetes y recursos.", color:"#6366f1" },{ key:"informes", titulo:"Informes", Icon:IC.Chart, desc:"Reportes y métricas del negocio.", color:"#ec4899" },{ key:"gastos", titulo:"Registrar gastos", Icon:IC.Receipt, desc:"Control de gastos operacionales.", color:"#f59e0b" },{ key:"usuarios", titulo:"Gestión de usuarios", Icon:IC.Users, desc:"Accesos y roles del equipo.", color:"#10b981" }].map(m=><AdminCard key={m.key} {...m} onClick={()=>handleNav(m.key)}/>)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:C.mainBg, fontFamily:"'DM Sans','Helvetica Neue',Arial,sans-serif", transition:"background 0.3s" }}>

      {/* Sidebar — gris muy oscuro en ambos temas para contraste con naranja */}
      <aside style={{ width:sidebarOpen?216:(isMobile?0:64), flexShrink:0, background:C.sidebarBg, borderRight:`1px solid ${C.sidebarBorder}`, display:"flex", flexDirection:"column", transition:"all 0.3s", overflow:"hidden", position:"fixed", top:0, left:0, bottom:0, zIndex:150 }}>
        <div style={{ height:64, padding:"0 14px", display:"flex", alignItems:"center", borderBottom:`1px solid ${C.sidebarBorder}`, flexShrink:0, justifyContent:"space-between" }}>
          <Logo collapsed={isMobile?false:!sidebarOpen}/>
          {isMobile && <button onClick={()=>setSidebarOpen(false)} style={{ background:"none", border:"none", outline:"none", color:C.sidebarText, fontSize:18, cursor:"pointer" }}>✕</button>}
        </div>
        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto", overflowX:"hidden" }}>
          {navItems.map(({key,label,Icon})=>{
            const active = activeNav===key;
            return (
              <button key={key} onClick={()=>handleNav(key)} title={!sidebarOpen?label:undefined}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 10px", borderRadius:8, border:"none", outline:"none", cursor:"pointer", background:active?"rgba(255,107,0,0.18)":"transparent", color:active?"#FF6B00":C.sidebarText, marginBottom:2, fontFamily:"'DM Sans',sans-serif", fontWeight:active?700:500, fontSize:14, whiteSpace:"nowrap", borderLeft:`3px solid ${active?"#FF6B00":"transparent"}`, transition:"all 0.15s" }}
                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background=C.sidebarHover; e.currentTarget.style.color="rgba(255,255,255,0.85)"; }}}
                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.sidebarText; }}}>
                <span style={{ flexShrink:0 }}><Icon/></span>
                {(sidebarOpen||isMobile) && <span>{label}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:"10px 8px", borderTop:`1px solid ${C.sidebarBorder}`, flexShrink:0 }}>
          <button style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 10px", borderRadius:8, border:"none", outline:"none", cursor:"pointer", background:"transparent", color:C.sidebarText, fontFamily:"'DM Sans',sans-serif", fontSize:14, whiteSpace:"nowrap" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.sidebarHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{ flexShrink:0 }}><IC.Help/></span>
            {(sidebarOpen||isMobile) && <><span style={{ flex:1 }}>Ayuda</span><IC.Chevron/></>}
          </button>
        </div>
      </aside>

      {isMobile && sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:140 }}/>}

      <div style={{ flex:1, marginLeft:isMobile?0:(sidebarOpen?216:64), transition:"margin-left 0.25s", display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
        <header style={{ height:64, flexShrink:0, background:C.headerBg, borderBottom:`1px solid ${C.headerBorder}`, display:"flex", alignItems:"center", padding:isMobile?"0 16px":"0 24px", gap:12, zIndex:30, transition:"background 0.3s, border-color 0.3s" }}>
          <button onClick={()=>setSidebarOpen(v=>!v)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textSec, padding:4, display:"flex", alignItems:"center" }}><IC.Menu/></button>
          <div>
            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:isMobile?18:20, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>{paginaTitulo}</h1>
            {!isMobile && <p style={{ fontSize:11, color:C.textGhost, margin:0 }}>{paginaSub}</p>}
          </div>
          <div style={{ flex:1 }}/>

          <div ref={menuRef} style={{ position:"relative" }}>
            <button onClick={()=>setShowUserMenu(v=>!v)}
              style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", padding:"4px 6px", borderRadius:8 }}
              onMouseEnter={e=>e.currentTarget.style.background=C.hover}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#FF6B00", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13, color:"#fff", flexShrink:0 }}>
                {nombre.slice(0,2).toUpperCase()}
              </div>
              {!isMobile && (
                <div style={{ textAlign:"left", lineHeight:1.2 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary }}>{nombre}</div>
                  <div style={{ fontSize:11, color:C.textGhost }}>{email}</div>
                </div>
              )}
              <IC.Chevron/>
            </button>

            {showUserMenu && (
              <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"8px 0", boxShadow:`0 8px 24px var(--cf-shadow, rgba(0,0,0,0.4))`, minWidth:190, zIndex:100 }}>
                <button onClick={abrirPerfil} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <IC.User/><span>Mi perfil</span>
                </button>
                <button onClick={abrirConfig} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <IC.Settings/><span>Configuración</span>
                </button>
                <div style={{ height:1, background:C.cardBorder, margin:"4px 0" }}/>
                <button onClick={()=>{ handleLogout(); setShowUserMenu(false); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontFamily:"'DM Sans',sans-serif", fontSize:14 }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <IC.Logout/><span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex:1, padding:isMobile?"14px":"20px 24px", overflowY:"auto", overflowX:"hidden", display:"flex", flexDirection:"column", minHeight:0, background:C.mainBg, transition:"background 0.3s" }}>
          {renderVista()}
        </main>
      </div>


      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        * { box-sizing:border-box; }
        button,input,select,textarea { outline:none !important; }
        select option { background:${C.isDark?"#161616":"#fff"}; color:${C.isDark?"#f0f4f8":"#1a1d23"}; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.15)"}; border-radius:4px; }
      `}</style>
    </div>
  );
}