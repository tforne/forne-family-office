"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const res = await fetch("/api/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message })
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : "No se pudo enviar la consulta.");
      return;
    }

    setStatus("sent");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-forne-ink">
        Nombre
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder="Nombre"
          required
          maxLength={120}
          autoComplete="name"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-forne-ink">
        Correo electrónico
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder="Correo electrónico"
          required
          maxLength={180}
          autoComplete="email"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-forne-ink">
        Asunto
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder="Asunto"
          required
          maxLength={180}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-forne-ink">
        Mensaje
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-36 rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder="Cuéntanos qué necesitas y te responderemos lo antes posible."
          required
          maxLength={2000}
        />
      </label>
      <p className="text-xs leading-5 text-forne-muted">
        Si prefieres, puedes indicar la zona o el tipo de inmueble que te interesa para responderte con más precisión.
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-forne-ink px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Enviando..." : "Enviar"}
      </button>

      {status === "sent" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Consulta enviada correctamente. Te responderemos lo antes posible.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
