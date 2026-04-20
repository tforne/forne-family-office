import { cookies } from "next/headers";
export const sessionCookieName = "ffo_portal_session";

export interface PortalSession {
  email?: string;
  externalUserId?: string;
  provider?: "demo" | "entra";
  isAuthenticated: boolean;
}

export async function getPortalSession(): Promise<PortalSession> {
  const store = await cookies();
  const value = store.get(sessionCookieName)?.value;
  if (!value) return { isAuthenticated: false };

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return { ...parsed, isAuthenticated: true };
  } catch {
    return { isAuthenticated: false };
  }
}

export function encodeSession(session: Omit<PortalSession, "isAuthenticated">) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}
