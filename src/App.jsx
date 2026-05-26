import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SecretariaDashboard from "./pages/SecretariaDashboard";

export default function App() {
  const { user, logout } = useAuth();
  const [loggedIn, setLoggedIn] = useState(!!user);

  const handleLogin  = () => setLoggedIn(true);
  const handleLogout = () => { logout(); setLoggedIn(false); };

  if (!loggedIn) return <LoginPage onLogin={handleLogin}/>;

  const rol = (user?.rol || user?.role || "").toLowerCase();

  // Admin o administrador → Dashboard completo
  if (rol === "admin" || rol === "administrador")
    return <DashboardPage onLogout={handleLogout}/>;

  // Secretaria (u otro rol) → Dashboard de secretaria con permisos dinámicos
  return <SecretariaDashboard onLogout={handleLogout}/>;
}