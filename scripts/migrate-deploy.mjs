import { spawnSync } from "node:child_process";

const databaseUrl = String(process.env.DATABASE_URL || "");

if (!databaseUrl || databaseUrl.startsWith("file:")) {
  console.warn("Skipping PostgreSQL migrations because no production PostgreSQL DATABASE_URL is available in this local build.");
  process.exit(0);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "migrate", "deploy"], { stdio: "inherit" });
process.exit(result.status ?? 1);
