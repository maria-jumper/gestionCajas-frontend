import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SecretariaDashboard from "./pages/SecretariaDashboard";

export default function App() {
  // Lee directamente del contexto — se re-renderiza automáticamente al hacer login/logout
  const { user, logout } = useAuth();

  const handleLogout = () => logout();

  // Sin usuario → login
  if (!user) return <LoginPage />;

  const rol = (user?.rol || user?.role || "").toLowerCase();

  if (rol === "admin" || rol === "administrador")
    return <DashboardPage onLogout={handleLogout} />;

  return <SecretariaDashboard onLogout={handleLogout} />;
}