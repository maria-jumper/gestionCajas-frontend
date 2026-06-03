import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const VARS = {
  dark: {
    "--cf-bg":       "#0d0d0d",
    "--cf-card":     "#161616",
    "--cf-card2":    "#111111",
    "--cf-border":   "rgba(255,255,255,0.07)",
    "--cf-border2":  "rgba(255,255,255,0.06)",
    "--cf-sidebar":  "#0d0d0d",
    "--cf-header":   "#0d0d0d",
    "--cf-text1":    "#f0f4f8",
    "--cf-text2":    "#8a9bb0",
    "--cf-text3":    "#4e6070",
    "--cf-input":    "#111111",
    "--cf-hover":    "rgba(255,255,255,0.05)",
    "--cf-shadow":   "rgba(0,0,0,0.5)",
    "--cf-scroll":   "rgba(255,255,255,0.1)",
    "--cf-iconbg":   "#222222",
    "--cf-divider":  "rgba(255,255,255,0.06)",
    "--cf-autofill": "#1a1a1a",
  },
  light: {
    "--cf-bg":       "#f4f5f7",
    "--cf-card":     "#ffffff",
    "--cf-card2":    "#f9fafb",
    "--cf-border":   "rgba(0,0,0,0.08)",
    "--cf-border2":  "rgba(0,0,0,0.07)",
    "--cf-sidebar":  "#1e2027",
    "--cf-header":   "#ffffff",
    "--cf-text1":    "#1a1d23",
    "--cf-text2":    "#5a6478",
    "--cf-text3":    "#9aa5b4",
    "--cf-input":    "#f9fafb",
    "--cf-hover":    "rgba(0,0,0,0.04)",
    "--cf-shadow":   "rgba(0,0,0,0.12)",
    "--cf-scroll":   "rgba(0,0,0,0.15)",
    "--cf-iconbg":   "#f0f1f3",
    "--cf-divider":  "rgba(0,0,0,0.06)",
    "--cf-autofill": "#ffffff",
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

  useEffect(() => {
    applyVars(theme);
    localStorage.setItem("cf-theme", theme);

    // CSS global mínimo — solo elimina el outline azul del navegador,
    // NO toca box-shadow para no romper autofill ni sombras de cards
    let s = document.getElementById("cf-global");
    if (!s) { s = document.createElement("style"); s.id = "cf-global"; document.head.appendChild(s); }
    const bg = theme === "light" ? "#f4f5f7" : "#0d0d0d";
    s.textContent =
      `*:focus{outline:none!important}` +
      `html,body{background:${bg};transition:background 0.3s}`;
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);