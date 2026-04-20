import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalTableCard from "@/components/portal/PortalTableCard";
import { getInvoices } from "@/lib/portal/invoices.service";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

function cleanDate(value: string | null) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatMoney(value: number | null, currencyCode: string | null) {
  const currency = currencyCode || "EUR";

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency
  }).format(value || 0);
}

function invoiceStatus(invoice: InvoiceDto) {
  const remaining = invoice.remainingAmount || 0;
  if (remaining > 0) return "Pendiente";
  return "Pagada";
}

function statusClass(status: string) {
  if (status === "Pendiente") return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.amountIncludingVat || 0), 0);
  const pendingAmount = invoices.reduce((sum, invoice) => sum + (invoice.remainingAmount || 0), 0);
  const pendingCount = invoices.filter((invoice) => (invoice.remainingAmount || 0) > 0).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Facturas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-forne-slate">
          Consulta tus facturas, importes y vencimientos registrados en Business Central.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Facturas" value={String(invoices.length)} />
        <PortalStatCard title="Pendientes" value={String(pendingCount)} />
        <PortalStatCard title="Importe pendiente" value={formatMoney(pendingAmount, invoices[0]?.currencyCode || null)} />
      </div>

      <PortalTableCard
        title="Listado de facturas"
        subtitle={`${invoices.length} factura${invoices.length === 1 ? "" : "s"} encontradas`}
      >
        {invoices.length === 0 ? (
          <div className="px-5 py-10 text-sm text-forne-slate">
            No hay facturas registradas para tu perfil.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5 text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-forne-slate">
                <tr>
                  <th className="px-5 py-3 font-semibold">Factura</th>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Vencimiento</th>
                  <th className="px-5 py-3 text-right font-semibold">Importe</th>
                  <th className="px-5 py-3 text-right font-semibold">Pendiente</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {invoices.map((invoice) => {
                  const status = invoiceStatus(invoice);

                  return (
                    <tr key={invoice.id} className="align-top">
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-medium text-forne-forest">{invoice.invoiceNo}</div>
                        <div className="mt-1 text-xs text-forne-slate">Cliente {invoice.billToCustomerNo}</div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-slate">
                        {cleanDate(invoice.postingDate || invoice.documentDate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-slate">
                        {cleanDate(invoice.dueDate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-forne-forest">
                        {formatMoney(invoice.amountIncludingVat, invoice.currencyCode)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-forne-slate">
                        {formatMoney(invoice.remainingAmount, invoice.currencyCode)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PortalTableCard>

      <div className="text-right text-sm font-medium text-forne-slate">
        Total facturado: <span className="text-forne-forest">{formatMoney(totalAmount, invoices[0]?.currencyCode || null)}</span>
      </div>
    </div>
  );
}
