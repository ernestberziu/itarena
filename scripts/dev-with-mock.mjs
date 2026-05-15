import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { bootstrapDevDb } from "./dev-bootstrap.mjs";

bootstrapDevDb();

const bin =
  process.platform === "win32"
    ? join(process.cwd(), "node_modules", ".bin", "concurrently.cmd")
    : join(process.cwd(), "node_modules", ".bin", "concurrently");

const r = spawnSync(
  bin,
  [
    "-k",
    "-n",
    "mock,next",
    "-c",
    "cyan,green",
    "node dev-mock/financa5/server.js",
    "next dev",
  ],
  {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  }
);

process.exit(r.status ?? 1);
