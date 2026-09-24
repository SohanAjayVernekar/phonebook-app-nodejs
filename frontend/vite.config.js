import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    /* Reachable from LAN/tunnel clients (ngrok forwards to this
       machine). localhost / 127.0.0.1 keep working — they are
       always allowed by Vite's host check. */
    host: "0.0.0.0",

    port: 5173,

    /* Host protection stays ON (never `true`). A leading "." allows
       every subdomain, so a new ngrok URL — e.g.
       anything.ngrok-free.dev — works without editing this file.
       Other hosts can be added per-run instead of editing here:
         VITE_ALLOWED_HOSTS="foo.example,bar.ngrok.app" npm run dev */
    allowedHosts: [
      ".ngrok-free.dev",
      ...(process.env.VITE_ALLOWED_HOSTS ?? "")
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean),
    ],

    // Dev-only proxy so `npm run dev` can call the .NET
    // backend with the same relative URLs used in production.
    // Single-port setup: Nginx serves /api/* on :80 in production,
    // so dev proxies there too (Vite -> Nginx :80 -> backend).
    // Point VITE_API_TARGET at a locally-run backend if needed:
    //   VITE_API_TARGET="http://localhost:8000" npm run dev
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:80",
        changeOrigin: true,
      },
    },
  },
});
