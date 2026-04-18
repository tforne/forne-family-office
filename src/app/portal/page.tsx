import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalTableCard from "@/components/portal/PortalTableCard";
import { mockContracts } from "@/lib/mock/contracts";
import { mockInvoices } from "@/lib/mock/invoices";
import { mockIncidents } from "@/lib/mock/incidents";
import { mockDocuments } from "@/lib/mock/documents";

export default function PortalDashboardPage() {
  const activeContracts = mockContracts.filter((x) => x.status !== "Canceled").length;
  const pendingInvoices = mockInvoices.filter((x) => (x.remainingAmount ?? 0) > 0).length;
  const openIncidents = mockIncidents.filter((x) => x.stateCode === "Active").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Resumen</h1>
        <p className="mt-2 text-sm text-forne-slate">Consulta tus contratos, facturas, incidencias y documentos.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard title="Contratos" value={String(activeContracts)} />
        <PortalStatCard title="Facturas pendientes" value={String(pendingInvoices)} />
        <PortalStatCard title="Incidencias abiertas" value={String(openIncidents)} />
        <PortalStatCard title="Documentos" value={String(mockDocuments.length)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <PortalTableCard title="Próximas facturas" subtitle="Resumen rápido de vencimientos">
          <div className="divide-y divide-black/5">
            {mockInvoices.slice(0, 2).map((item) => (
              <div key={item.id} className="px-5 py-4 text-sm">
                <div className="font-medium text-forne-forest">{item.invoiceNo}</div>
                <div className="mt-1 text-forne-slate">Vencimiento: {item.dueDate} · Importe: {item.amountIncludingVat} €</div>
              </div>
            ))}
          </div>
        </PortalTableCard>
        <PortalTableCard title="Incidencias recientes" subtitle="Seguimiento del estado">
          <div className="divide-y divide-black/5">
            {mockIncidents.slice(0, 2).map((item) => (
              <div key={item.id} className="px-5 py-4 text-sm">
                <div className="font-medium text-forne-forest">{item.title}</div>
                <div className="mt-1 text-forne-slate">Estado: {item.stateCode} · Fecha: {item.incidentDate}</div>
              </div>
            ))}
          </div>
        </PortalTableCard>
      </div>
    </div>
  );
}
