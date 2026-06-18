import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files if they exist (local dev)
  // Agregamos '' como prefijo para que lea TODO el .env si es necesario, 
  // o específicamente NEXT_PUBLIC_
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_'])

  // Merge: .env values + process.env values
  const VITE_SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  const VITE_REVALIDATE_TOKEN = env.VITE_REVALIDATE_TOKEN || process.env.VITE_REVALIDATE_TOKEN || ''
  const VITE_OPENROUTER_API_KEY = env.VITE_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || ''
  // Aquí permitimos que lea cualquiera de las dos
  const VITE_SITE_URL = env.VITE_SITE_URL || env.NEXT_PUBLIC_SITE_URL || process.env.VITE_SITE_URL || ''

  return {
    base: '/panel/',
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_REVALIDATE_TOKEN': JSON.stringify(VITE_REVALIDATE_TOKEN),
      'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(VITE_OPENROUTER_API_KEY),
      'import.meta.env.VITE_SITE_URL': JSON.stringify(VITE_SITE_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
