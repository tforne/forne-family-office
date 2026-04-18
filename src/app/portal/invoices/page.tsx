import PortalTableCard from "@/components/portal/PortalTableCard";
import { mockInvoices } from "@/lib/mock/invoices";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Facturas</h1>
        <p className="mt-2 text-sm text-forne-slate">Consulta fechas, vencimientos e importes.</p>
      </div>
      <PortalTableCard title="Facturas">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-forne-cream text-forne-slate"><tr><th className="px-4 py-3 text-left">Factura</th><th className="px-4 py-3 text-left">Fecha</th><th className="px-4 py-3 text-left">Vencimiento</th><th className="px-4 py-3 text-left">Importe</th><th className="px-4 py-3 text-left">Pendiente</th></tr></thead>
            <tbody>{mockInvoices.map((item) => (<tr key={item.id} className="border-t border-black/5"><td className="px-4 py-3">{item.invoiceNo}</td><td className="px-4 py-3">{item.postingDate}</td><td className="px-4 py-3">{item.dueDate}</td><td className="px-4 py-3">{item.amountIncludingVat} €</td><td className="px-4 py-3">{item.remainingAmount} €</td></tr>))}</tbody>
          </table>
        </div>
      </PortalTableCard>
    </div>
  );
}
