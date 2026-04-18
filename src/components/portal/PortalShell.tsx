import PortalSidebar from "./PortalSidebar";
import PortalHeader from "./PortalHeader";

export default function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-forne-cream">
      <div className="flex min-h-screen">
        <PortalSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <PortalHeader />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
