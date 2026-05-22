"use client";

import { useState } from "react";

export default function AvailabilityInterestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const res = await fetch("/api/public/availability-interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : "No se pudo enviar la solicitud.");
      return;
    }

    setStatus("sent");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div className="rounded-[26px] border border-[rgba(22,32,44,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,249,251,0.88)_100%)] p-6 shadow-[0_18px_40px_-34px_rgba(10,25,44,0.16)] lg:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr] lg:items-start">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B89B6D]">
              Solicitud inicial
            </div>
            <p className="mt-3 text-sm leading-7 text-[#5A6675]">
              Cuéntanos el tipo de inmueble, la zona o el timing que estás valorando. Revisaremos
              la disponibilidad con una lectura selectiva y te responderemos de forma
              personalizada.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#1C2735]">
                Nombre
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  className="ffo-portal-input w-full rounded-[16px] border px-4 py-3.5 text-sm font-normal text-[#1C2735] outline-none"
                  required
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#1C2735]">
                Correo electrónico
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Tu correo electrónico"
                  className="ffo-portal-input w-full rounded-[16px] border px-4 py-3.5 text-sm font-normal text-[#1C2735] outline-none"
                  required
                  maxLength={180}
                  autoComplete="email"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-[#1C2735]">
              Qué estás buscando
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ejemplo: Busco un piso de 2 habitaciones en Barcelona o alrededores, disponible en los próximos meses."
                className="ffo-portal-input min-h-32 w-full rounded-[18px] border px-4 py-3.5 text-sm font-normal leading-6 text-[#1C2735] outline-none"
                required
                maxLength={1000}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-[rgba(22,32,44,0.08)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md text-xs leading-5 text-[#5A6675]">
            Te responderemos desde Forné Family Office con la información disponible más relevante
            para tu búsqueda, sin comunicaciones genéricas.
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="ffo-button-primary inline-flex items-center justify-center rounded-[16px] px-8 py-3 text-sm font-semibold text-white transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Enviando solicitud..." : "Enviar solicitud"}
          </button>
        </div>
      </div>

      {status === "sent" ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Solicitud enviada correctamente. Te contactaremos lo antes posible.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
