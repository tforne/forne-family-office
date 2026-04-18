import { cookies } from "next/headers";
export const sessionCookieName = "forne_portal_session";
export async function isAuthenticated() { const store = await cookies(); return store.get(sessionCookieName)?.value === "demo-authenticated"; }
