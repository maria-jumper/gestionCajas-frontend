export default function Logo({ size = "md", showText = true }) {
  const sizes = { sm: 28, md: 38, lg: 52 };
  const px = sizes[size] ?? sizes.md;
  const textSizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };
 
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon mark */}
      <div style={{ width: px, height: px }} className="relative flex-shrink-0">
        <svg viewBox="0 0 48 48" width={px} height={px} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer box */}
          <rect x="4" y="12" width="40" height="30" rx="4" fill="var(--accent)" fillOpacity="0.12" stroke="var(--accent)" strokeWidth="1.8"/>
          {/* Inner box smaller */}
          <rect x="13" y="20" width="22" height="16" rx="2.5" fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="1.4"/>
          {/* Top lid line */}
          <path d="M4 20h40" stroke="var(--accent)" strokeWidth="1.6"/>
          {/* Arrows indicating flow */}
          <path d="M19 28h10M25 25l3 3-3 3" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Top handle */}
          <path d="M18 12V9a6 6 0 0112 0v3" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      {showText && (
        <span
          className={`font-display font-bold tracking-tight leading-none ${textSizes[size]}`}
          style={{ color: "var(--text-primary)" }}
        >
          Cajas<span style={{ color: "var(--accent)" }}>Flow</span>
        </span>
      )}
    </div>
  );
}