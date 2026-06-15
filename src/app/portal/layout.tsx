import PortalHeader from "@/components/portal/PortalHeader";
import PortalChatLauncher from "@/components/portal/PortalChatLauncher";
import PortalBottomNav from "@/components/portal/PortalBottomNav";
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
          <main className="flex-1 px-2.5 pb-24 pt-3 sm:px-5 sm:pb-28 sm:pt-6 lg:px-8 lg:pb-8 xl:px-10 xl:pt-8">
            <div id="portal-main-content" className="ffo-portal-surface mx-auto max-w-7xl rounded-[26px] p-2 transition-[max-width] duration-300 ease-out sm:rounded-[34px] sm:p-4 lg:p-5">
              {children}
            </div>
          </main>
        </div>
      </div>
      <PortalBottomNav />
      {showChat ? <PortalChatLauncher /> : null}
    </div>
  );
}
