import "server-only";
import { readContentFile, writeContentFile } from "@/lib/content/storage";

export type ChatSettings = {
  enabled: boolean;
  updatedAt: string;
};

const defaultSettings: ChatSettings = {
  enabled: false,
  updatedAt: ""
};

function normalizeSettings(value: Partial<ChatSettings> | null | undefined): ChatSettings {
  return {
    enabled: value?.enabled === true,
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : ""
  };
}

export async function getChatSettings() {
  try {
    const raw = await readContentFile("chat-settings.json");
    return normalizeSettings(JSON.parse(raw) as Partial<ChatSettings>);
  } catch {
    return defaultSettings;
  }
}

export async function saveChatSettings(settings: Partial<ChatSettings>) {
  const normalized = normalizeSettings({
    ...settings,
    updatedAt: new Date().toISOString()
  });

  await writeContentFile("chat-settings.json", `${JSON.stringify(normalized, null, 2)}\n`);
  return normalized;
}
