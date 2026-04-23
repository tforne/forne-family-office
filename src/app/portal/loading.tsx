export default function PortalLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-forne-line bg-white p-8 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-forne-line" />
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-forne-ink animate-spin" />
            <div className="h-2.5 w-2.5 rounded-full bg-forne-ink" />
          </div>

          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">
              Accediendo al portal
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-forne-ink">
              Estamos preparando tu información
            </h2>
            <p className="mt-3 text-sm leading-7 text-forne-muted">
              Consultando facturas, incidencias y datos de tu perfil para mostrar el resumen actualizado.
            </p>

            <div className="mt-6 space-y-3">
              <div className="h-3 w-11/12 animate-pulse rounded-full bg-forne-cloud" />
              <div className="h-3 w-9/12 animate-pulse rounded-full bg-forne-cloud" />
              <div className="h-3 w-10/12 animate-pulse rounded-full bg-forne-cloud" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
