export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forne-cream px-6">
      <div className="w-full max-w-md rounded-3xl border border-forne-stone bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-semibold text-forne-forest">Página no encontrada</h1>
        <p className="mt-2 text-sm text-forne-slate">
          La página que buscas no existe.
        </p>
        <a
          href="/"
          className="mt-6 inline-block w-full rounded-xl bg-forne-forest px-4 py-3 text-sm font-semibold text-white"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}