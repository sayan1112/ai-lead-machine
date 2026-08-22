import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const localEnvPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(localEnvPath)) {
  for (const rawLine of fs.readFileSync(localEnvPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalIndex = line.indexOf("=");
    if (equalIndex <= 0) continue;

    const key = line.slice(0, equalIndex).trim();
    let value = line.slice(equalIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

const databaseUrl = String(process.env.DATABASE_URL || "");

if (!databaseUrl || databaseUrl.startsWith("file:")) {
  console.warn("Skipping PostgreSQL migrations because no production PostgreSQL DATABASE_URL is available in this local build.");
  process.exit(0);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "migrate", "deploy"], { stdio: "inherit" });
process.exit(result.status ?? 1);
