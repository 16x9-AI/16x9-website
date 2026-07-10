import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vercel deployment: the Nitro plugin with the vercel preset emits the
// Build Output API structure (.vercel/output) that Vercel serves (SSR function + static).
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    nitroV2Plugin({ preset: "vercel" }),
    viteReact(),
    tailwindcss(),
  ],
});
