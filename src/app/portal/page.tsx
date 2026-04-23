import { getInvoices } from "@/lib/portal/invoices.service";
import { getIncidents } from "@/lib/portal/incidents.service";
import { getIncidentRequests } from "@/lib/portal/incident-requests.service";
import PortalStatCard from "@/components/portal/PortalStatCard";

export default async function PortalPage() {
  const [invoices, incidents, incidentRequests] = await Promise.all([
    getInvoices(),
    getIncidents(),
    getIncidentRequests(),
  ]);

  const pendingInvoices = invoices.filter((x) => (x.remainingAmount ?? 0) > 0).length;
  const openIncidents = incidents.filter((x) => x.stateCode === "Active").length;
  const pendingIncidentRequests = incidentRequests.filter((x) => x.status !== "Created" && x.status !== "Error").length;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Portal privado</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">Resumen</h1>
        <p className="mt-2 text-sm text-forne-muted">
          Consulta tus facturas e incidencias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Facturas pendientes" value={String(pendingInvoices)} href="/portal/invoices" />
        <PortalStatCard title="Incidencias abiertas" value={String(openIncidents)} href="/portal/incidents" />
        <PortalStatCard title="Peticiones de incidencia" value={String(pendingIncidentRequests)} />
      </div>
    </div>
  );
}
