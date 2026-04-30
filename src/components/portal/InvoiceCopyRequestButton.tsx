"use client";

import { useState } from "react";
import ConfirmationDialog from "@/components/portal/ConfirmationDialog";

type Props = {
  invoiceId: string;
  invoiceNo: string;
  customerNo?: string | null;
  compact?: boolean;
};

export default function InvoiceCopyRequestButton({ invoiceId, invoiceNo, customerNo, compact = false }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const requestCopy = async () => {
    setIsDialogOpen(false);
    setStatus("sending");
    setError("");

    const res = await fetch("/api/incidents/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "invoiceCopy",
        invoiceId,
        invoiceNo,
        customerNo
      })
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : "No se pudo crear la petición.");
      return;
    }

    setStatus("sent");
  };

  return (
    <div className={compact ? "inline-flex flex-col gap-1" : "space-y-2"}>
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        disabled={status === "sending" || status === "sent"}
        className={
          compact
            ? "inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:bg-forne-cloud disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex rounded-xl bg-forne-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {status === "sending" ? "Creando..." : status === "sent" ? "Petición creada" : "Petición de copia"}
      </button>
      {status === "error" ? (
        <div className={compact ? "max-w-48 text-xs leading-5 text-rose-700" : "text-sm text-rose-700"}>
          {error}
        </div>
      ) : null}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Solicitar copia de factura"
        description={`Se enviará una petición para la factura ${invoiceNo || invoiceId}. El equipo revisará la solicitud y te contactará si necesita más información.`}
        confirmLabel="Crear petición"
        cancelLabel="Volver"
        isProcessing={status === "sending"}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={requestCopy}
      />
    </div>
  );
}
