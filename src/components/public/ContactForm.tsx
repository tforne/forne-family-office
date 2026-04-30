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
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="rounded-xl border border-forne-line px-4 py-3 text-sm outline-none transition focus:border-forne-ink"
        placeholder="Nombre"
        required
        maxLength={120}
      />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="rounded-xl border border-forne-line px-4 py-3 text-sm outline-none transition focus:border-forne-ink"
        placeholder="Correo electrónico"
        required
        maxLength={180}
      />
      <input
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        className="rounded-xl border border-forne-line px-4 py-3 text-sm outline-none transition focus:border-forne-ink"
        placeholder="Asunto"
        required
        maxLength={180}
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="min-h-36 rounded-xl border border-forne-line px-4 py-3 text-sm outline-none transition focus:border-forne-ink"
        placeholder="Mensaje"
        required
        maxLength={2000}
      />
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
