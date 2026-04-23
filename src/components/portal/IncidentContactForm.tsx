"use client";

import { useState } from "react";

type Props = {
  incidentId: string;
  title: string;
  property?: string | null;
  contractNo?: string | null;
};

export default function IncidentContactForm({ incidentId, title, property, contractNo }: Props) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const res = await fetch("/api/incidents/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId,
        title,
        property,
        contractNo,
        message
      })
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : "No se pudo enviar el mensaje.");
      return;
    }

    setStatus("sent");
    setMessage("");
  };

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
      <div className="text-base font-semibold text-forne-ink">Enviar consulta sobre esta incidencia</div>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-forne-muted">
        Escribe un mensaje y lo enviaremos automáticamente a Forné Family Office con la referencia de la incidencia.
      </p>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="mt-5 min-h-36 w-full rounded-2xl border border-forne-line bg-white px-4 py-3 text-sm leading-6 text-forne-ink outline-none transition focus:border-forne-ink"
        placeholder="Escribe aquí tu consulta o información adicional..."
        required
        maxLength={4000}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-forne-muted">{message.length}/4000 caracteres</div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-xl bg-forne-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Enviando..." : "Enviar mensaje"}
        </button>
      </div>

      {status === "sent" ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Mensaje enviado correctamente. Gracias, revisaremos tu consulta.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
