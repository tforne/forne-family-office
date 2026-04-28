export default function PortalTableCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-forne-line bg-white shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
      <div className="border-b border-forne-line/80 bg-[#fbfcfd] px-6 py-5">
        <div className="text-lg font-semibold tracking-tight text-forne-ink">{title}</div>
        {subtitle ? <div className="mt-1 text-sm leading-6 text-forne-muted">{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}
