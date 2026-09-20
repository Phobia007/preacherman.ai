import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("../../", import.meta.url));
const install = process.argv.includes("--install");
const packages = ["packages/preacherman-presentation-runtime", "packages/preacherman-surface-skin", "packages/preacherman-avatar-renderer", "apps/preacherman-demo-host"];
for (const part of packages) {
  const args = install ? ["ci", "--no-audit", "--no-fund"] : ["run", part.startsWith("apps/") ? "build:web" : "build"];
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, { cwd: resolve(root, part), stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
