"use client";

import { useState } from "react";
import BrandIcon from "@/components/brand/BrandIcon";

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
    <form onSubmit={onSubmit} className="ffo-portal-card rounded-[30px] p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
          <BrandIcon name="incident" className="h-4 w-4" />
        </span>
        <div>
          <div className="text-base font-semibold text-forne-ink">Enviar consulta sobre esta incidencia</div>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-forne-muted">
            Escribe un mensaje y lo enviaremos automáticamente a Forné Family Office con la referencia de la incidencia.
          </p>
        </div>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="ffo-portal-input mt-5 min-h-36 w-full rounded-2xl px-4 py-3 text-sm leading-6 text-forne-ink outline-none"
        placeholder="Escribe aquí tu consulta o información adicional..."
        required
        maxLength={4000}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-forne-muted">{message.length}/4000 caracteres</div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="ffo-portal-button rounded-2xl bg-forne-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(7,11,26,0.8)] transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
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
