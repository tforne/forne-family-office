import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { readServerEnv } from "@/lib/config/server-env";

const bundledDataDir = path.join(process.cwd(), "src", "data");

function getConfiguredDataDir() {
  const configuredDir = readServerEnv("CONTENT_STORAGE_DIR").trim();
  return configuredDir ? path.resolve(configuredDir) : "";
}

function getBundledFilePath(fileName: string) {
  return path.join(bundledDataDir, fileName);
}

function getWritableFilePath(fileName: string) {
  const configuredDir = getConfiguredDataDir();
  return configuredDir ? path.join(configuredDir, fileName) : getBundledFilePath(fileName);
}

export async function readContentFile(fileName: string) {
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
  const configuredDir = getConfiguredDataDir();

  if (configuredDir) {
    await fs.mkdir(configuredDir, { recursive: true });
    const configuredPath = path.join(configuredDir, fileName);
    await fs.writeFile(configuredPath, content, "utf8");
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "La edición de contenido no está configurada en producción. Define CONTENT_STORAGE_DIR en una ruta escribible o usa un almacenamiento persistente."
    );
  }

  await fs.writeFile(getWritableFilePath(fileName), content, "utf8");
}
