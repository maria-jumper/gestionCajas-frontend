import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const VARS = {
  dark: {
    "--cf-bg":          "#0d0d0d",
    "--cf-bg2":         "#111111",
    "--cf-bg3":         "#0a0a0a",
    "--cf-card":        "#111111",
    "--cf-border":      "rgba(255,255,255,0.07)",
    "--cf-border2":     "rgba(255,255,255,0.06)",
    "--cf-sidebar":     "#0d0d0d",
    "--cf-header":      "#0d0d0d",
    "--cf-text1":       "#f0f4f8",
    "--cf-text2":       "#8a9bb0",
    "--cf-text3":       "#4e6070",
    "--cf-nav":         "rgba(255,255,255,0.45)",
    "--cf-input":       "#0a0a0a",
    "--cf-hover":       "rgba(255,255,255,0.06)",
    "--cf-shadow":      "rgba(0,0,0,0.5)",
    "--cf-scroll":      "rgba(255,255,255,0.1)",
  },
  light: {
    "--cf-bg":          "#f0f2f5",
    "--cf-bg2":         "#ffffff",
    "--cf-bg3":         "#f5f5f5",
    "--cf-card":        "#ffffff",
    "--cf-border":      "rgba(0,0,0,0.09)",
    "--cf-border2":     "rgba(0,0,0,0.07)",
    "--cf-sidebar":     "#1a1a1a",
    "--cf-header":      "#ffffff",
    "--cf-text1":       "#111111",
    "--cf-text2":       "#4a5568",
    "--cf-text3":       "#9aa3ae",
    "--cf-nav":         "rgba(255,255,255,0.6)",
    "--cf-input":       "#f9f9f9",
    "--cf-hover":       "rgba(0,0,0,0.04)",
    "--cf-shadow":      "rgba(0,0,0,0.15)",
    "--cf-scroll":      "rgba(0,0,0,0.15)",
  },
};

function applyVars(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark",  theme === "dark");
  root.classList.toggle("light", theme === "light");
  Object.entries(VARS[theme] || VARS.dark).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("cf-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Aplicar inmediatamente al montar y cada vez que cambie
  useEffect(() => {
    applyVars(theme);
    localStorage.setItem("cf-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);