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
    // maxDuration: the homepage advisor relay polls a Mycel run that took 13 to 22 s in testing.
    nitroV2Plugin({ preset: "vercel", vercel: { functions: { maxDuration: 60 } } }),
    viteReact(),
    tailwindcss(),
  ],
});
