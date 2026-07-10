import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vercel deployment: no Cloudflare plugin, no custom server entry.
// Vercel's TanStack Start framework preset consumes the default build output.
export default defineConfig({
  plugins: [tsConfigPaths(), tanstackStart(), viteReact(), tailwindcss()],
});
