import ThemeToggle from "./Themetoggle";
import { usePWA } from "../hooks/UsePWA";
 
export default function Header({ title, subtitle }) {
  const { installPrompt, promptInstall } = usePWA();
 
  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Page title */}
      <div>
        <h2 className="font-display text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs font-body mt-0.5" style={{ color: "var(--text-faint)" }}>
            {subtitle}
          </p>
        )}
      </div>
 
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-body"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
            color: "var(--text-ghost)",
            minWidth: 180,
          }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span>Buscar…</span>
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "var(--border)", color: "var(--text-ghost)" }}
          >
            ⌘K
          </span>
        </div>
 
        {/* Install PWA */}
        {installPrompt && (
          <button
            onClick={promptInstall}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-colors"
            style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border-accent)",
              color: "var(--accent)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            Instalar app
          </button>
        )}
 
        {/* Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </button>
 
        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
 