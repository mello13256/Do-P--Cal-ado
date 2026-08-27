import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Endereço em que o site será servido. Fica "/" na Netlify, na Vercel e em
  // domínio próprio; no GitHub Pages o build passa "/Do-P--Cal-ado/".
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
