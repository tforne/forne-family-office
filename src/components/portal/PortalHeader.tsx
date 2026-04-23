"use client";

import { useRouter } from "next/navigation";

export default function PortalHeader() {
  const router = useRouter();

  const onLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="border-b border-forne-line bg-white px-6 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-forne-muted">Portal privado</div>
          <div className="text-lg font-semibold text-forne-ink">Área de cliente</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-forne-ink">Cliente Demo</div>
            <div className="text-xs text-forne-muted">tenant@example.com</div>
          </div>
          <button onClick={onLogout} className="rounded-xl border border-forne-line px-4 py-2 text-sm font-medium text-forne-ink hover:bg-forne-cloud">Salir</button>
        </div>
      </div>
    </header>
  );
}
