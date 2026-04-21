"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="flex min-h-screen items-center justify-center bg-forne-cream px-6">
      <div className="w-full max-w-md rounded-3xl border border-forne-stone bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-forne-forest">Acceso clientes</h1>
        <p className="mt-2 text-sm text-forne-slate">Accede al portal privado con tu cuenta Microsoft.</p>
        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {message === "logout" ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Sesión cerrada correctamente. Gracias por visitar el portal, hasta pronto.
          </div>
        ) : null}

        <a href="/api/auth/entra" className="mt-8 block rounded-xl bg-forne-forest px-4 py-3 text-center text-sm font-semibold text-white">
          Entrar con Microsoft
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-forne-cream px-6">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
