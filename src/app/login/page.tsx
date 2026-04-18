"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("tenant@example.com");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    router.push("/portal");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-forne-cream px-6">
      <div className="w-full max-w-md rounded-3xl border border-forne-stone bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-forne-forest">Acceso clientes</h1>
          <p className="mt-2 text-sm text-forne-slate">Entra en tu área privada de Forné Family Office.</p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-forne-stone px-4 py-3 text-sm" placeholder="Correo electrónico" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-forne-stone px-4 py-3 text-sm" placeholder="Contraseña" />
          <button type="submit" className="w-full rounded-xl bg-forne-forest px-4 py-3 text-sm font-semibold text-white">Entrar</button>
        </form>
      </div>
    </div>
  );
}
