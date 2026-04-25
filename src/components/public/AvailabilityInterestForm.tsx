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
      <div className="rounded-[20px] border border-[#D7E7F5] bg-white/80 px-4 py-3 text-sm leading-6 text-[#605E5C]">
        Cuéntanos qué tipo de inmueble te interesa y nuestro equipo revisará la disponibilidad para responderte de forma personalizada.
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tu nombre"
          className="w-full rounded border border-[#E1DFDD] bg-[#F3F2F1] px-4 py-3 text-sm text-[#201F1E] outline-none transition focus:border-[#0078D4] focus:ring-2 focus:ring-[#0078D4]/15"
          required
          maxLength={120}
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Tu correo electrónico"
          className="w-full rounded border border-[#E1DFDD] bg-[#F3F2F1] px-4 py-3 text-sm text-[#201F1E] outline-none transition focus:border-[#0078D4] focus:ring-2 focus:ring-[#0078D4]/15"
          required
          maxLength={180}
        />
      </div>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Ejemplo: Busco un piso de 2 habitaciones en Barcelona o alrededores, disponible en los próximos meses."
        className="min-h-28 w-full rounded border border-[#E1DFDD] bg-[#F3F2F1] px-4 py-3 text-sm leading-6 text-[#201F1E] outline-none transition focus:border-[#0078D4] focus:ring-2 focus:ring-[#0078D4]/15"
        required
        maxLength={1000}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-5 text-[#605E5C]">
          Te responderemos desde Forné Family Office a la dirección indicada.
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded bg-[#0078D4] px-8 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(0,120,212,0.85)] transition hover:bg-[#106EBE] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Enviando solicitud..." : "Quiero recibir información"}
        </button>
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
