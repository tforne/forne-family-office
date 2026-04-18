export default function PortalTableCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-forne-stone bg-white shadow-sm">
      <div className="border-b border-black/5 bg-forne-cream px-5 py-4">
        <div className="text-base font-semibold text-forne-forest">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-forne-slate">{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}
