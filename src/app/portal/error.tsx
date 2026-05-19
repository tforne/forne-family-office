"use client";

import BrandIcon from "@/components/brand/BrandIcon";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isHiddenProductionError = error.message.includes("specific message is omitted in production builds");

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 lg:p-8">
      <div className="ffo-portal-card w-full max-w-2xl rounded-[34px] p-7">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[22px] border border-rose-200 bg-rose-50 text-rose-700">
            <BrandIcon name="attention" className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">
              Estado del portal
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">Error en el portal</h1>
            <p className="mt-3 text-sm leading-7 text-forne-muted">
              Ha ocurrido un error al cargar esta sección. Puedes reintentar ahora mismo sin salir del área privada.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-[26px] border border-forne-line bg-white/86 p-6 shadow-[0_20px_45px_-35px_rgba(15,47,87,0.2)]">
          <p className="mb-4 text-sm text-forne-muted">
            Detalles del error:{" "}
            {isHiddenProductionError
              ? "Next.js ha ocultado el mensaje técnico en producción."
              : error.message}
          </p>
          {error.digest ? (
            <p className="mb-4 rounded-xl bg-forne-cloud px-4 py-3 font-mono text-xs text-forne-muted">
              Digest: {error.digest}
            </p>
          ) : null}
          <button
            onClick={() => reset()}
            className="ffo-portal-button rounded-2xl bg-forne-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(7,11,26,0.8)] transition hover:bg-forne-ink/92"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
