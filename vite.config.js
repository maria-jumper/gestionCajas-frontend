import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),VitePWA({
      registerType: 'autoUpdate', // Actualiza la app automáticamente en segundo plano
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Gestión de Inventario y Caja',
        short_name: 'GestiónApp',
        description: 'PWA para el control de inventario, envíos y cierres de caja',
        theme_color: '#4f46e5', // Color de la barra superior (ej: un índigo de Tailwind)
        background_color: '#ffffff',
        display: 'standalone', // Hace que se vea como app nativa, sin barra del navegador
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })],
})
