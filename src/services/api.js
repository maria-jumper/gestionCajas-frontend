// 1. Cambia dinámicamente según dónde estés ejecutando tu app
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4000/api'
  : 'https://api-gestion-cajas.onrender.com/api'; // 👈 AQUÍ pégala (asegúrate de mantener el /api al final)

// Función auxiliar para traer el token guardado en el navegador
const obtenerHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }) // Envía el JWT si el usuario ya inició sesión
  };
};

// --- AUTH ---
export const loginUser = (data) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data)
  }).then(res => res.json());

export const registerUser = (data) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());

// --- MOVIMIENTOS ---
export const getMovimientos = () =>
  fetch(`${BASE_URL}/movimientos`, { headers: obtenerHeaders() }).then(res => res.json());

// --- GASTOS ---
export const getGastos = () =>
  fetch(`${BASE_URL}/gastos`, { headers: obtenerHeaders() }).then(res => res.json());

// --- COMPRAS ---
export const getEntregas = () =>
  fetch(`${BASE_URL}/entregas`, { headers: obtenerHeaders() }).then(res => res.json());

// --- ENVIOS ---
export const getEnvios = () =>
  fetch(`${BASE_URL}/envios`, { headers: obtenerHeaders() }).then(res => res.json());

// --- INVENTARIO ---
export const getInventario = () =>
  fetch(`${BASE_URL}/inventario`, { headers: obtenerHeaders() }).then(res => res.json());