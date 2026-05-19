"use client";

import { useState } from "react";

type InvoiceDownloadItem = {
  id: string;
  invoiceNo: string;
};

export default function DownloadLatestInvoicesButton({
  invoices
}: {
  invoices: InvoiceDownloadItem[];
}) {
  if (invoices.length === 0) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"info" | "success" | "warning">("info");

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStatusTone("info");
    setStatusMessage("Preparando la descarga de las ultimas facturas...");

    try {
      const response = await fetch(`/api/me/invoices/latest-pdf-downloads?limit=${invoices.length}&scan=10`, {
        cache: "no-store"
      });
      const payload = await response.json();
      const downloadableInvoices: InvoiceDownloadItem[] = Array.isArray(payload?.invoices) ? payload.invoices : [];

      if (downloadableInvoices.length === 0) {
        setStatusTone("warning");
        setStatusMessage("No hay PDFs oficiales disponibles entre las ultimas facturas.");
        return;
      }

      setStatusTone("info");
      setStatusMessage(`Descargando ${downloadableInvoices.length} factura(s)...`);

      downloadableInvoices.forEach((invoice, index) => {
        window.setTimeout(() => {
          const link = document.createElement("a");
          link.href = `/api/me/invoices/${encodeURIComponent(invoice.id)}/pdf?download=1`;
          link.rel = "noopener";
          link.click();
        }, index * 300);
      });

      if (downloadableInvoices.length < invoices.length) {
        setStatusTone("warning");
        setStatusMessage(
          `Se han lanzado ${downloadableInvoices.length} descarga(s). Algunas facturas no tenian PDF oficial disponible. Revisa tu carpeta de Descargas.`
        );
      } else {
        setStatusTone("success");
        setStatusMessage(`Se han lanzado ${downloadableInvoices.length} descarga(s). Revisa tu carpeta de Descargas.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const statusClassName =
    statusTone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : statusTone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-sky-200 bg-sky-50 text-sky-900";

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-2xl border border-forne-line bg-white px-4 py-2.5 text-sm font-semibold text-forne-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-forne-cloud disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? "Preparando descarga..." : `Descargar últimas ${invoices.length}`}
      </button>
      {statusMessage ? (
        <div className={`max-w-sm rounded-2xl border px-3 py-2 text-xs leading-5 shadow-sm ${statusClassName}`}>
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}
