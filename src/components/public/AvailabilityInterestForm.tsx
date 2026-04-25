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
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="rounded-2xl border border-forne-line bg-forne-cloud/70 px-4 py-3 text-sm leading-6 text-forne-muted">
        Cuéntanos qué tipo de inmueble te interesa y nuestro equipo revisará la disponibilidad para responderte de forma personalizada.
      </div>

      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Tu nombre"
        className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm text-forne-ink outline-none transition focus:border-forne-ink"
        required
        maxLength={120}
      />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Tu correo electrónico"
        className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm text-forne-ink outline-none transition focus:border-forne-ink"
        required
        maxLength={180}
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Ejemplo: Busco un piso de 2 habitaciones en Barcelona o alrededores, disponible en los próximos meses."
        className="min-h-24 w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm leading-6 text-forne-ink outline-none transition focus:border-forne-ink"
        required
        maxLength={1000}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-forne-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Enviando solicitud..." : "Quiero recibir información"}
      </button>

      <div className="text-xs leading-5 text-forne-muted">
        Te responderemos desde Forné Family Office a la dirección indicada.
      </div>

      {status === "sent" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Solicitud enviada correctamente. Te contactaremos lo antes posible.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
