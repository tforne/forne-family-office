import PortalStatCard from "@/components/portal/PortalStatCard";
import Link from "next/link";
import { listNewsItems } from "@/lib/content/news";
import { getContracts } from "@/lib/portal/contracts.service";
import { getIncidentRequests } from "@/lib/portal/incident-requests.service";
import { getIncidents } from "@/lib/portal/incidents.service";
import { getInvoices } from "@/lib/portal/invoices.service";
import { isCurrentPortalAdmin } from "@/lib/portal/admin-auth";
import type { ContractDto } from "@/lib/dto/contract.dto";
import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

async function safeLoad<T>(label: string, loader: () => Promise<T>, fallback: T) {
  try {
    return { data: await loader(), failed: false };
  } catch (error) {
    console.error(`[portal] Error loading ${label}`, error);
    return { data: fallback, failed: true };
  }
}

function formatDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatMoney(value: number | null | undefined, currencyCode: string | null | undefined) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode || "EUR"
  }).format(value || 0);
}

function contractStatusLabel(contract?: ContractDto) {
  if (!contract?.status) return "Sin estado";

  const normalized = contract.status.toLowerCase();
  if (normalized === "signed") return "Vigente";
  if (normalized === "open") return "Activo";
  if (normalized === "closed") return "Finalizado";
  return contract.status;
}

function contractStatusClass(contract?: ContractDto) {
  const normalized = contract?.status?.toLowerCase() || "";
  if (normalized === "signed" || normalized === "open") {
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  }
  if (normalized === "closed") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }
  return "bg-amber-50 text-amber-800 ring-amber-200";
}

function getPrimaryContract(contracts: ContractDto[]) {
  return [...contracts].sort((left, right) => {
    const leftDate = left.expirationDate || left.nextInvoiceDate || left.contractDate || "";
    const rightDate = right.expirationDate || right.nextInvoiceDate || right.contractDate || "";
    return rightDate.localeCompare(leftDate);
  })[0];
}

function getNextPendingInvoice(invoices: InvoiceDto[]) {
  return [...invoices]
    .filter((invoice) => (invoice.remainingAmount ?? 0) > 0)
    .sort((left, right) => {
      const leftDate = left.dueDate || left.postingDate || left.documentDate || "";
      const rightDate = right.dueDate || right.postingDate || right.documentDate || "";
      return leftDate.localeCompare(rightDate);
    })[0];
}

function getLatestInvoices(invoices: InvoiceDto[]) {
  return invoices.slice(0, 4);
}

function getPriorityIncident(incidents: IncidentDto[]) {
  return [...incidents].sort((left, right) => {
    const leftDate = left.incidentDate || left.createdOn || "";
    const rightDate = right.incidentDate || right.createdOn || "";
    return rightDate.localeCompare(leftDate);
  })[0];
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function LinkValue({
  href,
  value
}: {
  href?: string;
  value: string;
}) {
  if (!href) {
    return <div className="mt-2 text-sm font-medium leading-6 text-forne-ink">{value}</div>;
  }

  return (
    <a href={href} className="mt-2 inline-flex text-sm font-medium leading-6 text-[#0078D4] transition hover:text-[#106EBE]">
      {value}
    </a>
  );
}

function ContactCard({
  label,
  title,
  email,
  phone,
  helper
}: {
  label: string;
  title: string;
  email?: string | null;
  phone?: string | null;
  helper?: string;
}) {
  return (
    <article className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-forne-ink">{title}</h3>
      {helper ? <p className="mt-2 text-sm leading-6 text-forne-muted">{helper}</p> : null}

      <div className="mt-5 space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Email</div>
          <LinkValue
            href={hasText(email) ? `mailto:${email}` : undefined}
            value={hasText(email) ? String(email) : "No disponible"}
          />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Teléfono</div>
          <LinkValue
            href={hasText(phone) ? `tel:${phone}` : undefined}
            value={hasText(phone) ? String(phone) : "No disponible"}
          />
        </div>
      </div>
    </article>
  );
}

function SummaryDetail({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-forne-line bg-white/70 p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <div className="mt-3 text-xl font-semibold tracking-tight text-forne-ink">{value}</div>
      {helper ? <div className="mt-2 text-sm leading-6 text-forne-muted">{helper}</div> : null}
    </div>
  );
}

export default async function PortalPage() {
  const [invoicesResult, incidentsResult, incidentRequestsResult, contractsResult, newsResult, isAdmin] = await Promise.all([
    safeLoad("invoices summary", getInvoices, []),
    safeLoad("incidents summary", getIncidents, []),
    safeLoad("incident requests summary", getIncidentRequests, []),
    safeLoad("contracts summary", getContracts, []),
    safeLoad("portal news", listNewsItems, []),
    isCurrentPortalAdmin(),
  ]);

  const invoices = invoicesResult.data;
  const incidents = incidentsResult.data;
  const incidentRequests = incidentRequestsResult.data;
  const contracts = contractsResult.data;
  const newsItems = newsResult.data;
  const hasPartialError =
    invoicesResult.failed || incidentsResult.failed || incidentRequestsResult.failed || contractsResult.failed || newsResult.failed;

  const pendingInvoices = invoices.filter((x) => (x.remainingAmount ?? 0) > 0).length;
  const openIncidents = incidents.filter((x) => x.stateCode === "Active").length;
  const pendingIncidentRequests = incidentRequests.filter((x) => x.status !== "Created" && x.status !== "Error").length;
  const activeContracts = contracts.filter((contract) => ["signed", "open"].includes(contract.status?.toLowerCase?.() || "")).length;
  const primaryContract = getPrimaryContract(contracts);
  const nextPendingInvoice = getNextPendingInvoice(invoices);
  const latestInvoices = getLatestInvoices(invoices);
  const priorityIncident = getPriorityIncident(incidents);
  const insuranceEmail = priorityIncident?.insuranceEmail || null;
  const insurancePhone = priorityIncident?.insurancePhoneNo || null;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Portal privado</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">Resumen</h1>
        <p className="mt-2 text-sm leading-6 text-forne-muted">
          Visualiza tu situación actual con la información más importante del contrato y los próximos movimientos.
        </p>
      </div>

      {hasPartialError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          Alguna información no se ha podido cargar en este momento. Revisa los logs de Vercel para ver el detalle exacto.
        </div>
      ) : null}

      {!isAdmin ? (
        <section className="rounded-[28px] border border-forne-line bg-white p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-forne-ink p-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Dashboard inicial</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Próximo recibo y situación contractual</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-semibold text-white/70">Próximo recibo</div>
                  <div className="mt-3 text-3xl font-semibold">
                    {nextPendingInvoice
                      ? formatMoney(nextPendingInvoice.remainingAmount, nextPendingInvoice.currencyCode)
                      : "Sin importe pendiente"}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/60">
                    {nextPendingInvoice
                      ? `Vence el ${formatDate(nextPendingInvoice.dueDate)}`
                      : "No hay recibos pendientes en este momento."}
                  </div>
                </div>

                <Link
                  href="/portal/contracts"
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="text-sm font-semibold text-white/70">Contrato principal</div>
                  <div className="mt-3 text-xl font-semibold">
                    {primaryContract?.description || primaryContract?.contractNo || "Sin contrato asociado"}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/60">
                    {primaryContract?.fixedRealEstateDescription || "Todavía no hay un inmueble vinculado en el resumen."}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    Ver detalle
                    <span aria-hidden="true">›</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <SummaryDetail
                label="Estado del contrato"
                value={contractStatusLabel(primaryContract)}
                helper={primaryContract?.contractNo ? `Contrato ${primaryContract.contractNo}` : "Sin contrato principal detectado"}
              />
              <SummaryDetail
                label="Fin de contrato"
                value={formatDate(primaryContract?.expirationDate)}
                helper={primaryContract?.expirationDate ? "Fecha prevista de finalización actual." : "No hay fecha de fin informada."}
              />
              <SummaryDetail
                label="Próxima facturación"
                value={formatDate(primaryContract?.nextInvoiceDate || nextPendingInvoice?.dueDate)}
                helper="Referencia temporal del próximo movimiento económico."
              />
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard title="Facturas pendientes" value={String(pendingInvoices)} href="/portal/invoices" />
        <PortalStatCard title="Incidencias abiertas" value={String(openIncidents)} href="/portal/incidents" />
        <PortalStatCard title="Peticiones de incidencia" value={String(pendingIncidentRequests)} />
        <PortalStatCard title="Contratos activos" value={String(activeContracts)} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Facturas pendientes</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">Últimas 4 facturas</h2>
            <p className="mt-2 text-sm leading-6 text-forne-muted">
              Relación rápida de las últimas facturas emitidas, estén o no pendientes.
            </p>
          </div>
          <Link
            href="/portal/invoices"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forne-ink transition hover:text-[#0078D4]"
          >
            Ver todas
            <span aria-hidden="true">›</span>
          </Link>
        </div>

        {latestInvoices.length === 0 ? (
          <div className="rounded-3xl border border-forne-line bg-white px-6 py-8 text-sm text-forne-muted shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
            No hay facturas disponibles en este momento.
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-forne-line bg-white shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-[#fbfcfd] text-xs uppercase tracking-wide text-forne-muted">
                <tr>
                  <th className="px-5 py-4 font-semibold">Factura</th>
                  <th className="px-5 py-4 font-semibold">Vencimiento</th>
                  <th className="px-5 py-4 text-right font-semibold">Importe</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                  <th className="px-5 py-4 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {latestInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-forne-ink">{invoice.invoiceNo}</div>
                      <div className="mt-1 text-xs text-forne-muted">Cliente {invoice.billToCustomerNo}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-forne-ink">
                      {formatMoney(invoice.amountIncludingVat, invoice.currencyCode)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        (invoice.remainingAmount ?? 0) > 0
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      }`}>
                        {(invoice.remainingAmount ?? 0) > 0 ? "Pendiente" : "Pagada"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <Link
                        href={`/portal/invoices/${encodeURIComponent(invoice.id || invoice.invoiceNo)}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-forne-ink transition hover:text-[#0078D4]"
                      >
                        + información
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Contactos útiles</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">Teléfonos y emails de interés</h2>
          <p className="mt-2 text-sm leading-6 text-forne-muted">
            Accesos rápidos a los canales de contacto más relevantes para tu contrato y tus gestiones.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <ContactCard
            label="Atención general"
            title="Forné Family Office"
            email="office@forne.family"
            helper="Canal general para consultas relacionadas con el portal y la gestión del alquiler."
          />
          <ContactCard
            label="Contrato"
            title={primaryContract?.description || primaryContract?.contractNo || "Contrato principal"}
            email={primaryContract?.email}
            phone={primaryContract?.phoneNo}
            helper={primaryContract?.fixedRealEstateDescription || "Datos de contacto asociados al contrato principal."}
          />
          <ContactCard
            label="Incidencia y seguro"
            title={priorityIncident?.title || "Seguimiento de incidencias"}
            email={insuranceEmail || priorityIncident?.contactEmail}
            phone={insurancePhone || priorityIncident?.contactPhoneNo}
            helper={
              insuranceEmail || insurancePhone
                ? "Contacto vinculado al seguro o siniestro cuando está disponible."
                : "Contacto asociado a la última incidencia registrada."
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Noticias y avisos</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">Información destacada</h2>
          <p className="mt-2 text-sm leading-6 text-forne-muted">
            Últimos comunicados y avisos relevantes publicados para el portal.
          </p>
        </div>

        {newsItems.length === 0 ? (
          <div className="rounded-3xl border border-forne-line bg-white px-6 py-8 text-sm text-forne-muted shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
            No hay noticias publicadas en este momento.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {newsItems.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: item.categoryColor,
                      backgroundColor: item.categoryBackground
                    }}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs text-forne-muted">{item.date || "Sin fecha"}</span>
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-tight text-forne-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-forne-muted">
                  {item.description}
                </p>

                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forne-ink transition hover:text-[#0078D4]"
                  >
                    Más información
                    <span aria-hidden="true">›</span>
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
