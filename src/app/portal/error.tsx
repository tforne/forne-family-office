"use client";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isHiddenProductionError = error.message.includes("specific message is omitted in production builds");

  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-forne-ink">Error en el portal</h1>
          <p className="mt-2 text-sm text-forne-muted">
            Ha ocurrido un error al cargar esta sección. Por favor, intenta de nuevo.
          </p>
        </div>
        <div className="rounded-2xl border border-forne-line bg-white p-6 shadow-sm">
          <p className="text-sm text-forne-muted mb-4">
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
            className="rounded-xl bg-forne-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
