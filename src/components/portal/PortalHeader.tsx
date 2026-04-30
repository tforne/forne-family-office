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
    <header className="border-b border-forne-line bg-white px-6 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-forne-muted">Portal privado</div>
          <div className="text-lg font-semibold text-forne-ink">Área de cliente</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-forne-ink">{providerLabel}</div>
            <div className="text-xs text-forne-muted">{userEmail}</div>
          </div>
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            disabled={isLoggingOut}
            className="rounded-xl border border-forne-line px-4 py-2 text-sm font-medium text-forne-ink transition hover:bg-forne-cloud disabled:cursor-not-allowed disabled:opacity-60"
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
