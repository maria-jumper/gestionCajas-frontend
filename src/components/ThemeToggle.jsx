import { useTheme } from "../context/ThemeContext";
 
export default function ThemeToggle({ className = "" }) {
  const { isDark, toggle } = useTheme();
 
  return (
    <button
      onClick={toggle}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${className}`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1a3a5c, #2558a0)"
          : "linear-gradient(135deg, #a8d4ff, #5badff)",
      }}
      aria-label="Toggle theme"
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow"
        style={{
          transform: isDark ? "translateX(0)" : "translateX(24px)",
          background: isDark ? "#020f1e" : "#fff",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}