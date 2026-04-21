import { getInvoices } from "@/lib/portal/invoices.service";
import { getIncidents } from "@/lib/portal/incidents.service";

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-forne-stone bg-white p-5 shadow-sm">
      <div className="text-sm text-forne-slate">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-forne-forest">{value}</div>
    </div>
  );
}

export default async function PortalPage() {
  const [invoices, incidents] = await Promise.all([
    getInvoices(),
    getIncidents(),
  ]);

  const pendingInvoices = invoices.filter((x) => (x.remainingAmount ?? 0) > 0).length;
  const openIncidents = incidents.filter((x) => x.stateCode === "Active").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Resumen</h1>
        <p className="mt-2 text-sm text-forne-slate">
          Consulta tus facturas e incidencias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Facturas pendientes" value={String(pendingInvoices)} />
        <Card title="Incidencias abiertas" value={String(openIncidents)} />
      </div>
    </div>
  );
}
