import PortalSidebar from "./PortalSidebar";
import PortalHeader from "./PortalHeader";
import { getPortalSession } from "@/lib/auth/session";
import { isPortalAdminEmail } from "@/lib/portal/admin-auth";

export default async function PortalShell({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  const showAdmin = isPortalAdminEmail(session.email);

  return (
    <div className="min-h-screen bg-forne-cloud text-forne-ink">
      <div className="flex min-h-screen">
        <PortalSidebar showAdmin={showAdmin} />
        <div className="flex min-h-screen flex-1 flex-col">
          <PortalHeader email={session.email} provider={session.provider} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
