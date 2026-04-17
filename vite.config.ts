import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // Define a porta inicial
    strictPort: true, // Força o Vite a USAR APENAS essa porta. Se estiver ocupada, ele dá erro em vez de mudar.
  }
})