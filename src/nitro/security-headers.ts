import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineNitroModule } from "nitropack/kit";
import { edgeSecurityHeaders } from "../lib/security-headers";

// Runs after the Vercel preset writes .vercel/output/config.json. A continuing
// route is the Build Output equivalent of vercel.json headers: routeRules
// headers omit `continue` and would swallow every request.
export default defineNitroModule({
  name: "security-headers",
  setup(nitro) {
    nitro.hooks.hook("close", async () => {
      const configPath = resolve(nitro.options.output.dir, "config.json");
      const config = JSON.parse(await readFile(configPath, "utf8")) as {
        routes?: Array<Record<string, unknown>>;
      };
      const headerRoute = {
        src: "/(.*)",
        headers: edgeSecurityHeaders(),
        continue: true,
      };
      const routes = Array.isArray(config.routes) ? config.routes : [];
      const already = routes.some(
        (route) =>
          route.continue === true &&
          route.headers != null &&
          typeof route.headers === "object" &&
          "Content-Security-Policy" in route.headers,
      );
      if (!already) routes.unshift(headerRoute);
      config.routes = routes;
      await writeFile(configPath, JSON.stringify(config, null, 2));
    });
  },
});
