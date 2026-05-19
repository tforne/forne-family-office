import Link from "next/link";
import { notFound } from "next/navigation";
import BrandIcon from "@/components/brand/BrandIcon";
import InvoiceCopyRequestButton from "@/components/portal/InvoiceCopyRequestButton";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import InvoicePdfButton from "@/components/portal/InvoicePdfButton";
import { getContracts } from "@/lib/portal/contracts.service";
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

function DossierCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-forne-line bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fe_100%)] p-5 shadow-[0_18px_38px_-34px_rgba(15,47,87,0.2)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-forne-ink">{value}</div>
      <div className="mt-2 text-sm leading-6 text-forne-muted">{helper}</div>
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
  const [lines, contracts] = await Promise.all([getInvoiceLines(invoice), getContracts()]);
  const contract = contracts.find((item) => item.customerNo === invoice.billToCustomerNo);

  const status = statusLabel(invoice.remainingAmount);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/portal/invoices"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
            >
              <span aria-hidden="true">‹</span>
              Salir de la factura
            </Link>
            <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/55">
              {invoice.invoiceNo || invoice.id}
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-[2.35rem]">Factura {invoice.invoiceNo}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
              Detalle de importes, vencimiento y cliente asociados a la factura registrada en Business Central.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:max-w-[42rem]">
              <div className="rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Lectura recomendada</div>
                <div className="mt-2 text-base font-semibold text-white">
                  {status === "Pendiente" ? "Empieza por vencimiento e importe pendiente" : "La factura ya figura como liquidada"}
                </div>
                <div className="mt-2 text-sm leading-6 text-white/64">
                  {status === "Pendiente"
                    ? `Conviene revisar el vencimiento del ${cleanDate(invoice.dueDate)} y confirmar el importe todavía abierto.`
                    : "Puedes usar esta ficha como expediente económico y descargar o solicitar copia cuando lo necesites."}
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Contrato asociado</div>
                <div className="mt-2 text-base font-semibold text-white">{contract?.contractNo || "Sin referencia contractual"}</div>
                <div className="mt-2 text-sm leading-6 text-white/64">
                  {contract?.description || "No hemos encontrado una referencia contractual adicional para esta factura."}
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
            <div className="rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Importe total</div>
              <div className="mt-2 break-words text-2xl font-semibold text-white">{formatMoney(invoice.amountIncludingVat, invoice.currencyCode)}</div>
              <div className="mt-1 text-xs text-white/65">importe registrado</div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Importe pendiente</div>
              <div className="mt-2 break-words text-2xl font-semibold text-white">{formatMoney(invoice.remainingAmount, invoice.currencyCode)}</div>
              <div className="mt-1 text-xs text-white/65">saldo abierto</div>
            </div>
            <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ring-1 ${statusClass(status)}`}>{status}</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <InvoicePdfButton invoiceId={invoice.id || invoice.invoiceNo} />
            <InvoiceCopyRequestButton
              invoiceId={invoice.id}
              invoiceNo={invoice.invoiceNo}
              customerNo={invoice.billToCustomerNo}
              contractNo={contract?.contractNo}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DossierCard
          label="Estado"
          value={status}
          helper={status === "Pendiente" ? "La factura requiere seguimiento económico." : "La factura ya no presenta importe abierto."}
        />
        <DossierCard
          label="Vencimiento"
          value={cleanDate(invoice.dueDate)}
          helper="Fecha de referencia para control y revisión."
        />
        <DossierCard
          label="Cliente"
          value={invoice.billToCustomerNo || "-"}
          helper="Cliente principal de facturación asociado al documento."
        />
        <DossierCard
          label="Divisa"
          value={invoice.currencyCode || "EUR"}
          helper="Moneda registrada en Business Central para esta factura."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Resumen económico</div>
                <div className="mt-2 text-base font-semibold text-forne-ink">Importes</div>
              </div>
              <div className="text-sm text-forne-muted">Lectura rápida del documento</div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7ff_100%)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Importe total</div>
                <div className="mt-2 text-2xl font-semibold text-forne-ink">
                  {formatMoney(invoice.amountIncludingVat, invoice.currencyCode)}
                </div>
              </div>
              <div className="rounded-[24px] bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7ff_100%)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Importe pendiente</div>
                <div className="mt-2 text-2xl font-semibold text-forne-ink">
                  {formatMoney(invoice.remainingAmount, invoice.currencyCode)}
                </div>
              </div>
              <div className="rounded-[24px] bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7ff_100%)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Divisa</div>
                <div className="mt-2 text-2xl font-semibold text-forne-ink">
                  {invoice.currencyCode || "EUR"}
                </div>
              </div>
            </div>
          </section>

          <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Cronología del documento</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Fechas</div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <DetailItem label="Fecha registro" value={cleanDate(invoice.postingDate)} />
              <DetailItem label="Fecha documento" value={cleanDate(invoice.documentDate)} />
              <DetailItem label="Vencimiento" value={cleanDate(invoice.dueDate)} />
            </div>
          </section>

          <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Desglose</div>
                <div className="mt-2 text-base font-semibold text-forne-ink">Líneas de factura</div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">
                {lines.length} línea{lines.length === 1 ? "" : "s"}
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="mt-4">
                <PortalEmptyState
                  icon="billing"
                  title="No hay líneas publicadas"
                  description="No hay líneas publicadas para esta factura o el endpoint de líneas no está disponible en Business Central."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full divide-y divide-forne-line text-left text-sm">
                  <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                    <tr>
                      <th className="px-3 py-3 font-semibold sm:px-4">Descripción</th>
                      <th className="px-3 py-3 text-right font-semibold sm:px-4">Cantidad</th>
                      <th className="px-3 py-3 text-right font-semibold sm:px-4">Precio unitario</th>
                      <th className="px-3 py-3 text-right font-semibold sm:px-4">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forne-line bg-white">
                    {lines.map((line) => (
                      <tr key={line.id || `${line.invoiceId}-${line.lineNo}`} className="align-top transition hover:bg-[#f8fbff]">
                        <td className="min-w-[16rem] px-3 py-3 text-forne-ink sm:px-4 sm:py-4">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
                              <BrandIcon name="billing" className="h-4 w-4" />
                            </span>
                            <span>{line.description || "Sin descripción"}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-forne-muted sm:px-4 sm:py-4">
                          {line.quantity ?? "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-forne-muted sm:px-4 sm:py-4">
                          {typeof line.unitPrice === "number"
                            ? formatMoneyOrBlank(line.unitPrice, line.currencyCode || invoice.currencyCode)
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-forne-ink sm:px-4 sm:py-4">
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
          <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Identificación</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Datos de factura</div>
            <div className="mt-3">
              <DetailItem label="Nº factura" value={invoice.invoiceNo} />
              <DetailItem label="Id" value={invoice.id} />
              <DetailItem label="Estado" value={status} />
            </div>
          </section>

          <section className="ffo-portal-card rounded-[30px] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Contexto comercial</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Cliente</div>
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
