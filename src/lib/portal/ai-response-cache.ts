import "server-only";

type CachedAIResponseEntry = {
  response: string;
  expiresAt: number;
};

const defaultTtlMs = 15000;
const responseCache = new Map<string, CachedAIResponseEntry>();

function pruneExpiredEntries(now = Date.now()) {
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }
}

export function getCachedAIResponse(key: string): string | null {
  const now = Date.now();
  pruneExpiredEntries(now);

  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    responseCache.delete(key);
    return null;
  }

  return entry.response;
}

export function setCachedAIResponse(key: string, response: string, ttlMs = defaultTtlMs): void {
  const normalizedKey = key.trim();
  const normalizedResponse = response.trim();

  if (!normalizedKey || !normalizedResponse) return;

  pruneExpiredEntries();
  responseCache.set(normalizedKey, {
    response: normalizedResponse,
    expiresAt: Date.now() + Math.max(1000, ttlMs)
  });
}
