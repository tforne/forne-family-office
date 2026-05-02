import PortalHeader from "@/components/portal/PortalHeader";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalSession } from "@/lib/auth/session";
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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f4f7fb_48%,#f8fafc_100%)] text-forne-ink">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <PortalSidebar showAdmin={showAdmin} />
        <div className="flex min-h-screen flex-1 flex-col">
          <PortalHeader email={session.email} provider={session.provider} />
          <main className="flex-1 p-5 lg:p-8 xl:p-10">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
