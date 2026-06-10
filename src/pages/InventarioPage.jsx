import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import * as XLSX from "xlsx";
import { getInventario, getInventarioPorGuia, importarInventario, updateInventario, deleteInventario } from "../api";

function useC() {
  const { isDark } = useTheme();
  return {
    bg:          isDark ? "#0d0d0d"  : "#f4f5f7",
    cardBg:      isDark ? "#161616"  : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    accent:      "#FF6B00",
    accentDim:   "rgba(255,107,0,0.12)",
    textPrimary: isDark ? "#f0f4f8"  : "#1a1d23",
    textSec:     isDark ? "#8a9bb0"  : "#5a6478",
    textGhost:   isDark ? "#4e6070"  : "#9aa5b4",
    inputBg:     isDark ? "#111111"  : "#f9fafb",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    hover:       isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    success:     "#10b981",
    successBg:   "rgba(16,185,129,0.12)",
    danger:      "#ef4444",
    dangerBg:    "rgba(239,68,68,0.1)",
    warning:     "#f59e0b",
    warningBg:   "rgba(245,158,11,0.1)",
    tableBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    isDark,
  };
}

const POR_PAGINA = 10;
const ESTADOS = ["Entregado", "No entregado"];

// Mapeo flexible de columnas del Excel — acepta variaciones de nombre
const COLUMN_MAP = {
  guia:         ["guia","guía","numero de guia","n° guia","n°guia","nro guia","codigo","código","guide","tracking"],
  cliente:      ["cliente","client","nombre cliente","customer","nombre"],
  destinatario: ["destinatario","recipient","destino","destinatario/cliente"],
  direccion:    ["direccion","dirección","address","dir"],
  telefono:     ["telefono","teléfono","tel","phone","celular"],
  valor:        ["valor","value","precio","price","monto","amount","costo","cost"],
  metodo_pago:  ["metodo_pago","método de pago","metodo de pago","pago","payment","forma de pago"],
  estado:       ["estado","status","state"],
  fecha:        ["fecha","date","fecha registro","fecha de registro"],
  ciudad:       ["ciudad","city","municipio"],
  observaciones:["observaciones","obs","notas","notes","comentarios"],
};

function normalizeKey(header) {
  const h = String(header).toLowerCase().trim().replace(/\s+/g," ");
  for (const [key, variants] of Object.entries(COLUMN_MAP)) {
    if (variants.some(v => h.includes(v))) return key;
  }
  return h.replace(/\s+/g,"_");
}

function parseExcelRows(jsonRows) {
  if (!jsonRows?.length) return [];
  return jsonRows
    .filter(row => Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== ""))
    .map((row, i) => {
      const norm = {};
      for (const [k, v] of Object.entries(row)) norm[normalizeKey(k)] = v;
      return {
        id:           norm.id || `xlsx-${Date.now()}-${i}`,
        guia:         String(norm.guia || "").trim(),
        cliente:      String(norm.cliente || "").trim(),
        destinatario: String(norm.destinatario || norm.cliente || "").trim(),
        direccion:    String(norm.direccion || "").trim(),
        telefono:     String(norm.telefono || "").trim(),
        valor:        parseFloat(String(norm.valor || "0").replace(/[^0-9.]/g,"")) || 0,
        metodo_pago:  String(norm.metodo_pago || "").trim(),
        estado:       ESTADOS.includes(norm.estado) ? norm.estado : "No entregado",
        fecha:        norm.fecha ? String(norm.fecha).trim() : new Date().toLocaleDateString("es-CO"),
        ciudad:       String(norm.ciudad || "").trim(),
        observaciones:String(norm.observaciones || "").trim(),
      };
    })
    .filter(r => r.guia);
}

// ── Componentes UI ────────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const C = useC();
  const ok = estado === "Entregado";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"'Barlow',sans-serif", background:ok?C.successBg:C.dangerBg, color:ok?C.success:C.danger, border:`1px solid ${ok?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:ok?C.success:C.danger }}/>
      {estado}
    </span>
  );
}

function StatCard({ icono, label, valor, sub, color }) {
  const C = useC();
  return (
    <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, transition:"background 0.3s, border-color 0.3s" }}>
      <div style={{ width:44, height:44, borderRadius:10, background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{icono}</div>
      <div>
        <p style={{ fontSize:11, color:C.textGhost, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Barlow',sans-serif" }}>{label}</p>
        <p style={{ fontSize:26, fontWeight:900, color:C.textPrimary, margin:0, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1 }}>{typeof valor === "number" ? valor.toLocaleString() : valor}</p>
        <p style={{ fontSize:11, color:C.textGhost, margin:"2px 0 0", fontFamily:"'Barlow',sans-serif" }}>{sub}</p>
      </div>
    </div>
  );
}

function AccionBtn({ children, title, color, onClick }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width:28, height:28, borderRadius:6, border:`1px solid ${color}33`, background:color+"15", color, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", outline:"none" }}
      onMouseEnter={e=>{ e.currentTarget.style.background=color+"30"; e.currentTarget.style.borderColor=color+"66"; }}
      onMouseLeave={e=>{ e.currentTarget.style.background=color+"15"; e.currentTarget.style.borderColor=color+"33"; }}>
      {children}
    </button>
  );
}

function Paginacion({ total, porPagina, pagina, onChange }) {
  const C = useC();
  const totalPags = Math.ceil(total / porPagina);
  if (totalPags <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPags, 5) }, (_, i) => i + 1);
  const Btn = ({ content, onClick, active, disabled }) => (
    <button onClick={onClick} disabled={disabled}
      style={{ width:28, height:28, borderRadius:6, border:`1px solid ${active?C.accent:C.cardBorder}`, background:active?C.accent:"transparent", color:active?"#fff":disabled?C.textGhost:C.textSec, fontSize:12, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow',sans-serif", outline:"none" }}>
      {content}
    </button>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}>
      <Btn content="«" onClick={()=>onChange(1)}         active={false} disabled={pagina===1}/>
      <Btn content="‹" onClick={()=>onChange(pagina-1)}  active={false} disabled={pagina===1}/>
      {pages.map(p=><Btn key={p} content={p} onClick={()=>onChange(p)} active={p===pagina} disabled={false}/>)}
      <Btn content="›" onClick={()=>onChange(pagina+1)}  active={false} disabled={pagina===totalPags}/>
      <Btn content="»" onClick={()=>onChange(totalPags)} active={false} disabled={pagina===totalPags}/>
    </div>
  );
}

// ── Modal importar Excel ──────────────────────────────────────────────────────
function ModalImportExcel({ onImportar, onCerrar }) {
  const C = useC();
  const [archivo,    setArchivo]    = useState(null);
  const [preview,    setPreview]    = useState([]);
  const [columnas,   setColumnas]   = useState([]);
  const [error,      setError]      = useState("");
  const [procesando, setProcesando] = useState(false);

  const leerArchivo = (file) => {
    if (!file) return;
    setArchivo(file); setError(""); setPreview([]); setColumnas([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb    = XLSX.read(e.target.result, { type:"array", cellDates:true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows  = XLSX.utils.sheet_to_json(sheet, { raw:false, defval:"" });
        if (!rows.length) { setError("El archivo está vacío o no tiene datos."); return; }
        setColumnas(Object.keys(rows[0]));
        setPreview(parseExcelRows(rows));
      } catch { setError("No se pudo leer el archivo. Asegúrate de que sea un Excel válido (.xlsx o .xls)."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmar = async () => {
    if (!preview.length) return;
    setProcesando(true);
    await new Promise(r => setTimeout(r, 400));
    onImportar(preview);
    setProcesando(false);
  };

  return (
    <>

    <div style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:680, maxHeight:"90vh", display:"flex", flexDirection:"column", padding:"28px" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexShrink:0 }}>
          <div>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Importar desde Excel</h3>
            <p style={{ fontSize:12, color:C.textGhost, margin:"3px 0 0", fontFamily:"'DM Sans',sans-serif" }}>Sube el archivo Excel con las guías a registrar en inventario</p>
          </div>
          <button onClick={onCerrar} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:24, padding:4, outline:"none" }}>×</button>
        </div>

        {/* Info columnas esperadas */}
        <div style={{ background:C.isDark?"rgba(255,107,0,0.06)":"rgba(255,107,0,0.04)", border:"1px solid rgba(255,107,0,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:16, flexShrink:0 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.accent, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>Columnas detectadas automáticamente</p>
          <p style={{ fontSize:11, color:C.textSec, margin:0, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
            El sistema reconoce: <strong>Guía / N° Guía</strong>, <strong>Cliente</strong>, <strong>Destinatario</strong>, <strong>Dirección</strong>, <strong>Teléfono</strong>, <strong>Valor / Precio</strong>, <strong>Estado</strong>, <strong>Fecha</strong>, <strong>Ciudad</strong>, <strong>Observaciones</strong>. Las columnas no reconocidas se omiten.
          </p>
        </div>

        {/* Zona visual de subida */}
        <div
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }}
          onDragLeave={e => e.currentTarget.style.borderColor = C.cardBorder}
          onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.cardBorder; leerArchivo(e.dataTransfer.files[0]); }}
          style={{ border:`2px dashed ${archivo?C.accent:C.cardBorder}`, borderRadius:10, padding:"24px", textAlign:"center", background:archivo?C.accentDim:C.inputBg, transition:"all 0.2s", flexShrink:0, marginBottom:14 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📊</div>
          {archivo ? (
            <p style={{ fontSize:14, fontWeight:700, color:C.accent, margin:0, fontFamily:"'DM Sans',sans-serif" }}>✓ {archivo.name}</p>
          ) : (
            <>
              <p style={{ fontSize:14, fontWeight:600, color:C.textPrimary, margin:"0 0 8px", fontFamily:"'DM Sans',sans-serif" }}>Arrastra el archivo aquí o</p>
              <div style={{ position:"relative", display:"inline-block" }}>
                <div style={{ padding:"9px 20px", borderRadius:8, background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, letterSpacing:"0.05em", textTransform:"uppercase", pointerEvents:"none" }}>
                  Seleccionar archivo
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e => { if(e.target.files[0]) { leerArchivo(e.target.files[0]); e.target.value=""; } }}
                  style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%", fontSize:0 }}
                />
              </div>
              <p style={{ fontSize:12, color:C.textGhost, margin:"8px 0 0", fontFamily:"'DM Sans',sans-serif" }}>Formatos: .xlsx, .xls, .csv</p>
            </>
          )}
        </div>

        {error && <div style={{ padding:"10px 14px", borderRadius:8, background:C.dangerBg, border:"1px solid rgba(239,68,68,0.25)", color:C.danger, fontSize:13, marginBottom:12, fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>⚠️ {error}</div>}

        {/* Preview */}
        {preview.length > 0 && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexShrink:0 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C.success, margin:0, fontFamily:"'DM Sans',sans-serif" }}>✓ {preview.length} registros detectados — vista previa:</p>
              <span style={{ fontSize:11, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>Columnas en archivo: {columnas.join(", ")}</span>
            </div>
            <div style={{ flex:1, overflow:"auto", border:`1px solid ${C.cardBorder}`, borderRadius:8 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr>
                    {["Guía","Cliente","Valor","Estado","Fecha"].map(h => (
                      <th key={h} style={{ padding:"8px 12px", fontWeight:700, color:C.textGhost, textTransform:"uppercase", fontSize:10, letterSpacing:"0.08em", textAlign:"left", borderBottom:`1px solid ${C.cardBorder}`, background:C.cardBg, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0,8).map((row, i) => (
                    <tr key={i} style={{ borderBottom:`1px solid ${C.tableBorder}` }}>
                      <td style={{ padding:"7px 12px", color:C.accent, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{row.guia}</td>
                      <td style={{ padding:"7px 12px", color:C.textSec, fontFamily:"'DM Sans',sans-serif" }}>{row.cliente||"—"}</td>
                      <td style={{ padding:"7px 12px", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif" }}>${row.valor.toLocaleString()}</td>
                      <td style={{ padding:"7px 12px" }}><EstadoBadge estado={row.estado}/></td>
                      <td style={{ padding:"7px 12px", color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>{row.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 8 && <p style={{ padding:"8px 12px", fontSize:11, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>... y {preview.length - 8} registros más</p>}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, flexShrink:0 }}>
          <button onClick={onCerrar} style={{ flex:1, padding:"11px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
          <button onClick={confirmar} disabled={!preview.length||procesando}
            style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:preview.length?C.accent:"rgba(128,128,128,0.3)", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:preview.length?"pointer":"not-allowed", outline:"none", opacity:procesando?0.7:1 }}
            onMouseEnter={e=>{ if(preview.length&&!procesando) e.currentTarget.style.background="#E55E00"; }}
            onMouseLeave={e=>e.currentTarget.style.background=preview.length?C.accent:"rgba(128,128,128,0.3)"}>
            {procesando ? "Importando..." : `Importar ${preview.length} registros →`}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// ── Modal detalle de guía ─────────────────────────────────────────────────────
function ModalDetalle({ item, onCerrar }) {
  const C = useC();
  const campos = [
    { l:"N° de Guía",     v:item.guia,          accent:true },
    { l:"Cliente",        v:item.cliente },
    { l:"Destinatario",   v:item.destinatario },
    { l:"Dirección",      v:item.direccion },
    { l:"Teléfono",       v:item.telefono },
    { l:"Valor",          v:item.valor ? `$${Number(item.valor).toLocaleString()}` : "—" },
    { l:"Método de pago", v:item.metodo_pago },
    { l:"Ciudad",         v:item.ciudad },
    { l:"Observaciones",  v:item.observaciones },
    { l:"Fecha registro", v:item.fecha },
  ].filter(c => c.v && String(c.v).trim() && c.v !== "0");

  return (
    <div style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:16, width:"100%", maxWidth:440, padding:"28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Detalle de guía</h3>
            <p style={{ fontSize:13, fontWeight:700, color:C.accent, margin:"2px 0 0", fontFamily:"'DM Sans',sans-serif" }}>{item.guia}</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <EstadoBadge estado={item.estado}/>
            <button onClick={onCerrar} style={{ background:"none", border:"none", cursor:"pointer", color:C.textGhost, fontSize:24, padding:4, outline:"none" }}>×</button>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {campos.map(({l, v, accent}) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.tableBorder}` }}>
              <span style={{ fontSize:12, color:C.textGhost, fontFamily:"'DM Sans',sans-serif", textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</span>
              <span style={{ fontSize:13, fontWeight:600, color:accent?C.accent:C.textPrimary, fontFamily:"'DM Sans',sans-serif", textAlign:"right", maxWidth:"55%" }}>{String(v)}</span>
            </div>
          ))}
        </div>
        <button onClick={onCerrar} style={{ width:"100%", marginTop:18, padding:"11px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", outline:"none" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cerrar</button>
      </div>
    </div>
  );
}

// ── Íconos ────────────────────────────────────────────────────────────────────
const IcoEye  = ()=><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoDel  = ()=><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcoSearch=()=><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoExcel=()=><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;

// ══════════════════════════════════════════════════════════════════════════════
export default function InventarioPage({ onVolver }) {
  const { getToken } = useAuth();
  const C = useC();

  const inputStyle = { width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.textPrimary, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" };
  const btnOrange  = { display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"none", background:C.accent, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:800, letterSpacing:"0.05em", textTransform:"uppercase", cursor:"pointer", transition:"background 0.15s", outline:"none", whiteSpace:"nowrap" };
  const thStyle    = { padding:"10px 14px", fontSize:11, fontWeight:700, color:C.textGhost, textTransform:"uppercase", letterSpacing:"0.08em", textAlign:"left", fontFamily:"'DM Sans',sans-serif", borderBottom:`1px solid ${C.tableBorder}`, whiteSpace:"nowrap" };
  const tdStyle    = { padding:"11px 14px", fontSize:13, color:C.textSec, fontFamily:"'DM Sans',sans-serif", borderBottom:`1px solid ${C.tableBorder}`, whiteSpace:"nowrap" };

  const [guias,         setGuias]         = useState([]);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState("Todos");
  const [pagina,        setPagina]        = useState(1);
  const [modalImport,   setModalImport]   = useState(false);
  const [modalDetalle,  setModalDetalle]  = useState(null);
  const [confirmDel,    setConfirmDel]    = useState(null);
  const [toastMsg,      setToastMsg]      = useState("");

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  // Cargar desde backend al montar
  React.useEffect(() => {
    (async () => {
      try {
        const token = getToken?.();
        const data = await getInventario();
          if (Array.isArray(data) && data.length) setGuias(data.map(g => ({ ...g, estado: ESTADOS.includes(g.estado) ? g.estado : "No entregado" })));
      } catch {}
    })();
  }, []);

  const importar = useCallback(async (filas) => {
    const nuevas = filas.filter(f => !guias.find(g => g.guia === f.guia));
    const actualizadas = filas.filter(f => guias.find(g => g.guia === f.guia));
    const merged = guias.map(g => { const upd = actualizadas.find(u => u.guia === g.guia); return upd ? { ...g, ...upd } : g; });
    const final  = [...merged, ...nuevas];
    setGuias(final);
    toast(`✓ ${nuevas.length} nuevas + ${actualizadas.length} actualizadas`);
    setModalImport(false);
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/inventario/importar`, { method:"POST", headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) }, body:JSON.stringify(final) });
    } catch {}
  }, [guias]);

  const eliminar = async (id) => {
    setGuias(p => p.filter(g => g.id !== id));
    setConfirmDel(null);
    try {
      const token = getToken?.();
      await fetch(`${API_URL}/inventario/${id}`, { method:"DELETE", headers:token?{Authorization:`Bearer ${token}`}:{} });
    } catch {}
  };

  // Busqueda y filtros
  const filtradas = guias.filter(g => {
    const q = busqueda.toLowerCase().trim();
    const matchBusq = !q || g.guia?.toLowerCase().includes(q) || g.cliente?.toLowerCase().includes(q) || g.destinatario?.toLowerCase().includes(q) || g.ciudad?.toLowerCase().includes(q) || g.telefono?.includes(q);
    const matchEstado = filtroEstado === "Todos" || g.estado === filtroEstado;
    return matchBusq && matchEstado;
  });
  const slice = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalGuias    = guias.length;
  const totalEntregadas = guias.filter(g => g.estado === "Entregado").length;
  const valorTotal    = guias.reduce((s, g) => s + (Number(g.valor) || 0), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, overflow:"hidden" }}>

      {/* Título */}
      <div style={{ flexShrink:0, marginBottom:16 }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900, color:C.textPrimary, margin:"0 0 2px", textTransform:"uppercase" }}>Inventario de Guías</h1>
        <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Gestiona las guías importadas desde Excel y su estado de entrega.</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, flexShrink:0, marginBottom:16 }}>
        <StatCard icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>} label="Guías registradas" valor={totalGuias} sub="Total en inventario" color={C.accent}/>
        <StatCard icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} label="Entregadas" valor={totalEntregadas} sub={`de ${totalGuias} total`} color={C.success}/>
        <StatCard icono={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} label="Valor total" valor={`$${valorTotal.toLocaleString()}`} sub="En inventario" color="#6366f1"/>
      </div>

      {/* Contenedor tabla */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:12, overflow:"hidden", transition:"background 0.3s" }}>

        {/* Barra herramientas */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:`1px solid ${C.cardBorder}`, flexShrink:0, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.textGhost, display:"flex" }}><IcoSearch/></span>
            <input type="text" placeholder="Buscar por guía, cliente, ciudad, teléfono..." value={busqueda}
              onChange={e=>{ setBusqueda(e.target.value); setPagina(1); }}
              style={{ ...inputStyle, paddingLeft:36 }}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}/>
          </div>
          <select value={filtroEstado} onChange={e=>{ setFiltroEstado(e.target.value); setPagina(1); }}
            style={{ ...inputStyle, width:"auto", minWidth:160 }}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.inputBorder}>
            <option value="Todos">Todos los estados</option>
            {ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}
          </select>
          <button onClick={()=>setModalImport(true)} style={{ ...btnOrange, gap:8 }}
            onMouseEnter={e=>e.currentTarget.style.background="#E55E00"}
            onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
            <IcoExcel/> Importar Excel
          </button>
        </div>

        {/* Tabla */}
        <div style={{ flex:1, overflow:"auto" }}>
          {guias.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:12, padding:"40px" }}>
              <div style={{ fontSize:48 }}>📊</div>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:0, textTransform:"uppercase" }}>Sin guías registradas</h3>
              <p style={{ fontSize:13, color:C.textGhost, margin:0, fontFamily:"'DM Sans',sans-serif", textAlign:"center", maxWidth:360 }}>Importa un archivo Excel con las guías para comenzar a gestionar el inventario.</p>
              <button onClick={()=>setModalImport(true)} style={{ ...btnOrange, marginTop:8 }}
                onMouseEnter={e=>e.currentTarget.style.background="#E55E00"}
                onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                <IcoExcel/> Importar primer archivo
              </button>
            </div>
          ) : filtradas.length === 0 ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:C.textGhost, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>
              No se encontraron guías con esos filtros.
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["N° Guía","Cliente","Destinatario","Valor","Estado","Fecha registro","Acciones"].map(h=>(
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map(row => (
                  <tr key={row.id} style={{ transition:"background 0.12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ ...tdStyle, color:C.accent, fontWeight:700 }}>{row.guia}</td>
                    <td style={tdStyle}>{row.cliente || "—"}</td>
                    <td style={tdStyle}>{row.destinatario || "—"}</td>
                    <td style={{ ...tdStyle, color:C.textPrimary, fontWeight:600 }}>{row.valor ? `$${Number(row.valor).toLocaleString()}` : "—"}</td>
                    <td style={tdStyle}><EstadoBadge estado={row.estado}/></td>
                    <td style={tdStyle}>{row.fecha || "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display:"flex", gap:6 }}>
                        <AccionBtn title="Ver detalle" color={C.accent} onClick={()=>setModalDetalle(row)}><IcoEye/></AccionBtn>
                        <AccionBtn title="Eliminar"    color={C.danger} onClick={()=>setConfirmDel(row)}><IcoDel/></AccionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer paginación */}
        {filtradas.length > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 18px", borderTop:`1px solid ${C.cardBorder}`, flexShrink:0 }}>
            <span style={{ fontSize:12, color:C.textGhost, fontFamily:"'DM Sans',sans-serif" }}>
              Mostrando {Math.min((pagina-1)*POR_PAGINA+1, filtradas.length)}–{Math.min(pagina*POR_PAGINA, filtradas.length)} de {filtradas.length} guías
            </span>
            <Paginacion total={filtradas.length} porPagina={POR_PAGINA} pagina={pagina} onChange={setPagina}/>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalImport  && <ModalImportExcel onImportar={importar} onCerrar={()=>setModalImport(false)}/>}
      {modalDetalle && <ModalDetalle item={modalDetalle} onCerrar={()=>setModalDetalle(null)}/>}

      {confirmDel && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.cardBg, border:`1px solid ${C.cardBorder}`, borderRadius:14, maxWidth:360, width:"100%", padding:"24px" }}>
            <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:C.textPrimary, margin:"0 0 8px", textTransform:"uppercase" }}>¿Eliminar guía?</h3>
            <p style={{ fontSize:13, color:C.textGhost, margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif" }}>Se eliminará <strong style={{ color:C.accent }}>{confirmDel.guia}</strong> del inventario. No se puede deshacer.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"10px", borderRadius:8, border:`1px solid ${C.cardBorder}`, background:"transparent", color:C.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer", outline:"none" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Cancelar</button>
              <button onClick={()=>eliminar(confirmDel.id)} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:C.danger, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", outline:"none", textTransform:"uppercase" }}
                onMouseEnter={e=>e.currentTarget.style.background="#dc2626"} onMouseLeave={e=>e.currentTarget.style.background=C.danger}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position:"fixed", bottom:24, right:24, background:C.success, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 16px rgba(0,0,0,0.3)", zIndex:600 }}>
          {toastMsg}
        </div>
      )}

      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} select option{background:${C.isDark?"#161616":"#fff"};color:${C.isDark?"#f0f4f8":"#1a1d23"};}`}</style>
    </div>
  );
}