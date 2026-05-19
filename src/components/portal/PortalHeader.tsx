"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmationDialog from "@/components/portal/ConfirmationDialog";

export default function PortalHeader({
  email,
  provider
}: {
  email?: string;
  provider?: "demo" | "entra";
}) {
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLogoutDialogOpen(false);
    router.push("/");
    router.refresh();
  };

  const providerLabel = provider === "entra" ? "Cliente Microsoft" : "Cliente Demo";
  const userEmail = email || "Sin correo de sesión";

  return (
    <header className="ffo-portal-header px-4 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">
            Portal privado
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="text-xl font-semibold tracking-tight text-forne-ink sm:text-2xl">
              Área de cliente
            </div>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-[#1b6fd8]/60 sm:inline-flex" />
            <div className="hidden text-sm text-forne-muted sm:block">
              Consultas, avisos y gestiones en un mismo espacio.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_18px_45px_-34px_rgba(15,47,87,0.3)] backdrop-blur md:block">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forne-muted">
              Sesión
            </div>
            <div className="mt-1 text-sm font-semibold text-forne-ink">{providerLabel}</div>
            <div className="truncate text-xs text-forne-muted">{userEmail}</div>
          </div>
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            disabled={isLoggingOut}
            className="rounded-2xl border border-forne-line bg-white/80 px-4 py-2.5 text-sm font-semibold text-forne-ink shadow-[0_16px_36px_-30px_rgba(15,47,87,0.35)] transition hover:-translate-y-0.5 hover:border-forne-ink/15 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Salir
          </button>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        title="Cerrar sesión"
        description="Estás a punto de salir del área privada. Podrás volver a entrar cuando quieras iniciando sesión de nuevo."
        confirmLabel="Cerrar sesión"
        cancelLabel="Permanecer aquí"
        tone="danger"
        isProcessing={isLoggingOut}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={onLogout}
      />
    </header>
  );
}
