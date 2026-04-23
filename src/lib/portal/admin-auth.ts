import { getPortalSession } from "@/lib/auth/session";
import { env } from "@/lib/config/env";

function configuredAdminEmails() {
  return env.portalAdminEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPortalAdminEmail(email?: string) {
  const admins = configuredAdminEmails();
  if (env.useDemoLogin && admins.length === 0) return true;
  if (!email) return false;
  return admins.includes(email.toLowerCase());
}

export async function isCurrentPortalAdmin() {
  const session = await getPortalSession();
  return session.isAuthenticated && isPortalAdminEmail(session.email);
}

export async function getPortalAdminSession() {
  const session = await getPortalSession();
  if (!session.isAuthenticated) {
    throw new Error("UNAUTHORIZED");
  }

  if (!isPortalAdminEmail(session.email)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
