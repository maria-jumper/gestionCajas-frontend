import { createContext, useContext, useEffect, useState } from "react";
 
const ThemeContext = createContext(null);
 
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("cf-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
 
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("cf-theme", theme);
  }, [theme]);
 
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
 
  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}
 
export const useTheme = () => useContext(ThemeContext);