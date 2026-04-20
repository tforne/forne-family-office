"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const [email, setEmail] = useState("tenant@example.com");
  const [password, setPassword] = useState("");

  const onDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    router.push("/portal");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-forne-cream px-6">
      <div className="w-full max-w-md rounded-3xl border border-forne-stone bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-forne-forest">Acceso clientes</h1>
        <p className="mt-2 text-sm text-forne-slate">Demo + base para Microsoft Entra.</p>
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

        <form onSubmit={onDemoSubmit} className="mt-8 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-forne-stone px-4 py-3 text-sm" placeholder="Correo" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-forne-stone px-4 py-3 text-sm" placeholder="Contraseña" />
          <button type="submit" className="w-full rounded-xl bg-forne-forest px-4 py-3 text-sm font-semibold text-white">Entrar en demo</button>
        </form>

        <div className="my-6 h-px bg-black/10" />
        <a href="/api/auth/entra" className="block rounded-xl border border-forne-stone px-4 py-3 text-center text-sm font-semibold text-forne-forest">
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
