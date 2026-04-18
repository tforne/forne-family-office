"use client";

import { useRouter } from "next/navigation";

export default function PortalHeader() {
  const router = useRouter();

  const onLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="border-b border-black/5 bg-white px-6 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-forne-slate">Portal privado</div>
          <div className="text-lg font-semibold text-forne-forest">Área de cliente</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-forne-forest">Cliente Demo</div>
            <div className="text-xs text-forne-slate">tenant@example.com</div>
          </div>
          <button onClick={onLogout} className="rounded-xl border border-forne-stone px-4 py-2 text-sm font-medium text-forne-forest hover:bg-forne-cream">Salir</button>
        </div>
      </div>
    </header>
  );
}
