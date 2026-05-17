import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 👉 dynamic config (env support)
export default ({ mode }) => {
  // ================= LOAD ENV =================
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [
      react(),       // ✅ React plugin
      tailwindcss()  // ✅ Tailwind plugin
    ],

    server: {
      open: true, // ✅ auto open browser

      // ================= PROXY (DEV ONLY) =================
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3000", // ✅ fallback
          changeOrigin: true,
          secure: false
        }
      }
    }
  });
};