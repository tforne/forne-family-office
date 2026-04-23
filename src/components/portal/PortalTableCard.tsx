export default function PortalTableCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-forne-line bg-white shadow-sm">
      <div className="border-b border-forne-line bg-white px-5 py-4">
        <div className="text-base font-semibold text-forne-ink">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-forne-muted">{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}
