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
    <header className="ffo-portal-header px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 sm:items-center">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7f8896]">
            Acceso privado
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <div className="text-[1.1rem] font-semibold tracking-[-0.03em] text-forne-ink sm:text-[1.6rem]">
              Área de cliente
            </div>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-[#b89b6d]/70 sm:inline-flex" />
            <div className="hidden text-[13px] text-[#6f7987] sm:block">
              Consultas, documentación y seguimiento en un mismo entorno.
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden rounded-[20px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(247,250,253,0.82)_100%)] px-4 py-3 shadow-[0_18px_45px_-34px_rgba(15,47,87,0.22)] backdrop-blur md:block">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7f8896]">
              Sesión
            </div>
            <div className="mt-1 text-sm font-semibold text-forne-ink">{providerLabel}</div>
            <div className="truncate text-[12px] text-[#6f7987]">{userEmail}</div>
          </div>
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            disabled={isLoggingOut}
            className="hidden rounded-[18px] border border-forne-line bg-white/86 px-4 py-2.5 text-sm font-semibold text-forne-ink shadow-[0_16px_36px_-30px_rgba(15,47,87,0.22)] transition hover:-translate-y-0.5 hover:border-forne-ink/15 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
          >
            Salir
          </button>
        </div>
      </div>
      <div className="mx-auto mt-2 max-w-7xl md:hidden">
        <div className="rounded-[20px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(247,250,253,0.82)_100%)] px-4 py-3 shadow-[0_18px_45px_-34px_rgba(15,47,87,0.22)] backdrop-blur">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7f8896]">
            Sesión
          </div>
          <div className="mt-1 text-sm font-semibold text-forne-ink">{providerLabel}</div>
          <div className="truncate text-[12px] text-[#6f7987]">{userEmail}</div>
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
