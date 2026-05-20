import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Ajusta la ruta si es necesario

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(false);

    if (!username.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      // Aquí asumo que tu función login recibe estos parámetros, ajústalo a tu backend
      await login(username, password); 
    } catch (err) {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0d0d0d", // Mismo fondo negro profundo que el Dashboard
      fontFamily: "'DM Sans', sans-serif",
      padding: "20px", // Margen de seguridad para que en móvil no toque los bordes físicos
      boxSizing: "border-box"
    }}>
      
      {/* Tarjeta del Login */}
      <div style={{
        width: "100%",
        maxWidth: "400px", // En PC no crece más de esto, en celular ocupa el 100% disponible
        background: "#111111", // Fondo de tarjeta gris oscuro
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "16px",
        padding: "32px 24px",
        boxSizing: "border-box",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
      }}>
        
        {/* LOGO E IDENTIDAD */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          {/* Tu rayo naranja icónico */}
          <div style={{ 
            width: "50px", 
            height: "50px", 
            background: "#FF6B00", 
            borderRadius: "12px", 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center",
            marginBottom: "12px"
          }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#fff"/>
            </svg>
          </div>
          
          <h2 style={{ 
            fontFamily: "'Barlow Condensed', sans-serif", 
            fontSize: "28px", 
            fontWeight: 900, 
            color: "#ffffff", 
            margin: "0 0 4px", 
            letterSpacing: "0.04em",
            textTransform: "uppercase" 
          }}>
            INTER <span style={{ color: "#FF6B00" }}>RAPIDÍSIMO</span>
          </h2>
          <p style={{ fontSize: "13px", color: "#8a9bb0", margin: 0 }}>
            Control de Flujo de Cajas e Inventario
          </p>
        </div>

        {/* MENSAL DE ERROR */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            color: "#ef4444",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Input de Usuario */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8a9bb0", marginBottom: "6px" }}>
              Usuario / Correo
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: admin_bogota"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1.5px solid rgba(255, 255, 255, 0.09)",
                background: "#0a0a0a",
                color: "#f0f4f8",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Input de Contraseña */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8a9bb0", marginBottom: "6px" }}>
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1.5px solid rgba(255, 255, 255, 0.09)",
                background: "#0a0a0a",
                color: "#f0f4f8",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Botón de Ingreso */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: loading ? "#cc5500" : "#FF6B00",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginTop: "8px"
            }}
          >
            {loading ? "Autenticando..." : "Ingresar al Sistema →"}
          </button>
        </form>

      </div>
    </div>
  );
}