import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Reemplaza 'NOMBRE_DEL_REPOSITORIO' con el nombre de tu repo en GitHub.
  base: '/app_dolce/' 
})