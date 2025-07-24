import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4004,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../LetsGo-Server/cert/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../LetsGo-Server/cert/localhost.pem")),
    },
    proxy: {
      "/api": {
        target: "https://localhost:5443", // your backend HTTPS URL and port
        secure: false, // because using self-signed certs
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
