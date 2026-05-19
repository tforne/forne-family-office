import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";
import DownloadLatestInvoicesButton from "@/components/portal/DownloadLatestInvoicesButton";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import InvoiceCopyRequestButton from "@/components/portal/InvoiceCopyRequestButton";
import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalTableCard from "@/components/portal/PortalTableCard";
import { getContracts } from "@/lib/portal/contracts.service";
import { getInvoices } from "@/lib/portal/invoices.service";
import { isCurrentPortalAdmin } from "@/lib/portal/admin-auth";
import type { ContractDto } from "@/lib/dto/contract.dto";
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

function pickInvoiceContract(invoice: InvoiceDto, contracts: ContractDto[]) {
  return contracts.find((contract) => contract.customerNo === invoice.billToCustomerNo);
}

export default async function InvoicesPage() {
  const [isAdmin, invoices, contracts] = await Promise.all([isCurrentPortalAdmin(), getInvoices(), getContracts()]);
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.amountIncludingVat || 0), 0);
  const pendingAmount = invoices.reduce((sum, invoice) => sum + (invoice.remainingAmount || 0), 0);
  const pendingCount = invoices.filter((invoice) => (invoice.remainingAmount || 0) > 0).length;
  const latestInvoicesForDownload = invoices.slice(0, 3).map((invoice) => ({
    id: invoice.id || invoice.invoiceNo,
    invoiceNo: invoice.invoiceNo
  }));
  const paidCount = Math.max(invoices.length - pendingCount, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="relative z-[1] grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
              {isAdmin ? "Administración" : "Portal privado"}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.35rem]">
              {isAdmin ? "Facturas de clientes" : "Facturas"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              {isAdmin
                ? "Consulta global de las últimas 250 facturas, importes, vencimientos y estado de cobro registrados en Business Central."
                : "Consulta tus facturas, detecta importes pendientes y accede a copias o detalles sin salir del portal."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Importe pendiente</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {formatMoney(pendingAmount, invoices[0]?.currencyCode || null)}
                </div>
                <div className="mt-1 text-xs text-white/65">visión rápida de riesgo y cobro</div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Facturas</div>
              <div className="mt-2 text-3xl font-semibold text-white">{invoices.length}</div>
              <div className="mt-1 text-xs text-white/65">documentos contabilizados</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Pendientes</div>
              <div className="mt-2 text-3xl font-semibold text-white">{pendingCount}</div>
              <div className="mt-1 text-xs text-white/65">facturas con saldo abierto</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Pagadas</div>
              <div className="mt-2 text-3xl font-semibold text-white">{paidCount}</div>
              <div className="mt-1 text-xs text-white/65">sin importe pendiente</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Facturas" value={String(invoices.length)} />
        <PortalStatCard title="Pendientes" value={String(pendingCount)} />
        <PortalStatCard title="Importe pendiente" value={formatMoney(pendingAmount, invoices[0]?.currencyCode || null)} />
      </div>

      <PortalTableCard
        title="Listado de facturas"
        subtitle={
          isAdmin
            ? `${invoices.length} factura${invoices.length === 1 ? "" : "s"} encontradas. Se muestran las últimas 250.`
            : `${invoices.length} factura${invoices.length === 1 ? "" : "s"} encontradas`
        }
        action={<DownloadLatestInvoicesButton invoices={latestInvoicesForDownload} />}
      >
        {invoices.length === 0 ? (
          <div className="p-5">
            <PortalEmptyState
              icon="billing"
              title="No hay facturas disponibles"
              description={isAdmin ? "No hay facturas registradas en Business Central." : "No hay facturas registradas para tu perfil."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">Factura</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Fecha</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Vencimiento</th>
                  <th className="px-4 py-3 text-right font-semibold sm:px-5">Importe</th>
                  <th className="px-4 py-3 text-right font-semibold sm:px-5">Pendiente</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Estado</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Copia</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {invoices.map((invoice) => {
                  const status = invoiceStatus(invoice);
                  const contract = pickInvoiceContract(invoice, contracts);

                  return (
                    <tr key={invoice.id} className="align-top transition hover:bg-[#f8fbff]">
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
                            <BrandIcon name="billing" className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-medium text-forne-ink">{invoice.invoiceNo}</div>
                            <div className="mt-1 text-xs text-forne-muted">
                              {invoice.billToCustomerName || invoice.sellToCustomerName || `Cliente ${invoice.billToCustomerNo}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {cleanDate(invoice.postingDate || invoice.documentDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {cleanDate(invoice.dueDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-forne-ink sm:px-5 sm:py-4">
                        {formatMoney(invoice.amountIncludingVat, invoice.currencyCode)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-forne-muted sm:px-5 sm:py-4">
                        {formatMoney(invoice.remainingAmount, invoice.currencyCode)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <InvoiceCopyRequestButton
                          compact
                          invoiceId={invoice.id}
                          invoiceNo={invoice.invoiceNo}
                          customerNo={invoice.billToCustomerNo}
                          contractNo={contract?.contractNo}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <Link
                          href={`/portal/invoices/${encodeURIComponent(invoice.id || invoice.invoiceNo)}`}
                          className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-forne-cloud"
                        >
                          + información
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PortalTableCard>

      <div className="rounded-[28px] border border-forne-line bg-white/80 px-4 py-4 text-left text-sm font-medium text-forne-muted shadow-[0_18px_45px_-35px_rgba(15,47,87,0.22)] sm:px-5 sm:text-right">
        Total facturado: <span className="text-forne-ink">{formatMoney(totalAmount, invoices[0]?.currencyCode || null)}</span>
      </div>
    </div>
  );
}
