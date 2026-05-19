import PortalHeader from "@/components/portal/PortalHeader";
import PortalChatLauncher from "@/components/portal/PortalChatLauncher";
import PortalSidebar from "@/components/portal/PortalSidebar";
import packageJson from "../../../package.json";
import { getPortalSession } from "@/lib/auth/session";
import { getChatSettings } from "@/lib/content/chat-settings";
import { env } from "@/lib/config/env";
import { isPortalAdminEmail } from "@/lib/portal/admin-auth";
import { resolvePortalUserContext } from "@/lib/portal/user-context";
import { redirect } from "next/navigation";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session.isAuthenticated) {
    redirect("/login");
  }

  try {
    await resolvePortalUserContext();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (["PORTAL_DISABLED", "PORTAL_USER_BLOCKED", "PORTAL_USER_DISABLED"].includes(message)) {
      redirect(`/login?error=${encodeURIComponent(message)}`);
    }
    throw error;
  }

  const showAdmin = isPortalAdminEmail(session.email);
  const chatSettings = await getChatSettings();
  const showChat = env.chatAvailable && chatSettings.enabled;
  const appVersion = packageJson.version;

  return (
    <div className="ffo-portal-shell min-h-screen text-forne-ink">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <PortalSidebar showAdmin={showAdmin} version={appVersion} />
        <div id="portal-main-shell" className="flex min-h-screen flex-1 flex-col transition-[margin] duration-300 ease-out">
          <PortalHeader email={session.email} provider={session.provider} />
          <main className="flex-1 p-4 sm:p-5 lg:p-8 xl:p-10">
            <div id="portal-main-content" className="mx-auto max-w-7xl rounded-[32px] border border-white/50 bg-white/28 p-3 shadow-[0_24px_70px_-50px_rgba(15,47,87,0.28)] backdrop-blur-[2px] transition-[max-width] duration-300 ease-out sm:p-4 lg:p-5">
              {children}
            </div>
          </main>
        </div>
      </div>
      {showChat ? <PortalChatLauncher /> : null}
    </div>
  );
}
