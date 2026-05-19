"use client";

import { useState } from "react";

type Props = {
  invoiceId: string;
};

export default function InvoicePdfButton({ invoiceId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/me/invoices/${encodeURIComponent(invoiceId)}/pdf`, {
        cache: "no-store"
      });

      if (!response.ok) {
        let message = "No hay PDF oficial disponible para esta factura.";

        try {
          const payload = await response.json();
          if (typeof payload?.error === "string" && payload.error.trim()) {
            message = payload.error;
          }
        } catch {
          // Ignore JSON parsing issues and keep the fallback message.
        }

        setStatusMessage(message);
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const popup = window.open(objectUrl, "_blank", "noopener,noreferrer");

      if (!popup) {
        setStatusMessage("El navegador ha bloqueado la nueva pestaña. Permite ventanas emergentes e inténtalo de nuevo.");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      setStatusMessage("No se ha podido abrir el PDF oficial en este momento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex rounded-2xl border border-forne-line bg-white px-4 py-3 text-sm font-semibold text-forne-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-forne-cloud disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? "Abriendo PDF..." : "Ver PDF oficial"}
      </button>
      {statusMessage ? (
        <div className="max-w-sm rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 shadow-sm">
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}
