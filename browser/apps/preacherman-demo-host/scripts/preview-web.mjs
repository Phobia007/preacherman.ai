import { preview } from "vite";
import { createPreachermanServer } from "../server/preachermanServer.mjs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const app = fileURLToPath(new URL("../", import.meta.url));
const root = resolve(app, "../..");
const port = Number(process.env.PREACHERMAN_WEB_PORT || 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PREACHERMAN_WEB_PORT must be a valid TCP port.");
const service = createPreachermanServer({ env: {
  ...process.env, PREACHERMAN_DATA_DIR: resolve(root, ".runtime-tmp/browser-preview"),
  PREACHERMAN_SERVICE_PORT: "8791", PREACHERMAN_PREVIEW_ORIGINS: `http://localhost:${port},http://127.0.0.1:${port}`,
  PREACHERMAN_EXECUTION_ENABLED: "false",
} });
let site, closing = false;
async function close() {
  if (closing) return;
  closing = true;
  const timeout = setTimeout(() => process.exit(1), 5000).unref();
  await service.close();
  if (site) { site.httpServer.closeAllConnections(); await new Promise(resolve => site.httpServer.close(resolve)); }
  clearTimeout(timeout);
}
try {
  await service.listen();
  site = await preview({ configFile: false, root: app, build: { outDir: resolve(root, "web-dist") },
    preview: { host: "127.0.0.1", port, strictPort: true,
      proxy: { "/api": { target: "http://127.0.0.1:8791", ws: true } } },
    plugins: [{ name: "preacherman-browser-preview", configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url !== "/__preacherman_preview") return next();
        response.setHeader("Content-Type", "application/json"); response.setHeader("Cache-Control", "no-store");
        response.end(JSON.stringify({ app: "preacherman-browser", root, pid: process.pid }));
      });
    } }],
  });
  console.log(`Preacherman Web: http://127.0.0.1:${port} (isolated local API: 8791)`);
  process.on("SIGINT", () => { void close(); }); process.on("SIGTERM", () => { void close(); });
} catch (error) { console.error(error); await close(); process.exitCode = 1; }
