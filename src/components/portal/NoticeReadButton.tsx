"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  noticeId: string;
  lineNo: number | null;
  requiresReadConfirmation?: boolean | null;
  compact?: boolean;
};

export default function NoticeReadButton({
  noticeId,
  lineNo,
  requiresReadConfirmation = false,
  compact = false
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const onClick = async () => {
    if (lineNo == null || status === "sending" || status === "done") return;

    setStatus("sending");
    setError("");

    const res = await fetch("/api/notices/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noticeId, lineNo })
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : "No se pudo marcar el aviso como leído.");
      return;
    }

    setStatus("done");
    router.refresh();
  };

  return (
    <div className={compact ? "inline-flex flex-col gap-1" : "space-y-2"}>
      <button
        type="button"
        onClick={onClick}
        disabled={lineNo == null || status === "sending" || status === "done"}
        className={
          compact
            ? "inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:bg-forne-cloud disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex rounded-xl bg-forne-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {status === "sending"
          ? "Guardando..."
          : status === "done"
          ? "Leído"
          : requiresReadConfirmation
          ? "Confirmar lectura"
          : "Marcar como leído"}
      </button>
      {status === "error" ? (
        <div className={compact ? "max-w-48 text-xs leading-5 text-rose-700" : "text-sm text-rose-700"}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
