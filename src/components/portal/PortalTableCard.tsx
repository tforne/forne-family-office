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
    <div className="ffo-portal-card overflow-hidden rounded-[30px]">
      <div className="border-b border-forne-line/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,251,255,0.92)_100%)] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">
              Datos
            </div>
            <div className="mt-2 text-lg font-semibold tracking-tight text-forne-ink">{title}</div>
            {subtitle ? <div className="mt-1 text-sm leading-6 text-forne-muted">{subtitle}</div> : null}
            <div className="mt-2 max-w-xs text-xs leading-5 text-forne-muted sm:hidden">
              En móvil verás primero una vista resumida. Si aparece una tabla, puedes deslizar horizontalmente para ver todas las columnas.
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
