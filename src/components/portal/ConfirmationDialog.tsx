"use client";

import { useEffect, useRef } from "react";

type ConfirmationDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  isProcessing = false,
  tone = "primary",
  onConfirm,
  onClose
}: ConfirmationDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const confirmClassName =
    tone === "danger"
      ? "bg-[#201614] text-white hover:bg-[#120b0a]"
      : "bg-forne-ink text-white hover:bg-forne-ink/92";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.28)] px-4 backdrop-blur-[6px]"
      onClick={isProcessing ? undefined : onClose}
      aria-hidden="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-6 shadow-[0_32px_80px_-34px_rgba(15,23,42,0.45)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#334155_100%)] text-sm font-semibold text-white shadow-[0_18px_32px_-20px_rgba(15,23,42,0.9)]">
            F
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">
              Confirmación
            </div>
            <h2 id="confirmation-dialog-title" className="mt-2 text-xl font-semibold text-forne-ink">
              {title}
            </h2>
            <p
              id="confirmation-dialog-description"
              className="mt-2 text-sm leading-6 text-forne-muted"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="inline-flex items-center justify-center rounded-2xl border border-forne-line bg-white px-5 py-3 text-sm font-semibold text-forne-muted transition hover:border-forne-ink/10 hover:text-forne-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold shadow-[0_20px_30px_-22px_rgba(15,23,42,0.85)] transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
          >
            {isProcessing ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
