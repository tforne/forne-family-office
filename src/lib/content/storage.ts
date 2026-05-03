import "server-only";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { readServerEnv } from "@/lib/config/server-env";

const bundledDataDir = path.join(process.cwd(), "src", "data");
const defaultKvPrefix = "forne-family-office:content";

function getConfiguredDataDir() {
  const configuredDir = readServerEnv("CONTENT_STORAGE_DIR").trim();
  return configuredDir ? path.resolve(configuredDir) : "";
}

function getKvConfig() {
  const url = (readServerEnv("KV_REST_API_URL") || readServerEnv("UPSTASH_REDIS_REST_URL")).trim();
  const token = (readServerEnv("KV_REST_API_TOKEN") || readServerEnv("UPSTASH_REDIS_REST_TOKEN")).trim();
  const prefix = readServerEnv("CONTENT_KV_PREFIX").trim() || defaultKvPrefix;

  if (!url || !token) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), token, prefix };
}

function getKvOriginLabel(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

function isVercelProduction() {
  return process.env.NODE_ENV === "production" && process.env.VERCEL === "1";
}

function getDefaultWritableDataDir() {
  if (process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "forne-family-office-content");
  }

  return bundledDataDir;
}

function getBundledFilePath(fileName: string) {
  return path.join(bundledDataDir, fileName);
}

function getWritableFilePath(fileName: string) {
  const targetDir = getConfiguredDataDir() || getDefaultWritableDataDir();
  return path.join(targetDir, fileName);
}

function getKvKey(fileName: string) {
  const kv = getKvConfig();
  return kv ? `${kv.prefix}:${fileName}` : "";
}

async function sendKvCommand(command: Array<string>) {
  const kv = getKvConfig();

  if (!kv) {
    throw new Error("Vercel KV no está configurado.");
  }

  let response: Response;

  try {
    response = await fetch(kv.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(command),
      cache: "no-store"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de red desconocido";
    throw new Error(
      `No se pudo conectar con Vercel KV en ${getKvOriginLabel(kv.url)}. Revisa KV_REST_API_URL/UPSTASH_REDIS_REST_URL y el acceso al endpoint. Detalle: ${message}`
    );
  }

  const payload = (await response.json().catch(() => ({}))) as { result?: unknown; error?: string };

  if (!response.ok || payload.error) {
    throw new Error(
      payload.error || `Error al acceder a Vercel KV (${response.status}) en ${getKvOriginLabel(kv.url)}.`
    );
  }

  return payload.result;
}

export async function readContentFile(fileName: string) {
  if (getKvConfig()) {
    try {
      const result = await sendKvCommand(["GET", getKvKey(fileName)]);

      if (typeof result === "string" && result.length > 0) {
        return result;
      }
    } catch (error) {
      console.error(`[content] No se pudo leer ${fileName} desde KV. Se usará el contenido incluido en el despliegue.`, error);
    }
  }

  const configuredDir = getConfiguredDataDir();

  if (configuredDir) {
    const configuredPath = path.join(configuredDir, fileName);

    try {
      return await fs.readFile(configuredPath, "utf8");
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== "ENOENT") {
        throw error;
      }
    }
  }

  return fs.readFile(getBundledFilePath(fileName), "utf8");
}

export async function writeContentFile(fileName: string, content: string) {
  if (getKvConfig()) {
    await sendKvCommand(["SET", getKvKey(fileName), content]);
    return;
  }

  if (isVercelProduction()) {
    throw new Error(
      "En Vercel necesitas configurar KV para que este contenido sea persistente. Añade un storage compatible y redepliega."
    );
  }

  const targetPath = getWritableFilePath(fileName);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf8");
}
