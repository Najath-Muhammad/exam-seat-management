import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Phase 21+ — Vite config will be expanded during frontend integration.
export default defineConfig({
  plugins: [react()],
})
