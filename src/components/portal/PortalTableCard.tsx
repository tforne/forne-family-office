export default function PortalTableCard({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-forne-line bg-white shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
      <div className="border-b border-forne-line/80 bg-[#fbfcfd] px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight text-forne-ink">{title}</div>
            {subtitle ? <div className="mt-1 text-sm leading-6 text-forne-muted">{subtitle}</div> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
