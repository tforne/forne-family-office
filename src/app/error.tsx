"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-forne-cream px-6">
          <div className="w-full max-w-md rounded-3xl border border-forne-stone bg-white p-8 shadow-sm text-center">
            <h1 className="text-2xl font-semibold text-forne-forest">Algo salió mal</h1>
            <p className="mt-2 text-sm text-forne-slate">
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </p>
            <button
              onClick={() => reset()}
              className="mt-6 w-full rounded-xl bg-forne-forest px-4 py-3 text-sm font-semibold text-white"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}