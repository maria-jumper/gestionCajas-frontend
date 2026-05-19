import { useState } from "react";
import Logo from "./Logo";
 
const NAV_ITEMS = [
  {
    group: "Principal",
    items: [
      { id: "dashboard", label: "Dashboard",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { id: "packages", label: "Paquetes",      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
      { id: "deliveries",label: "Entregas",     icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" },
      { id: "tracking",  label: "Seguimiento",  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
  {
    group: "Gestión",
    items: [
      { id: "clients",   label: "Clientes",     icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
      { id: "reports",   label: "Reportes",     icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { id: "settings",  label: "Configuración",icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
];
 
function NavIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  );
}
 
export default function Sidebar({ active, onNavigate, onLogout, user }) {
  const [collapsed, setCollapsed] = useState(false);
 
  return (
    <aside
      className="flex flex-col h-full transition-all duration-300"
      style={{
        width: collapsed ? 64 : 220,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center px-4 h-16 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {collapsed ? (
          <Logo size="sm" showText={false} />
        ) : (
          <Logo size="sm" />
        )}
      </div>
 
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-5">
            {!collapsed && (
              <p
                className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 font-body"
                style={{ color: "var(--text-ghost)" }}
              >
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : ""}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-body font-medium transition-all duration-150 ${
                    collapsed ? "justify-center" : ""
                  }`}
                  style={{
                    background: isActive ? "var(--bg-hover)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    borderLeft: isActive ? `2px solid var(--accent)` : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <NavIcon path={item.icon} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
 
      {/* User + collapse */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid var(--border)" }}>
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-lg" style={{ background: "var(--bg-hover)" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {user.name?.[0] ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate font-body" style={{ color: "var(--text-primary)" }}>{user.name}</p>
              <p className="text-[10px] truncate font-body" style={{ color: "var(--text-faint)" }}>{user.role}</p>
            </div>
          </div>
        )}
        <div className="flex gap-1">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-body transition-colors"
            style={{ color: "var(--text-faint)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}/>
            </svg>
          </button>
          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-body transition-colors"
            style={{ color: "var(--text-faint)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-faint)"; }}
            title="Cerrar sesión"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}