import { spawnSync } from "node:child_process";
import { bootstrapDevDb } from "./dev-bootstrap.mjs";

bootstrapDevDb();

const r = spawnSync("next", ["dev"], {
  stdio: "inherit",
  cwd: process.cwd(),
  env: process.env,
  shell: process.platform === "win32",
});
process.exit(r.status ?? 1);
