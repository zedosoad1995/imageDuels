import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: "0.0.0.0", // Allow access from other devices
    port: 5173, // Ensure this matches your frontend port
  },
});
