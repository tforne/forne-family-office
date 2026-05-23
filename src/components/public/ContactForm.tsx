"use client";

import { useState } from "react";
import { getPublicCopy, type PublicLocale } from "@/lib/i18n/public";

export default function ContactForm({ locale }: { locale: PublicLocale }) {
  const localized = getPublicCopy(locale);
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
      body: JSON.stringify({ name, email, subject, message, locale })
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : localized.forms.contact.genericError);
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
        {localized.forms.contact.name}
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder={localized.forms.contact.name}
          required
          maxLength={120}
          autoComplete="name"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-forne-ink">
        {localized.forms.contact.email}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder={localized.forms.contact.email}
          required
          maxLength={180}
          autoComplete="email"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-forne-ink">
        {localized.forms.contact.subject}
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder={localized.forms.contact.subject}
          required
          maxLength={180}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-forne-ink">
        {localized.forms.contact.message}
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-36 rounded-xl border border-forne-line px-4 py-3 text-sm font-normal outline-none transition focus:border-forne-ink"
          placeholder={localized.forms.contact.messagePlaceholder}
          required
          maxLength={2000}
        />
      </label>
      <p className="text-xs leading-5 text-forne-muted">
        {localized.forms.contact.help}
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-forne-ink px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? localized.forms.contact.sending : localized.forms.contact.send}
      </button>

      {status === "sent" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {localized.forms.contact.sent}
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
