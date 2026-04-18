import { mockMe } from "@/lib/mock/me";
import PortalTableCard from "@/components/portal/PortalTableCard";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Perfil</h1>
        <p className="mt-2 text-sm text-forne-slate">Información básica de tu acceso al portal.</p>
      </div>
      <PortalTableCard title="Datos del cliente">
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div><div className="text-xs uppercase tracking-wide text-forne-slate">Cliente</div><div className="mt-1 text-sm font-medium text-forne-forest">{mockMe.customerName}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-forne-slate">Customer No.</div><div className="mt-1 text-sm font-medium text-forne-forest">{mockMe.customerNo}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-forne-slate">Correo</div><div className="mt-1 text-sm font-medium text-forne-forest">{mockMe.email}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-forne-slate">Portal habilitado</div><div className="mt-1 text-sm font-medium text-forne-forest">{mockMe.portalEnabled ? 'Sí' : 'No'}</div></div>
        </div>
      </PortalTableCard>
    </div>
  );
}
