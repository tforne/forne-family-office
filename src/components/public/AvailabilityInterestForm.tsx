"use client";

import { useState } from "react";
import { getPublicCopy, type PublicLocale } from "@/lib/i18n/public";

export default function AvailabilityInterestForm({ locale }: { locale: PublicLocale }) {
  const localized = getPublicCopy(locale);
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
      body: JSON.stringify({ name, email, message, locale })
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : localized.forms.availability.genericError);
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
              {localized.forms.availability.intro}
            </div>
            <p className="mt-3 text-sm leading-7 text-[#5A6675]">
              {localized.forms.availability.introBody}
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#1C2735]">
                {localized.forms.availability.name}
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={localized.forms.availability.name}
                  className="ffo-portal-input w-full rounded-[16px] border px-4 py-3.5 text-sm font-normal text-[#1C2735] outline-none"
                  required
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#1C2735]">
                {localized.forms.availability.email}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={localized.forms.availability.email}
                  className="ffo-portal-input w-full rounded-[16px] border px-4 py-3.5 text-sm font-normal text-[#1C2735] outline-none"
                  required
                  maxLength={180}
                  autoComplete="email"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-[#1C2735]">
              {localized.forms.availability.message}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={localized.forms.availability.messagePlaceholder}
                className="ffo-portal-input min-h-32 w-full rounded-[18px] border px-4 py-3.5 text-sm font-normal leading-6 text-[#1C2735] outline-none"
                required
                maxLength={1000}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-[rgba(22,32,44,0.08)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md text-xs leading-5 text-[#5A6675]">
            {localized.forms.availability.help}
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="ffo-button-primary inline-flex items-center justify-center rounded-[16px] px-8 py-3 text-sm font-semibold text-white transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? localized.forms.availability.sending : localized.forms.availability.send}
          </button>
        </div>
      </div>

      {status === "sent" ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {localized.forms.availability.sent}
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
