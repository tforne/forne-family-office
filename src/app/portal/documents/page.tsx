import PortalTableCard from "@/components/portal/PortalTableCard";
import { mockDocuments } from "@/lib/mock/documents";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Documentos</h1>
        <p className="mt-2 text-sm text-forne-slate">Consulta documentos asociados a tus activos y contratos.</p>
      </div>
      <PortalTableCard title="Documentos">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-forne-cream text-forne-slate"><tr><th className="px-4 py-3 text-left">Documento</th><th className="px-4 py-3 text-left">Tipo</th><th className="px-4 py-3 text-left">Activo</th><th className="px-4 py-3 text-left">Fecha</th><th className="px-4 py-3 text-left">Estado</th></tr></thead>
            <tbody>{mockDocuments.map((item) => (<tr key={item.id} className="border-t border-black/5"><td className="px-4 py-3">{item.description}</td><td className="px-4 py-3">{item.documentTypeCode}</td><td className="px-4 py-3">{item.sourceNo}</td><td className="px-4 py-3">{item.issueDate}</td><td className="px-4 py-3">{item.status}</td></tr>))}</tbody>
          </table>
        </div>
      </PortalTableCard>
    </div>
  );
}
