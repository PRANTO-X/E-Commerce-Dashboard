import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backendOrigin = env.VITE_BACKEND_ORIGIN || "https://yoyo-ecom-production-88e8.up.railway.app"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // Proxies API calls server-side so the browser sees same-origin requests,
      // sidestepping the backend's CORS config (which doesn't allowlist localhost).
      proxy: {
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
