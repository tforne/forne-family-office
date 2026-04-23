import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalSession } from "@/lib/auth/session";
import { isPortalAdminEmail } from "@/lib/portal/admin-auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  const showAdmin = isPortalAdminEmail(session.email);

  return (
    <div className="min-h-screen bg-forne-cloud text-forne-ink">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <PortalSidebar showAdmin={showAdmin} />
        <main className="flex-1 p-5 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
