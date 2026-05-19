"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChatSettings } from "@/lib/content/chat-settings";

export default function AdminChatSettingsClient({
  initialSettings,
  chatAvailable
}: {
  initialSettings: ChatSettings;
  chatAvailable: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveSettings = async () => {
    setPending(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/chat-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "No se pudo guardar la configuración del chat.");
      }

      setEnabled(Boolean(payload.settings?.enabled));
      setMessage("Configuración del chat guardada correctamente.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la configuración del chat.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {!chatAvailable ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          El chat está bloqueado por entorno. Activa `CHAT_AVAILABLE=true` en la configuración para permitir su uso.
        </div>
      ) : null}

      {(message || error) ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || message}
        </div>
      ) : null}

      <section className="ffo-portal-card rounded-[28px] p-6">
        <div className="flex flex-col gap-4 border-b border-forne-line pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-forne-ink">Chat del portal</h2>
            <p className="mt-1 text-sm text-forne-muted">
              Activa o desactiva manualmente la visibilidad del chat para usuarios del portal.
            </p>
          </div>
          <button
            type="button"
            onClick={saveSettings}
            disabled={pending || !chatAvailable}
            className="ffo-portal-button rounded-2xl bg-forne-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div className="mt-6 rounded-[20px] border border-forne-line bg-forne-cloud/30 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">
                Estado actual
              </div>
              <div className="mt-2 text-lg font-semibold text-forne-ink">
                {enabled && chatAvailable ? "Chat visible en portal" : "Chat oculto"}
              </div>
              <p className="mt-2 text-sm leading-6 text-forne-muted">
                El interruptor manual controla la visibilidad del chat. Si el entorno lo bloquea, no se mostrará aunque aquí esté activado.
              </p>
            </div>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-forne-line bg-white px-4 py-3">
              <span className="text-sm font-medium text-forne-ink">Mostrar chat</span>
              <button
                type="button"
                aria-pressed={enabled}
                onClick={() => setEnabled((current) => !current)}
                disabled={!chatAvailable}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  enabled ? "bg-emerald-500" : "bg-slate-300"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
