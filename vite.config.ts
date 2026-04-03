import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  // CloudBase 静态托管部署路径：/lizard-ledger (仅在生产环境使用)
  base: process.env.NODE_ENV === 'production' ? '/lizard-ledger/' : '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    port: 5173,
  },
})
