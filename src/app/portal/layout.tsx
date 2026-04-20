import PortalSidebar from "@/components/portal/PortalSidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-forne-cream">
      <div className="flex min-h-screen">
        <PortalSidebar />
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
