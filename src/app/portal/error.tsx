"use client";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-forne-forest">Error en el portal</h1>
          <p className="mt-2 text-sm text-forne-slate">
            Ha ocurrido un error al cargar esta sección. Por favor, intenta de nuevo.
          </p>
        </div>
        <div className="rounded-2xl border border-forne-stone bg-white p-6">
          <p className="text-sm text-forne-slate mb-4">
            Detalles del error: {error.message}
          </p>
          <button
            onClick={() => reset()}
            className="rounded-xl bg-forne-forest px-4 py-2 text-sm font-semibold text-white"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}