import Link from "next/link";
import { notFound } from "next/navigation";
import InvoiceCopyRequestButton from "@/components/portal/InvoiceCopyRequestButton";
import { getInvoiceById, getInvoiceLines } from "@/lib/portal/invoices.service";

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

function formatMoneyOrBlank(value: number | null | undefined, currencyCode: string | null) {
  if (value == null || value === 0) return "";
  return formatMoney(value, currencyCode);
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-b border-forne-line py-3 last:border-b-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">{label}</div>
      <div className="mt-1 break-words text-sm leading-6 text-forne-ink">{value || "-"}</div>
    </div>
  );
}

function statusLabel(remainingAmount: number | null) {
  return (remainingAmount || 0) > 0 ? "Pendiente" : "Pagada";
}

function statusClass(status: string) {
  if (status === "Pendiente") return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const invoice = await getInvoiceById(id);

  if (!invoice) notFound();
  const lines = await getInvoiceLines(invoice);

  const status = statusLabel(invoice.remainingAmount);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/portal/invoices"
              className="inline-flex rounded-xl border border-forne-line bg-white px-4 py-2 text-sm font-semibold text-forne-ink shadow-sm transition hover:bg-forne-cloud"
            >
              Salir de la factura
            </Link>
            <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-forne-muted">
              {invoice.invoiceNo || invoice.id}
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-forne-ink">Factura {invoice.invoiceNo}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-forne-muted">
              Detalle de importes, vencimiento y cliente asociados a la factura registrada en Business Central.
            </p>
          </div>
          <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ring-1 ${statusClass(status)}`}>
            {status}
          </span>
        </div>
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/me/invoices/${encodeURIComponent(invoice.id || invoice.invoiceNo)}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl border border-forne-line bg-white px-4 py-3 text-sm font-semibold text-forne-ink shadow-sm transition hover:bg-forne-cloud"
            >
              Ver PDF oficial
            </a>
            <InvoiceCopyRequestButton
              invoiceId={invoice.id}
              invoiceNo={invoice.invoiceNo}
              customerNo={invoice.billToCustomerNo}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-ink">Importes</div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-forne-cloud p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Importe total</div>
                <div className="mt-2 text-2xl font-semibold text-forne-ink">
                  {formatMoney(invoice.amountIncludingVat, invoice.currencyCode)}
                </div>
              </div>
              <div className="rounded-2xl bg-forne-cloud p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Importe pendiente</div>
                <div className="mt-2 text-2xl font-semibold text-forne-ink">
                  {formatMoney(invoice.remainingAmount, invoice.currencyCode)}
                </div>
              </div>
              <div className="rounded-2xl bg-forne-cloud p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Divisa</div>
                <div className="mt-2 text-2xl font-semibold text-forne-ink">
                  {invoice.currencyCode || "EUR"}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-ink">Fechas</div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <DetailItem label="Fecha registro" value={cleanDate(invoice.postingDate)} />
              <DetailItem label="Fecha documento" value={cleanDate(invoice.documentDate)} />
              <DetailItem label="Vencimiento" value={cleanDate(invoice.dueDate)} />
            </div>
          </section>

          <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-base font-semibold text-forne-ink">Líneas de factura</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">
                {lines.length} línea{lines.length === 1 ? "" : "s"}
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-forne-cloud p-5 text-sm leading-7 text-forne-muted">
                No hay líneas publicadas para esta factura o el endpoint de líneas no está disponible en Business Central.
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full divide-y divide-forne-line text-left text-sm">
                  <thead className="bg-forne-cloud text-xs uppercase tracking-wide text-forne-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Descripción</th>
                      <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
                      <th className="px-4 py-3 text-right font-semibold">Precio unitario</th>
                      <th className="px-4 py-3 text-right font-semibold">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forne-line bg-white">
                    {lines.map((line) => (
                      <tr key={line.id || `${line.invoiceId}-${line.lineNo}`} className="align-top">
                        <td className="min-w-72 px-4 py-4 text-forne-ink">
                          {line.description || "Sin descripción"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-forne-muted">
                          {line.quantity ?? "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-forne-muted">
                          {typeof line.unitPrice === "number"
                            ? formatMoneyOrBlank(line.unitPrice, line.currencyCode || invoice.currencyCode)
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-forne-ink">
                          {formatMoneyOrBlank(line.amountIncludingVat ?? line.amount, line.currencyCode || invoice.currencyCode)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-ink">Datos de factura</div>
            <div className="mt-3">
              <DetailItem label="Nº factura" value={invoice.invoiceNo} />
              <DetailItem label="Id" value={invoice.id} />
              <DetailItem label="Estado" value={status} />
            </div>
          </section>

          <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-ink">Cliente</div>
            <div className="mt-3">
              <DetailItem label="Cliente facturación" value={invoice.billToCustomerNo} />
              <DetailItem label="Cliente venta" value={invoice.sellToCustomerNo} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
