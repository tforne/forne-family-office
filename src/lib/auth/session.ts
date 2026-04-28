import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
export const sessionCookieName = "ffo_portal_session";

export interface PortalSession {
  email?: string;
  externalUserId?: string;
  provider?: "demo" | "entra";
  isAuthenticated: boolean;
}

function normalizeSession(raw: unknown): Omit<PortalSession, "isAuthenticated"> | null {
  if (!raw || typeof raw !== "object") return null;

  const session = raw as Record<string, unknown>;
  const provider = session.provider;

  if (provider !== "demo" && provider !== "entra") return null;
  if (provider === "demo" && !env.useDemoLogin) return null;

  const email = typeof session.email === "string" ? session.email : undefined;
  const externalUserId = typeof session.externalUserId === "string" ? session.externalUserId : undefined;

  if (!email && !externalUserId) return null;

  return { email, externalUserId, provider };
}

export async function getPortalSession(): Promise<PortalSession> {
  const store = await cookies();
  const value = store.get(sessionCookieName)?.value;
  if (!value) return { isAuthenticated: false };

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    const session = normalizeSession(parsed);
    return session ? { ...session, isAuthenticated: true } : { isAuthenticated: false };
  } catch {
    return { isAuthenticated: false };
  }
}

export function encodeSession(session: Omit<PortalSession, "isAuthenticated">) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}
