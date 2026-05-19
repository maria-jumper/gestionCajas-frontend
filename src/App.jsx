import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SecretariaDashboard from "./pages/SecretariaDashboard";
import MensajeroDashboard from "./pages/MensajeroDashboard";

export default function App() {
  // Traemos 'user' y 'logout' de tu contexto global
  const { user, logout } = useAuth();

  // 1. Si no hay usuario en el contexto, se muestra el Login directamente
  if (!user) {
    return <LoginPage />;
  }

  // 2. Extraemos el rol de forma segura convirtiéndolo a minúsculas
  const rol = (user?.rol || user?.role || "").toLowerCase();

  // 3. Enrutamiento por roles
  if (rol === "admin" || rol === "administrador") {
    return <DashboardPage onLogout={logout} />;
  }

  if (rol === "mensajero") {
    return <MensajeroDashboard onLogout={logout} />;
  }

  // Secretaria u otros roles por defecto
  return <SecretariaDashboard onLogout={logout} />;
}