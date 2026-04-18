import PortalTableCard from "@/components/portal/PortalTableCard";
import { mockContracts } from "@/lib/mock/contracts";

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Contratos</h1>
        <p className="mt-2 text-sm text-forne-slate">Consulta todos tus contratos actuales e históricos.</p>
      </div>
      <PortalTableCard title="Contratos">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-forne-cream text-forne-slate"><tr><th className="px-4 py-3 text-left">Contrato</th><th className="px-4 py-3 text-left">Activo</th><th className="px-4 py-3 text-left">Inicio</th><th className="px-4 py-3 text-left">Fin</th><th className="px-4 py-3 text-left">Estado</th></tr></thead>
            <tbody>{mockContracts.map((item) => (<tr key={item.id} className="border-t border-black/5"><td className="px-4 py-3">{item.contractNo}</td><td className="px-4 py-3">{item.fixedRealEstateDescription}</td><td className="px-4 py-3">{item.startingDate}</td><td className="px-4 py-3">{item.expirationDate}</td><td className="px-4 py-3">{item.status}</td></tr>))}</tbody>
          </table>
        </div>
      </PortalTableCard>
    </div>
  );
}
