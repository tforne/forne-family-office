import "server-only";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { readServerEnv } from "@/lib/config/server-env";

const bundledDataDir = path.join(process.cwd(), "src", "data");

function getConfiguredDataDir() {
  const configuredDir = readServerEnv("CONTENT_STORAGE_DIR").trim();
  return configuredDir ? path.resolve(configuredDir) : "";
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
  const targetPath = getWritableFilePath(fileName);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf8");
}
