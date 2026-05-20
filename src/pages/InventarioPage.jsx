import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  bg:          "#0d0d0d",
  cardBg:      "#161616",
  cardBorder:  "rgba(255,255,255,0.07)",
  accent:      "#FF6B00",
  accentDim:   "rgba(255,107,0,0.18)",
  accentLight: "rgba(255,107,0,0.08)",
  textPrimary: "#f0f4f8",
  textSec:     "#8a9bb0",
  textGhost:   "#4e6070",
  inputBg:     "#111111",
  inputBorder: "rgba(255,255,255,0.1)",
  success:     "#10b981",
  successBg:   "rgba(16,185,129,0.12)",
  danger:      "#ef4444",
  dangerBg:    "rgba(239,68,68,0.1)",
  warning:     "#f59e0b",
  warningBg:   "rgba(245,158,11,0.12)",
  tableBorder: "rgba(255,255,255,0.05)",
};

const card = { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12 };

const btnOrange = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: "9px 18px", borderRadius: 8, border: "none",
  background: C.accent, color: "#fff",
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 13, fontWeight: 800, letterSpacing: "0.05em",
  textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s",
};

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", borderRadius: 8,
  border: `1.5px solid ${C.inputBorder}`,
  background: C.inputBg, color: C.textPrimary,
  fontSize: 14, outline: "none",
  fontFamily: "'Barlow', sans-serif", transition: "border-color 0.2s",
};

const ESTADOS = ["Entregado", "No entregado"];

// ── Datos demo ─────────────────────────────────────────────────────────────────
const DEMO_ENTREGAS = [
  { id: 1, guia: "GUIA-12345", cliente: "Juan Pérez",      valor: 120000, estado: "Entregado",    fecha: "24/05/2024 10:30 AM" },
  { id: 2, guia: "GUIA-12346", cliente: "María Gómez",     valor:  85000, estado: "No entregado", fecha: "24/05/2024 11:15 AM" },
  { id: 3, guia: "GUIA-12347", cliente: "Carlos Ramírez",  valor: 150000, estado: "Entregado",    fecha: "24/05/2024 12:05 PM" },
  { id: 4, guia: "GUIA-12348", cliente: "Laura Martínez",  valor:  95000, estado: "No entregado", fecha: "24/05/2024 01:20 PM" },
  { id: 5, guia: "GUIA-12349", cliente: "Andrés López",    valor: 110000, estado: "No entregado", fecha: "24/05/2024 02:45 PM" },
];

const DEMO_ENVIOS = [
  { id: 1, guia: "ENV-0001", destinatario: "Luis Fernández",  cliente: "Empresa ABC",       valor: 200000, metodo_pago: "Efectivo",    estado: "Entregado",    fecha: "24/05/2024 09:20 AM" },
  { id: 2, guia: "ENV-0002", destinatario: "Ana Torres",      cliente: "Distribuciones XYZ", valor: 175000, metodo_pago: "Transacción", estado: "No entregado", fecha: "24/05/2024 10:10 AM" },
  { id: 3, guia: "ENV-0003", destinatario: "Pedro Castillo",  cliente: "Comercial del Sur",  valor:  90000, metodo_pago: "Efectivo",    estado: "No entregado", fecha: "24/05/2024 11:35 AM" },
];

// ── Badge de estado ────────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const entregado = estado === "Entregado";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
      fontFamily: "'Barlow', sans-serif",
      background: entregado ? C.successBg : C.dangerBg,
      color: entregado ? C.success : C.danger,
      border: `1px solid ${entregado ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: entregado ? C.success : C.danger }} />
      {estado}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icono, label, valor, sub, color }) {
  return (
    <div style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icono}
      </div>
      <div>
        <p style={{ fontSize: 11, color: C.textGhost, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Barlow', sans-serif" }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 900, color: C.textPrimary, margin: 0, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{valor.toLocaleString()}</p>
        <p style={{ fontSize: 11, color: C.textGhost, margin: "2px 0 0", fontFamily: "'Barlow', sans-serif" }}>{sub}</p>
      </div>
    </div>
  );
}

// ── Modal registro / edición ──────────────────────────────────────────────────
function ModalForm({ tipo, item, inventario, onGuardar, onCerrar }) {
  const esEdicion = !!item;
  const [form, setForm] = useState(item ? { ...item } : {
    guia: "", cliente: "", destinatario: "", valor: "", metodo_pago: "Efectivo", estado: "No entregado",
  });
  const [buscandoGuia, setBuscandoGuia] = useState(false);
  const [guiaMsg,      setGuiaMsg]      = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Busca la guía en el inventario para autocompletar precio
  const buscarEnInventario = useCallback((guia) => {
    if (!guia.trim()) return;
    setBuscandoGuia(true);
    setGuiaMsg("");
    setTimeout(() => {
      const encontrado = inventario.find(e => e.guia.toLowerCase() === guia.trim().toLowerCase());
      if (encontrado) {
        set("valor", encontrado.valor);
        setGuiaMsg(`✓ Precio obtenido del inventario: $${Number(encontrado.valor).toLocaleString()}`);
      } else {
        setGuiaMsg("Guía no encontrada en inventario. Ingresa el precio manualmente.");
      }
      setBuscandoGuia(false);
    }, 600);
  }, [inventario]);

  const labelStyle = { fontSize: 11, fontWeight: 700, color: C.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{ ...card, width: "100%", maxWidth: 480, padding: "28px 28px", animation: "fadeInUp 0.25s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent }}>
              {tipo === "entrega"
                ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              }
            </div>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0, textTransform: "uppercase" }}>
                {tipo === "entrega"
                  ? (esEdicion ? "Editar entrega" : "Ingresar entrega")
                  : (esEdicion ? "Editar envío"   : "Registrar envío")}
              </h3>
              {tipo === "entrega" && !esEdicion && (
                <p style={{ fontSize: 11, color: C.textGhost, margin: 0, fontFamily: "'Barlow', sans-serif" }}>
                  El método de pago se registra al momento de entregar
                </p>
              )}
            </div>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: C.textGhost, fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Guía */}
          <div>
            <label style={labelStyle}>N° de Guía</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" placeholder="Ej: GUIA-12345" value={form.guia}
                onChange={e => { set("guia", e.target.value); setGuiaMsg(""); }}
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.inputBorder} />
              {tipo === "entrega" && (
                <button onClick={() => buscarEnInventario(form.guia)} disabled={buscandoGuia}
                  style={{ ...btnOrange, padding: "9px 14px", flexShrink: 0, fontSize: 12, opacity: buscandoGuia ? 0.6 : 1 }}
                  onMouseEnter={e => { if (!buscandoGuia) e.currentTarget.style.background = "#E55E00"; }}
                  onMouseLeave={e => e.currentTarget.style.background = C.accent}>
                  {buscandoGuia ? "..." : "Buscar"}
                </button>
              )}
            </div>
            {guiaMsg && (
              <p style={{ fontSize: 12, color: guiaMsg.startsWith("✓") ? C.success : C.warning, margin: "5px 0 0" }}>{guiaMsg}</p>
            )}
          </div>

          {/* Cliente */}
          <div>
            <label style={labelStyle}>Cliente</label>
            <input type="text" placeholder="Nombre del cliente" value={form.cliente}
              onChange={e => set("cliente", e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.inputBorder} />
          </div>

          {/* Destinatario (solo envíos) */}
          {tipo === "envio" && (
            <div>
              <label style={labelStyle}>Destinatario</label>
              <input type="text" placeholder="Nombre del destinatario" value={form.destinatario || ""}
                onChange={e => set("destinatario", e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.inputBorder} />
            </div>
          )}

          {/* Valor — entrega ocupa fila completa, envío comparte con método de pago */}
          {tipo === "entrega" ? (
            <div>
              <label style={labelStyle}>Valor ($)</label>
              <div style={{ position: "relative" }}>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={form.valor}
                  onChange={e => set("valor", e.target.value)}
                  style={{ ...inputStyle, paddingRight: 32 }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.inputBorder} />
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: C.textGhost, fontSize: 13 }}>$</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Valor ($)</label>
                <div style={{ position: "relative" }}>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.valor}
                    onChange={e => set("valor", e.target.value)}
                    style={{ ...inputStyle, paddingRight: 32 }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.inputBorder} />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: C.textGhost, fontSize: 13 }}>$</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Método de pago</label>
                <select value={form.metodo_pago} onChange={e => set("metodo_pago", e.target.value)}
                  style={{ ...inputStyle }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.inputBorder}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transacción">Transacción</option>
                </select>
              </div>
            </div>
          )}

          {/* Estado */}
          <div>
            <label style={labelStyle}>Estado</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ESTADOS.map(e => (
                <button key={e} onClick={() => set("estado", e)} style={{
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  border: `1.5px solid ${form.estado === e ? (e === "Entregado" ? C.success : C.danger) : C.cardBorder}`,
                  background: form.estado === e ? (e === "Entregado" ? C.successBg : C.dangerBg) : "transparent",
                  color: form.estado === e ? (e === "Entregado" ? C.success : C.danger) : C.textGhost,
                  fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600,
                  transition: "all 0.15s",
                }}>{e}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onCerrar} style={{
            flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${C.cardBorder}`,
            background: "transparent", color: C.textPrimary, fontFamily: "'Barlow', sans-serif",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            Cancelar
          </button>
          <button onClick={() => onGuardar(form)}
            disabled={!form.guia || !form.cliente || !form.valor}
            style={{ ...btnOrange, flex: 2, padding: "11px", fontSize: 14, opacity: (!form.guia || !form.cliente || !form.valor) ? 0.4 : 1 }}
            onMouseEnter={e => { if (form.guia && form.cliente && form.valor) e.currentTarget.style.background = "#E55E00"; }}
            onMouseLeave={e => e.currentTarget.style.background = C.accent}>
            {tipo === "entrega"
              ? (esEdicion ? "Guardar cambios" : "Ingresar entrega")
              : (esEdicion ? "Guardar cambios" : "Registrar envío")} →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Paginación ────────────────────────────────────────────────────────────────
function Paginacion({ total, porPagina, pagina, onChange }) {
  const totalPags = Math.ceil(total / porPagina);
  if (totalPags <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPags, 5) }, (_, i) => i + 1);
  const btnPag = (content, onClick, active, disabled) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: 28, height: 28, borderRadius: 6, border: `1px solid ${active ? C.accent : C.cardBorder}`,
      background: active ? C.accent : "transparent", color: active ? "#fff" : disabled ? C.textGhost : C.textSec,
      fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Barlow', sans-serif",
    }}>{content}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
      {btnPag("«", () => onChange(1), false, pagina === 1)}
      {btnPag("‹", () => onChange(pagina - 1), false, pagina === 1)}
      {pages.map(p => btnPag(p, () => onChange(p), p === pagina, false))}
      {btnPag("›", () => onChange(pagina + 1), false, pagina === totalPags)}
      {btnPag("»", () => onChange(totalPags), false, pagina === totalPags)}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INVENTARIO PAGE
// ══════════════════════════════════════════════════════════════════════════════
const POR_PAGINA = 5;

export default function InventarioPage({ onVolver }) {
  const { getToken } = useAuth();

  const [tab,          setTab]          = useState("entregas");
  const [entregas,     setEntregas]     = useState(DEMO_ENTREGAS);
  const [envios,       setEnvios]       = useState(DEMO_ENVIOS);
  const [modal,        setModal]        = useState(null); // null | { tipo, item? }
  const [filtroBusq,   setFiltroBusq]   = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [paginaE,      setPaginaE]      = useState(1);
  const [paginaEnv,    setPaginaEnv]    = useState(1);
  const [confirmDel,   setConfirmDel]   = useState(null);

  // Stats
  const totalEntregas   = entregas.length;
  const totalEnvios     = envios.length;
  const pendientes      = entregas.filter(e => e.estado === "No entregado").length;
  const entregados      = entregas.filter(e => e.estado === "Entregado").length;

  // Filtrado
  const filtrar = (lista) => lista.filter(item => {
    const q = filtroBusq.toLowerCase();
    const matchBusq = !q || item.guia?.toLowerCase().includes(q) || item.cliente?.toLowerCase().includes(q) || item.destinatario?.toLowerCase().includes(q);
    const matchEstado = filtroEstado === "Todos" || item.estado === filtroEstado;
    return matchBusq && matchEstado;
  });

  const entregasFiltradas = filtrar(entregas);
  const enviosFiltrados   = filtrar(envios);

  const sliceE   = entregasFiltradas.slice((paginaE - 1) * POR_PAGINA,   paginaE   * POR_PAGINA);
  const sliceEnv = enviosFiltrados.slice(  (paginaEnv - 1) * POR_PAGINA, paginaEnv * POR_PAGINA);

  // Guardar (crear o editar)
  const guardar = async (form) => {
    const ahora = new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
    try {
      const token = getToken?.();
      const endpoint = modal.tipo === "entrega" ? "inventario/entregas" : "inventario/envios";
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/${endpoint}${form.id ? `/${form.id}` : ""}`, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
    } catch { /* offline: opera en local */ }

    if (modal.tipo === "entrega") {
      setEntregas(prev => form.id
        ? prev.map(e => e.id === form.id ? { ...form } : e)
        : [...prev, { ...form, id: Date.now(), fecha: ahora }]
      );
    } else {
      setEnvios(prev => form.id
        ? prev.map(e => e.id === form.id ? { ...form } : e)
        : [...prev, { ...form, id: Date.now(), fecha: ahora }]
      );
    }
    setModal(null);
  };

  // Eliminar
  const eliminar = async (tipo, id) => {
    try {
      const token = getToken?.();
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/inventario/${tipo}s/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch { }
    if (tipo === "entrega") setEntregas(prev => prev.filter(e => e.id !== id));
    else setEnvios(prev => prev.filter(e => e.id !== id));
    setConfirmDel(null);
  };

  // ── Íconos ────────────────────────────────────────────────────────────────
  const IcoEdit = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  const IcoDel  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
  const IcoEye  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const IcoSearch = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

  const thStyle = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: C.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", fontFamily: "'Barlow', sans-serif", borderBottom: `1px solid ${C.tableBorder}`, whiteSpace: "nowrap" };
  const tdStyle = { padding: "11px 14px", fontSize: 13, color: C.textSec, fontFamily: "'Barlow', sans-serif", borderBottom: `1px solid ${C.tableBorder}`, whiteSpace: "nowrap" };

  import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// ── CONFIGURACIONES DE DISEÑO Y VARIABLES GLOBALES ───────────────────────────
const C = {
  bg:          "#0d0d0d",
  cardBg:      "#161616",
  cardBorder:  "rgba(255,255,255,0.07)",
  accent:      "#FF6B00",
  accentDim:   "rgba(255,107,0,0.18)",
  textPrimary: "#f0f4f8",
  textSec:     "#8a9bb0",
  textGhost:   "#4e6070",
  inputBg:     "#111111",
  inputBorder: "rgba(255,255,255,0.1)",
  success:     "#10b981",
  successBg:   "rgba(16,185,129,0.12)",
  danger:      "#ef4444",
  dangerBg:    "rgba(239,68,68,0.1)",
  warning:     "#f59e0b",
  warningBg:   "rgba(245,158,11,0.12)",
  tableBorder: "rgba(255,255,255,0.05)",
};

const card = { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12 };
const ESTADOS = ["Entregado", "No entregado"];
const POR_PAGINA = 5;

const btnOrange = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: "9px 18px", borderRadius: 8, border: "none", background: C.accent, color: "#fff",
  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800,
  letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
  transition: "background 0.15s"
};

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8,
  border: `1.5px solid ${C.inputBorder}`, background: C.inputBg, color: C.textPrimary,
  fontSize: 14, outline: "none", fontFamily: "'Barlow', sans-serif",
  transition: "border-color 0.15s"
};

const thStyle = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: C.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", fontFamily: "'Barlow', sans-serif", borderBottom: `1px solid ${C.tableBorder}`, whiteSpace: "nowrap" };
const tdStyle = { padding: "11px 14px", fontSize: 13, color: C.textSec, fontFamily: "'Barlow', sans-serif", borderBottom: `1px solid ${C.tableBorder}`, whiteSpace: "nowrap" };

// ── DATA DEMO INICIAL ────────────────────────────────────────────────────────
const DEMO_ENTREGAS = [
  { id: 1, guia: "GUIA-12345", cliente: "Juan Pérez", valor: 120000, estado: "Entregado", fecha: "24/05/2024 10:30 AM" },
  { id: 2, guia: "GUIA-12346", cliente: "María Gómez", valor: 85000, estado: "No entregado", fecha: "24/05/2024 11:15 AM" },
  { id: 3, guia: "GUIA-12347", cliente: "Carlos Ramírez", valor: 150000, estado: "Entregado", fecha: "24/05/2024 12:05 PM" },
  { id: 4, guia: "GUIA-12348", cliente: "Laura Martínez", valor: 95000, estado: "No entregado", fecha: "24/05/2024 01:20 PM" },
  { id: 5, guia: "GUIA-12349", cliente: "Andrés López", valor: 110000, estado: "No entregado", fecha: "24/05/2024 02:45 PM" },
];

const DEMO_ENVIOS = [
  { id: 1, guia: "ENV-0001", destinatario: "Luis Fernández", cliente: "Empresa ABC", valor: 200000, metodo_pago: "Efectivo", estado: "Entregado", fecha: "24/05/2024 09:20 AM" },
  { id: 2, guia: "ENV-0002", destinatario: "Ana Torres", cliente: "Distribuciones XYZ", valor: 175000, metodo_pago: "Transacción", estado: "No entregado", fecha: "24/05/2024 10:10 AM" },
  { id: 3, guia: "ENV-0003", destinatario: "Pedro Castillo", cliente: "Comercial del Sur", valor: 90000, metodo_pago: "Efectivo", estado: "No entregado", fecha: "24/05/2024 11:35 AM" },
];

// ── PEQUEÑOS COMPONENTES VISUALES ───────────────────────────────────────────
function EstadoBadge({ estado }) {
  const isEntregado = estado === "Entregado";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", fontFamily: "'Barlow', sans-serif",
      background: isEntregado ? C.successBg : C.dangerBg, color: isEntregado ? C.success : C.danger,
      border: `1px solid ${isEntregado ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: isEntregado ? C.success : C.danger }} />
      {estado}
    </span>
  );
}

function StatCard({ icono, label, valor, sub, color }) {
  return (
    <div style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icono}
      </div>
      <div>
        <p style={{ fontSize: 11, color: C.textGhost, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Barlow', sans-serif" }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 900, color: C.textPrimary, margin: 0, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{valor.toLocaleString()}</p>
        <p style={{ fontSize: 11, color: C.textGhost, margin: "2px 0 0", fontFamily: "'Barlow', sans-serif" }}>{sub}</p>
      </div>
    </div>
  );
}

function AccionBtn({ children, title, color, onClick }) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 28, height: 28, borderRadius: 6, border: `1px solid ${color}33`,
      background: color + "15", color, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = color + "30"; e.currentTarget.style.borderColor = color + "66"; }}
      onMouseLeave={e => { e.currentTarget.style.background = color + "15"; e.currentTarget.style.borderColor = color + "33"; }}>
      {children}
    </button>
  );
}

function Paginacion({ total, porPagina, pagina, onChange }) {
  const totalPags = Math.ceil(total / porPagina);
  if (totalPags <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPags, 5) }, (_, i) => i + 1);
  const btnPag = (content, onClick, active, disabled) => (
    <button key={content + "-" + active} onClick={onClick} disabled={disabled} style={{
      width: 28, height: 28, borderRadius: 6, border: `1px solid ${active ? C.accent : C.cardBorder}`,
      background: active ? C.accent : "transparent", color: active ? "#fff" : disabled ? C.textGhost : C.textSec,
      fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow', sans-serif",
    }}>{content}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
      {btnPag("«", () => onChange(1), false, pagina === 1)}
      {btnPag("‹", () => onChange(pagina - 1), false, pagina === 1)}
      {pages.map(p => btnPag(p, () => onChange(p), p === pagina, false))}
      {btnPag("›", () => onChange(pagina + 1), false, pagina === totalPags)}
      {btnPag("»", () => onChange(totalPags), false, pagina === totalPags)}
    </div>
  );
}

// ── COMPONENTE DINÁMICO DE MODAL FORMULARIO ──────────────────────────────────
function ModalForm({ tipo, item, inventario = [], onGuardar, onCerrar }) {
  const esEdicion = !!item;
  const [form, setForm] = useState(item ? { ...item } : {
    guia: "", cliente: "", destinatario: "", valor: "", metodo_pago: "Efectivo", estado: "No entregado"
  });
  const [buscandoGuia, setBuscandoGuia] = useState(false);
  const [guiaMsg, setGuiaMsg] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const buscarEnInventario = useCallback((guia) => {
    if (!guia.trim()) return;
    setBuscandoGuia(true); setGuiaMsg("");
    setTimeout(() => {
      const encontrado = inventario.find(e => e.guia.toLowerCase() === guia.trim().toLowerCase());
      if (encontrado) {
        set("valor", encontrado.valor);
        setGuiaMsg(`✓ Precio indexado: $${Number(encontrado.valor).toLocaleString()}`);
      } else {
        setGuiaMsg("Guía no localizada. Define el precio de manera manual.");
      }
      setBuscandoGuia(false);
    }, 500);
  }, [inventario]);

  const labelStyle = { fontSize: 11, fontWeight: 700, color: C.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ ...card, width: "100%", maxWidth: 480, padding: "28px 28px", animation: "fadeInUp 0.25s ease" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent }}>
              {tipo === "entrega" 
                ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              }
            </div>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0, textTransform: "uppercase" }}>
                {tipo === "entrega" ? (esEdicion ? "Editar entrega" : "Ingresar entrega") : (esEdicion ? "Editar envío" : "Registrar envío")}
              </h3>
              {tipo === "entrega" && !esEdicion && <p style={{ fontSize: 11, color: C.textGhost, margin: 0, fontFamily: "'Barlow', sans-serif" }}>El método de pago se registra al momento de entregar</p>}
            </div>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: C.textGhost, fontSize: 20, padding: 4 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>N° de Guía</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" placeholder="Ej: GUIA-12345" value={form.guia} onChange={e => { set("guia", e.target.value); setGuiaMsg(""); }} style={{ ...inputStyle, flex: 1 }} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder} />
              {tipo === "entrega" && (
                <button onClick={() => buscarEnInventario(form.guia)} disabled={buscandoGuia} style={{ ...btnOrange, padding: "9px 14px", flexShrink: 0, fontSize: 12, opacity: buscandoGuia ? 0.6 : 1 }}>
                  {buscandoGuia ? "..." : "Buscar"}
                </button>
              )}
            </div>
            {guiaMsg && <p style={{ fontSize: 12, color: guiaMsg.startsWith("✓") ? C.success : C.warning, margin: "5px 0 0" }}>{guiaMsg}</p>}
          </div>

          <div>
            <label style={labelStyle}>Cliente</label>
            <input type="text" placeholder="Nombre del cliente" value={form.cliente} onChange={e => set("cliente", e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder} />
          </div>

          {tipo === "envio" && (
            <div>
              <label style={labelStyle}>Destinatario</label>
              <input type="text" placeholder="Nombre del destinatario" value={form.destinatario || ""} onChange={e => set("destinatario", e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder} />
            </div>
          )}

          {tipo === "entrega" ? (
            <div>
              <label style={labelStyle}>Valor ($)</label>
              <div style={{ position: "relative" }}>
                <input type="number" min="0" placeholder="0.00" value={form.valor} onChange={e => set("valor", e.target.value)} style={{ ...inputStyle, paddingRight: 32 }} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder} />
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: C.textGhost, fontSize: 13 }}>$</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Valor ($)</label>
                <div style={{ position: "relative" }}>
                  <input type="number" min="0" placeholder="0.00" value={form.valor} onChange={e => set("valor", e.target.value)} style={{ ...inputStyle, paddingRight: 32 }} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder} />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: C.textGhost, fontSize: 13 }}>$</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Método de pago</label>
                <select value={form.metodo_pago} onChange={e => set("metodo_pago", e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.inputBorder}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transacción">Transacción</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Estado</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ESTADOS.map(e => (
                <button key={e} onClick={() => set("estado", e)} style={{
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  border: `1.5px solid ${form.estado === e ? (e === "Entregado" ? C.success : C.danger) : C.cardBorder}`,
                  background: form.estado === e ? (e === "Entregado" ? C.successBg : C.dangerBg) : "transparent",
                  color: form.estado === e ? (e === "Entregado" ? C.success : C.danger) : C.textGhost,
                  fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600,
                }}>{e}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onCerrar} style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${C.cardBorder}`, background: "transparent", color: C.textPrimary, fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => onGuardar(form)} disabled={!form.guia || !form.cliente || !form.valor} style={{ ...btnOrange, flex: 2, padding: "11px", fontSize: 14, opacity: (!form.guia || !form.cliente || !form.valor) ? 0.4 : 1 }}>
            {tipo === "entrega" ? (esEdicion ? "Guardar cambios" : "Ingresar entrega") : (esEdicion ? "Guardar cambios" : "Registrar envío")} →
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL UNIFICADO
// ══════════════════════════════════════════════════════════════════════════════
export default function InventarioPage({ onVolver }) {
  const { getToken } = useAuth();

  const [tab, setTab] = useState("entregas");
  const [entregas, setEntregas] = useState(DEMO_ENTREGAS);
  const [envios, setEnvios] = useState(DEMO_ENVIOS);
  const [modal, setModal] = useState(null);
  const [filtroBusq, setFiltroBusq] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [paginaE, setPaginaE] = useState(1);
  const [paginaEnv, setPaginaEnv] = useState(1);
  const [confirmDel, setConfirmDel] = useState(null);

  // Totales Reactivos
  const totalEntregas = entregas.length;
  const totalEnvios = envios.length;
  const pendientes = entregas.filter(e => e.estado === "No entregado").length;
  const entregados = entregas.filter(e => e.estado === "Entregado").length;

  // Filtrado de Datos
  const filtrar = (lista) => lista.filter(item => {
    const q = filtroBusq.toLowerCase();
    const matchBusq = !q || item.guia?.toLowerCase().includes(q) || item.cliente?.toLowerCase().includes(q) || item.destinatario?.toLowerCase().includes(q);
    const matchEstado = filtroEstado === "Todos" || item.estado === filtroEstado;
    return matchBusq && matchEstado;
  });

  const entregasFiltradas = filtrar(entregas);
  const enviosFiltrados = filtrar(envios);

  const sliceE = entregasFiltradas.slice((paginaE - 1) * POR_PAGINA, paginaE * POR_PAGINA);
  const sliceEnv = enviosFiltrados.slice((paginaEnv - 1) * POR_PAGINA, paginaEnv * POR_PAGINA);

  // Mutaciones Asíncronas con Fallback Offline Local
  const guardar = async (form) => {
    const ahora = new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
    try {
      const token = getToken?.();
      const endpoint = modal.tipo === "entrega" ? "inventario/entregas" : "inventario/envios";
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/${endpoint}${form.id ? `/${form.id}` : ""}`, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
    } catch { /* Desconectado: Fallback automático local */ }

    if (modal.tipo === "entrega") {
      setEntregas(prev => form.id ? prev.map(e => e.id === form.id ? { ...form } : e) : [...prev, { ...form, id: Date.now(), fecha: ahora }]);
    } else {
      setEnvios(prev => form.id ? prev.map(e => e.id === form.id ? { ...form } : e) : [...prev, { ...form, id: Date.now(), fecha: ahora }]);
    }
    setModal(null);
  };

  const eliminar = async (tipo, id) => {
    try {
      const token = getToken?.();
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/inventario/${tipo}s/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch { }
    if (tipo === "entrega") setEntregas(prev => prev.filter(e => e.id !== id));
    else setEnvios(prev => prev.filter(e => e.id !== id));
    setConfirmDel(null);
  };

  const IcoEdit = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  const IcoDel  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
  const IcoSearch = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" }}>
      
      {/* Título de Sección */}
      <div style={{ flexShrink: 0, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: C.textPrimary, margin: "0 0 2px", textTransform: "uppercase" }}>Inventario</h1>
          <p style={{ fontSize: 13, color: C.textGhost, margin: 0 }}>Gestiona todas las entregas y envíos del sistema.</p>
        </div>
        {onVolver && <button onClick={onVolver} style={{ ...btnOrange, background: "transparent", border: `1px solid ${C.cardBorder}`, color: C.textSec }}>Volver</button>}
      </div>

      {/* Grid Global de KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, flexShrink: 0, marginBottom: 16 }}>
        <StatCard icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>} label="Entregas registradas" valor={totalEntregas} sub="Total de entregas" color={C.accent} />
        <StatCard icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16"/></svg>} label="Envíos registrados" valor={totalEnvios} sub="Total de envíos" color="#6366f1" />
        <StatCard icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} label="Pendientes" valor={pendientes} sub="Por entregar" color={C.warning} />
        <StatCard icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/></svg>} label="Entregados" valor={entregados} sub="Completados" color={C.success} />
      </div>

      {/* Bloque Contenedor Central */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, ...card, overflow: "hidden" }}>
        
        {/* Navegación por Pestañas */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.cardBorder}`, padding: "0 20px", flexShrink: 0 }}>
          {["entregas", "envios", "historial"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "13px 16px", background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700, fontFamily: "'Barlow', sans-serif",
              color: tab === t ? C.accent : C.textGhost, textTransform: "uppercase", letterSpacing: "0.06em",
              borderBottom: `2px solid ${tab === t ? C.accent : "transparent"}`, marginBottom: -1,
            }}>
              {t === "entregas" ? "Entregas" : t === "envios" ? "Envíos" : "Historial"}
            </button>
          ))}
        </div>

        {/* Workspace Interno */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, padding: "16px 20px", overflow: "hidden" }}>
          {tab !== "historial" && (
            <>
              {/* Controles Operacionales */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textGhost, display: "flex" }}><IcoSearch /></span>
                  <input type="text" placeholder="Buscar por guía, cliente..." value={filtroBusq} onChange={e => { setFiltroBusq(e.target.value); setPaginaE(1); setPaginaEnv(1); }} style={{ ...inputStyle, paddingLeft: 36, fontSize: 13 }} />
                </div>
                <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPaginaE(1); setPaginaEnv(1); }} style={{ ...inputStyle, width: "auto", minWidth: 150, fontSize: 13 }}>
                  <option value="Todos">Todos los estados</option>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <button onClick={() => setModal({ tipo: tab === "entregas" ? "entrega" : "envio" })} style={btnOrange}>
                  + {tab === "entregas" ? "Ingresar entrega" : "Registrar envío"}
                </button>
              </div>

              {/* Tabla: Pestaña Entregas */}
              {tab === "entregas" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <div style={{ flex: 1, overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{["Guía", "Cliente", "Valor", "Estado", "Fecha de registro", "Acciones"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {sliceE.length === 0 ? (
                          <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: "28px", color: C.textGhost }}>No se encontraron registros</td></tr>
                        ) : sliceE.map(row => (
                          <tr key={row.id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ ...tdStyle, color: C.accent, fontWeight: 700 }}>{row.guia}</td>
                            <td style={tdStyle}>{row.cliente}</td>
                            <td style={{ ...tdStyle, color: C.textPrimary, fontWeight: 600 }}>${Number(row.valor).toLocaleString()}</td>
                            <td style={tdStyle}><EstadoBadge estado={row.estado} /></td>
                            <td style={tdStyle}>{row.fecha}</td>
                            <td style={tdStyle}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <AccionBtn title="Editar" color={C.accent} onClick={() => setModal({ tipo: "entrega", item: row })}><IcoEdit /></AccionBtn>
                                <AccionBtn title="Eliminar" color={C.danger} onClick={() => setConfirmDel({ tipo: "entrega", id: row.id, guia: row.guia })}><IcoDel /></AccionBtn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: C.textGhost, fontFamily: "'Barlow', sans-serif" }}>
                      Mostrando {Math.min((paginaE - 1) * POR_PAGINA + 1, entregasFiltradas.length)}–{Math.min(paginaE * POR_PAGINA, entregasFiltradas.length)} de {entregasFiltradas.length} entregas
                    </span>
                    <Paginacion total={entregasFiltradas.length} porPagina={POR_PAGINA} pagina={paginaE} onChange={setPaginaE} />
                  </div>
                </div>
              )}

              {/* Tabla: Pestaña Envíos */}
              {tab === "envios" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <div style={{ flex: 1, overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{["Guía", "Destinatario", "Cliente", "Valor", "Método de pago", "Estado", "Fecha de registro", "Acciones"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {sliceEnv.length === 0 ? (
                          <tr><td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: "28px", color: C.textGhost }}>No se encontraron registros</td></tr>
                        ) : sliceEnv.map(row => (
                          <tr key={row.id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ ...tdStyle, color: C.accent, fontWeight: 700 }}>{row.guia}</td>
                            <td style={tdStyle}>{row.destinatario}</td>
                            <td style={tdStyle}>{row.cliente}</td>
                            <td style={{ ...tdStyle, color: C.textPrimary, fontWeight: 600 }}>${Number(row.valor).toLocaleString()}</td>
                            <td style={tdStyle}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.metodo_pago === "Efectivo" ? C.success : "#6366f1" }} />
                                {row.metodo_pago}
                              </span>
                            </td>
                            <td style={tdStyle}><EstadoBadge estado={row.estado} /></td>
                            <td style={tdStyle}>{row.fecha}</td>
                            <td style={tdStyle}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <AccionBtn title="Editar" color={C.accent} onClick={() => setModal({ tipo: "envio", item: row })}><IcoEdit /></AccionBtn>
                                <AccionBtn title="Eliminar" color={C.danger} onClick={() => setConfirmDel({ tipo: "envio", id: row.id, guia: row.guia })}><IcoDel /></AccionBtn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: C.textGhost, fontFamily: "'Barlow', sans-serif" }}>
                      Mostrando {Math.min((paginaEnv - 1) * POR_PAGINA + 1, enviosFiltrados.length)}–{Math.min(paginaEnv * POR_PAGINA, enviosFiltrados.length)} de {enviosFiltrados.length} envíos
                    </span>
                    <Paginacion total={enviosFiltrados.length} porPagina={POR_PAGINA} pagina={paginaEnv} onChange={setPaginaEnv} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tabla: Historial Unificado */}
          {tab === "historial" && (
            <div style={{ flex: 1, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Tipo", "Guía", "Cliente/Origen", "Valor", "Estado", "Método de pago", "Fecha"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[...entregas.map(e => ({ ...e, tipo: "Entrega" })), ...envios.map(e => ({ ...e, tipo: "Envío" }))]
                    .sort((a, b) => b.id - a.id)
                    .map(row => (
                      <tr key={`${row.tipo}-${row.id}`} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: row.tipo === "Entrega" ? C.accentDim : "rgba(99,102,241,0.18)", color: row.tipo === "Entrega" ? C.accent : "#818cf8" }}>
                            {row.tipo}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: C.accent, fontWeight: 700 }}>{row.guia}</td>
                        <td style={tdStyle}>{row.cliente}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: C.textPrimary }}>${Number(row.valor).toLocaleString()}</td>
                        <td style={tdStyle}><EstadoBadge estado={row.estado} /></td>
                        <td style={tdStyle}>
                          {row.metodo_pago ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.metodo_pago === "Efectivo" ? C.success : "#6366f1" }} />
                              {row.metodo_pago}
                            </span>
                          ) : <span style={{ color: C.textGhost, fontSize: 12 }}>—</span>}
                        </td>
                        <td style={tdStyle}>{row.fecha}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Flujo de Capas Modales */}
      {modal && <ModalForm tipo={modal.tipo} item={modal.item || null} inventario={tab === "entregas" ? entregas : envios} onGuardar={guardar} onCerrar={() => setModal(null)} />}

      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ ...card, maxWidth: 360, width: "100%", padding: "24px", animation: "fadeInUp 0.2s ease" }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: C.textPrimary, margin: "0 0 8px", textTransform: "uppercase" }}>¿Eliminar registro?</h3>
            <p style={{ fontSize: 13, color: C.textGhost, margin: "0 0 20px" }}>Se eliminará la {confirmDel.tipo} con guía <strong style={{ color: C.accent }}>{confirmDel.guia}</strong>. Esta acción no se puede deshacer.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.cardBorder}`, background: "transparent", color: C.textPrimary, fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => eliminar(confirmDel.tipo, confirmDel.id)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.danger, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
}