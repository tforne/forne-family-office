import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let localEnvCache: Record<string, string> | null = null;

function parseEnvFile(content: string) {
  const values: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    values[key] = value;
  }

  return values;
}

function getLocalEnvValues() {
  if (localEnvCache) {
    return localEnvCache;
  }

  const filePath = path.join(process.cwd(), ".env.local");

  if (!existsSync(filePath)) {
    localEnvCache = {};
    return localEnvCache;
  }

  localEnvCache = parseEnvFile(readFileSync(filePath, "utf8"));
  return localEnvCache;
}

export function readServerEnv(name: string) {
  const localValue = getLocalEnvValues()[name];
  if (typeof localValue === "string" && localValue.length > 0) {
    return localValue;
  }

  return process.env[name] || "";
}
