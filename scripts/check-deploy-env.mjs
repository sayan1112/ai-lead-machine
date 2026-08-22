import fs from "node:fs";
import path from "node:path";

function loadDotEnvIfPresent() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalIndex = line.indexOf("=");
    if (equalIndex <= 0) continue;

    const key = line.slice(0, equalIndex).trim();
    let value = line.slice(equalIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnvIfPresent();

const isNetlifyOrCi = process.env.NETLIFY === "true" || process.env.CI === "true";
const strictMode = process.argv.includes("--strict") || isNetlifyOrCi;

const required = ["DATABASE_URL", "NEXTAUTH_URL"];

const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!authSecret || !String(authSecret).trim()) {
  missing.push("AUTH_SECRET (or NEXTAUTH_SECRET)");
}

if (missing.length > 0) {
  if (!strictMode) {
    console.warn("\nDeployment environment check warning (non-strict mode).\n");
    console.warn("Missing environment variables:");
    for (const key of missing) {
      console.warn(`- ${key}`);
    }
    console.warn("\nContinuing because this is a local/non-CI build.\n");
    process.exit(0);
  }

  console.error("\nDeployment environment check failed.\n");
  console.error("Missing required environment variables:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  console.error("\nSet these values in Netlify Site settings > Environment variables.\n");
  process.exit(1);
}

if (process.env.NEXTAUTH_URL && !/^https?:\/\//i.test(process.env.NEXTAUTH_URL)) {
  console.error("\nDeployment environment check failed.\n");
  console.error("NEXTAUTH_URL must start with http:// or https://");
  process.exit(1);
}

console.log("Deployment environment check passed.");
