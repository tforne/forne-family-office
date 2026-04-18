import PortalTableCard from "@/components/portal/PortalTableCard";
import { mockIncidents } from "@/lib/mock/incidents";

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Incidencias</h1>
        <p className="mt-2 text-sm text-forne-slate">Revisa el estado y seguimiento de tus incidencias.</p>
      </div>
      <PortalTableCard title="Incidencias">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-forne-cream text-forne-slate"><tr><th className="px-4 py-3 text-left">Incidencia</th><th className="px-4 py-3 text-left">Fecha</th><th className="px-4 py-3 text-left">Título</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3 text-left">Prioridad</th></tr></thead>
            <tbody>{mockIncidents.map((item) => (<tr key={item.id} className="border-t border-black/5"><td className="px-4 py-3">{item.incidentId}</td><td className="px-4 py-3">{item.incidentDate}</td><td className="px-4 py-3">{item.title}</td><td className="px-4 py-3">{item.stateCode}</td><td className="px-4 py-3">{item.priority}</td></tr>))}</tbody>
          </table>
        </div>
      </PortalTableCard>
    </div>
  );
}
