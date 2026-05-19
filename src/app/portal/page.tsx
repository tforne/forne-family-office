import PortalStatCard from "@/components/portal/PortalStatCard";
import NoticeReadButton from "@/components/portal/NoticeReadButton";
import PortalPageContext from "@/components/portal/PortalPageContext";
import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";
import { listNewsItems } from "@/lib/content/news";
import { getContracts } from "@/lib/portal/contracts.service";
import { getIncidentRequests } from "@/lib/portal/incident-requests.service";
import { getIncidents } from "@/lib/portal/incidents.service";
import { getInvoices } from "@/lib/portal/invoices.service";
import { getTenantMyNotices } from "@/lib/portal/tenant-my-notices.service";
import { getMe } from "@/lib/portal/me.service";
import { isCurrentPortalAdmin } from "@/lib/portal/admin-auth";
import type { ContractDto } from "@/lib/dto/contract.dto";
import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";
import type { TenantMyNoticeDto } from "@/lib/dto/tenant-my-notice.dto";

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

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 21) return "Buenas tardes";
  return "Buenas noches";
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

function getLatestIncidentRequests<T>(requests: T[]) {
  return requests.slice(0, 4);
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

function formatDateTime(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function noticePriorityClass(priority: string | null | undefined) {
  const normalized = priority?.toLowerCase() || "";
  if (["high", "alta", "urgent", "urgente"].includes(normalized)) {
    return "bg-red-50 text-red-700 ring-red-200";
  }
  if (["normal", "medium", "media"].includes(normalized)) {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function NoticeCard({ notice }: { notice: TenantMyNoticeDto }) {
  const requiresConfirmation = notice.requiresReadConfirmation === true;
  const showReadAction = notice.isUnread || requiresConfirmation;

  return (
    <article className={`ffo-portal-card rounded-[30px] p-6 ${
      requiresConfirmation ? "border-amber-300 ring-1 ring-amber-200" : "border-forne-line"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {notice.isUnread ? (
            <span className="rounded-full bg-forne-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Nuevo
            </span>
          ) : null}
          {requiresConfirmation ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800 ring-1 ring-amber-200">
              Confirmación requerida
            </span>
          ) : null}
          {notice.priority ? (
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ${noticePriorityClass(notice.priority)}`}>
              {notice.priority}
            </span>
          ) : null}
          {notice.noticeType ? (
            <span className="rounded-full bg-forne-cloud px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-forne-muted ring-1 ring-forne-line">
              {notice.noticeType}
            </span>
          ) : null}
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
          <BrandIcon name="attention" className="h-4.5 w-4.5" />
        </span>
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-forne-ink">
        {notice.title || notice.noticeNo || "Aviso"}
      </h3>
      <p className="mt-3 text-sm leading-7 text-forne-muted">
        {notice.description || "No hay descripción adicional para este aviso."}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">Publicado</div>
          <div className="mt-2 text-sm font-medium text-forne-ink">{formatDateTime(notice.publishFrom)}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">Contrato / activo</div>
          <div className="mt-2 text-sm font-medium text-forne-ink">
            {notice.headerContractNo || notice.contractNo || notice.headerAssetNo || notice.assetNo || "Sin referencia"}
          </div>
        </div>
      </div>

      {notice.requiresReadConfirmation ? (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Requiere confirmación de lectura.
        </div>
      ) : null}

      {showReadAction ? (
        <div className="mt-5">
          <NoticeReadButton
            noticeId={notice.noticeId}
            lineNo={notice.lineNo}
            requiresReadConfirmation={notice.requiresReadConfirmation}
          />
        </div>
      ) : null}
    </article>
  );
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

function QuickActionCard({
  href,
  title,
  description,
  helper
}: {
  href: string;
  title: string;
  description: string;
  helper: string;
}) {
  return (
    <Link
      href={href}
      className="ffo-portal-card group rounded-[30px] p-6 transition hover:-translate-y-1 hover:border-[#0078D4]/30 hover:shadow-[0_32px_70px_-40px_rgba(15,23,42,0.3)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">Autoservicio</div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8] transition group-hover:translate-x-0.5">
          <BrandIcon name="arrow" className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-forne-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-forne-muted">{description}</p>
      <div className="mt-4 text-sm font-semibold text-[#0078D4]">{helper}</div>
    </Link>
  );
}

function HelpItem({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[26px] border border-forne-line bg-white/86 p-5 shadow-[0_20px_45px_-36px_rgba(15,47,87,0.22)]">
      <h3 className="text-base font-semibold text-forne-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-forne-muted">{description}</p>
    </article>
  );
}

function HeroMetric({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/65">{helper}</div>
    </div>
  );
}

function ConciergeActionCard({
  href,
  eyebrow,
  title,
  description,
  cta,
  tone = "default"
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  tone?: "default" | "urgent" | "calm";
}) {
  const toneClass =
    tone === "urgent"
      ? "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96)_0%,rgba(255,247,237,0.98)_100%)]"
      : tone === "calm"
        ? "border-emerald-200 bg-[linear-gradient(180deg,rgba(240,253,244,0.96)_0%,rgba(247,254,250,0.98)_100%)]"
        : "border-forne-line bg-white/96";

  return (
    <Link
      href={href}
      className={`group rounded-[28px] border p-5 shadow-[0_24px_55px_-40px_rgba(15,47,87,0.24)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_-42px_rgba(15,47,87,0.32)] ${toneClass}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{eyebrow}</div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-forne-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-forne-muted">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forne-ink transition group-hover:text-[#0078D4]">
        {cta}
        <BrandIcon name="arrow" className="h-4 w-4" />
      </div>
    </Link>
  );
}

function ActivityItem({
  eyebrow,
  title,
  description,
  href,
  cta
}: {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <article className="rounded-[24px] border border-forne-line bg-white/92 p-5 shadow-[0_18px_38px_-34px_rgba(15,47,87,0.22)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{eyebrow}</div>
      <h3 className="mt-3 text-base font-semibold text-forne-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-forne-muted">{description}</p>
      {href && cta ? (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forne-ink transition hover:text-[#0078D4]"
        >
          {cta}
          <BrandIcon name="arrow" className="h-4 w-4" />
        </Link>
      ) : null}
    </article>
  );
}

function MilestoneCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-forne-line bg-white/94 p-5 shadow-[0_18px_40px_-34px_rgba(15,47,87,0.22)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <div className="mt-3 text-xl font-semibold tracking-tight text-forne-ink">{value}</div>
      <div className="mt-2 text-sm leading-6 text-forne-muted">{helper}</div>
    </div>
  );
}

function TimelineStep({
  label,
  title,
  description
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white/18 bg-white/12">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
      </span>
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">{label}</div>
      <div className="mt-2 text-base font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-white/64">{description}</div>
    </div>
  );
}

function DataSectionHeader({
  kicker,
  title,
  description,
  href,
  cta
}: {
  kicker: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">{kicker}</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-forne-muted">{description}</p>
      </div>
      {href && cta ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-forne-ink transition hover:text-[#0078D4]"
        >
          {cta}
          <span aria-hidden="true">›</span>
        </Link>
      ) : null}
    </div>
  );
}

export default async function PortalPage() {
  const [meResult, invoicesResult, incidentsResult, incidentRequestsResult, contractsResult, noticesResult, newsResult, isAdmin] = await Promise.all([
    safeLoad("me summary", getMe, null),
    safeLoad("invoices summary", getInvoices, []),
    safeLoad("incidents summary", getIncidents, []),
    safeLoad("incident requests summary", getIncidentRequests, []),
    safeLoad("contracts summary", getContracts, []),
    safeLoad("tenant my notices", getTenantMyNotices, []),
    safeLoad("portal news", listNewsItems, []),
    isCurrentPortalAdmin(),
  ]);

  const me = meResult.data;
  const invoices = invoicesResult.data;
  const incidents = incidentsResult.data;
  const incidentRequests = incidentRequestsResult.data;
  const contracts = contractsResult.data;
  const notices = noticesResult.data;
  const newsItems = newsResult.data;
  const hasPartialError =
    invoicesResult.failed || incidentsResult.failed || incidentRequestsResult.failed || contractsResult.failed || noticesResult.failed || newsResult.failed;

  const pendingInvoices = invoices.filter((x) => (x.remainingAmount ?? 0) > 0).length;
  const openIncidents = incidents.filter((x) => x.stateCode === "Active").length;
  const pendingIncidentRequests = incidentRequests.filter((x) => x.status !== "Created" && x.status !== "Error").length;
  const activeContracts = contracts.filter((contract) => ["signed", "open"].includes(contract.status?.toLowerCase?.() || "")).length;
  const dashboardNotices = [...notices]
    .sort((left, right) => {
      const leftUnread = left.isUnread ? 1 : 0;
      const rightUnread = right.isUnread ? 1 : 0;
      if (leftUnread !== rightUnread) return rightUnread - leftUnread;

      const leftRequires = left.requiresReadConfirmation ? 1 : 0;
      const rightRequires = right.requiresReadConfirmation ? 1 : 0;
      if (leftRequires !== rightRequires) return rightRequires - leftRequires;

      const leftTime = left.publishFrom ? new Date(left.publishFrom).getTime() : 0;
      const rightTime = right.publishFrom ? new Date(right.publishFrom).getTime() : 0;
      return rightTime - leftTime;
    })
    .slice(0, 3);
  const primaryContract = getPrimaryContract(contracts);
  const nextPendingInvoice = getNextPendingInvoice(invoices);
  const latestInvoices = getLatestInvoices(invoices);
  const latestIncidentRequests = getLatestIncidentRequests(incidentRequests);
  const priorityIncident = getPriorityIncident(incidents);
  const insuranceEmail = priorityIncident?.insuranceEmail || null;
  const insurancePhone = priorityIncident?.insurancePhoneNo || null;
  const greeting = `${greetingForNow()}${me?.customerName ? `, ${me.customerName}` : ""}`;
  const unreadNotices = notices.filter((notice) => notice.isUnread).length;
  const hasPendingInvoice = Boolean(nextPendingInvoice);
  const contractLabel = primaryContract?.fixedRealEstateDescription || primaryContract?.description || primaryContract?.contractNo || "tu contrato principal";
  const executiveStatus =
    unreadNotices > 0
      ? {
          label: "Atención requerida",
          helper: "Hay avisos o confirmaciones que conviene revisar primero.",
          chipClass: "bg-amber-50 text-amber-900 ring-amber-200"
        }
      : hasPendingInvoice
        ? {
            label: "Seguimiento económico",
            helper: "Tu próxima acción recomendable está en facturación.",
            chipClass: "bg-[#eaf3ff] text-[#123861] ring-[#bcd8fb]"
          }
        : openIncidents > 0
          ? {
              label: "Gestiones en curso",
              helper: "Tienes incidencias abiertas en seguimiento.",
              chipClass: "bg-emerald-50 text-emerald-800 ring-emerald-200"
            }
          : {
              label: "Situación estable",
              helper: "No detectamos acciones urgentes ahora mismo.",
              chipClass: "bg-slate-100 text-slate-700 ring-slate-200"
            };
  const conciergeHeadline =
    unreadNotices > 0
      ? `Hoy te conviene empezar por los avisos vinculados a ${contractLabel}.`
      : hasPendingInvoice
        ? `Tu siguiente punto de control está en la facturación de ${contractLabel}.`
        : openIncidents > 0
          ? `La prioridad ahora es seguir el avance de tus gestiones activas en ${contractLabel}.`
          : `Tu portal está al día y puedes usarlo como centro privado de seguimiento para ${contractLabel}.`;
  const conciergeSummary =
    unreadNotices > 0
      ? `${unreadNotices} aviso(s) pendiente(s), ${pendingInvoices} factura(s) por revisar y ${openIncidents} incidencia(s) abierta(s).`
      : hasPendingInvoice
        ? `${pendingInvoices} factura(s) pendiente(s), ${openIncidents} incidencia(s) activa(s) y ${pendingIncidentRequests} petición(es) en curso.`
        : `${activeContracts} contrato(s) activo(s), ${openIncidents} incidencia(s) abierta(s) y ${pendingIncidentRequests} petición(es) de seguimiento.`;
  const nextMilestoneLabel = hasPendingInvoice
    ? formatDate(nextPendingInvoice?.dueDate)
    : formatDate(primaryContract?.nextInvoiceDate || primaryContract?.expirationDate);
  const nextMilestoneTitle = hasPendingInvoice ? "Próximo vencimiento" : "Siguiente hito contractual";
  const nextMilestoneDescription = hasPendingInvoice
    ? `Recibo previsto por ${formatMoney(nextPendingInvoice?.remainingAmount, nextPendingInvoice?.currencyCode)}.`
    : primaryContract?.expirationDate
      ? `Tu contrato principal tiene como siguiente referencia el ${formatDate(primaryContract.expirationDate)}.`
      : "No hay hitos económicos o contractuales inmediatos informados.";
  const nextInvoiceDateValue = formatDate(primaryContract?.nextInvoiceDate || nextPendingInvoice?.dueDate);
  const contractEndDateValue = formatDate(primaryContract?.expirationDate);
  const recentActivity = [
    unreadNotices > 0
      ? {
          eyebrow: "Avisos recientes",
          title: `${unreadNotices} comunicación(es) pendiente(s)`,
          description: "El portal detecta avisos sin revisar o con confirmación de lectura pendiente para que empieces por ellos.",
          href: "/portal/notices",
          cta: "Entrar en avisos"
        }
      : {
          eyebrow: "Comunicaciones",
          title: "Bandeja de avisos al día",
          description: "No hay comunicaciones urgentes pendientes. Mantienes el histórico accesible desde el portal.",
          href: "/portal/notices",
          cta: "Ver bandeja"
        },
    hasPendingInvoice
      ? {
          eyebrow: "Facturación",
          title: `Próximo recibo previsto el ${formatDate(nextPendingInvoice?.dueDate)}`,
          description: `Hay importes pendientes para ${contractLabel}. Puedes revisar detalle, descargar y resolverlo desde la sección de facturas.`,
          href: "/portal/invoices",
          cta: "Abrir facturación"
        }
      : {
          eyebrow: "Facturación",
          title: "Sin importes pendientes",
          description: "No vemos necesidad de actuación inmediata en recibos. La sección de facturas queda disponible como archivo y consulta.",
          href: "/portal/invoices",
          cta: "Ver histórico"
        },
    openIncidents > 0
      ? {
          eyebrow: "Seguimiento técnico",
          title: `${openIncidents} incidencia(s) activa(s)`,
          description: "Tus gestiones siguen abiertas y el portal centraliza avance, contactos y referencia contractual asociada.",
          href: "/portal/incidents",
          cta: "Seguir incidencias"
        }
      : {
          eyebrow: "Seguimiento técnico",
          title: "Sin incidencias abiertas",
          description: "No hay gestiones técnicas activas en este momento. Si surge algo, puedes abrir una nueva incidencia desde el portal.",
          href: "/portal/incidents",
          cta: "Abrir incidencias"
        }
  ];
  const advisorName = primaryContract?.description || primaryContract?.contractNo || me?.customerName || "Equipo Forné Family Office";
  const advisorContact = primaryContract?.email || insuranceEmail || "office@forne.family";
  const advisorPhone = primaryContract?.phoneNo || insurancePhone || "No disponible";
  const recommendedJourney = [
    unreadNotices > 0
      ? {
          label: "Paso 1",
          title: "Revisa avisos y confirmaciones",
          description: "Empieza por las comunicaciones pendientes para despejar bloqueos y asegurar trazabilidad contractual."
        }
      : {
          label: "Paso 1",
          title: "Mantén el contexto bajo control",
          description: "Tus avisos están al día. Puedes usar el portal para una revisión rápida sin urgencias inmediatas."
        },
    hasPendingInvoice
      ? {
          label: "Paso 2",
          title: "Valida la próxima facturación",
          description: `Comprueba el recibo previsto para ${formatDate(nextPendingInvoice?.dueDate)} y descarga la documentación si la necesitas.`
        }
      : {
          label: "Paso 2",
          title: "Consulta la situación económica",
          description: "No hay importes pendientes, pero la sección de facturas sigue siendo tu histórico privado de referencia."
        },
    openIncidents > 0
      ? {
          label: "Paso 3",
          title: "Haz seguimiento de incidencias",
          description: "Cierra el recorrido comprobando el avance de las gestiones activas y sus contactos asociados."
        }
      : {
          label: "Paso 3",
          title: "Cierra con revisión de contrato o perfil",
          description: "Aprovecha para revisar tu contrato principal, próximos hitos y datos de contacto asociados."
        }
  ];
  const focusActions = [
    unreadNotices > 0
      ? {
          href: "/portal/notices",
          eyebrow: "Prioridad inmediata",
          title: `${unreadNotices} aviso(s) por revisar`,
          description: "Empieza por las comunicaciones activas para confirmar lecturas y no perder contexto relevante del contrato.",
          cta: "Abrir avisos",
          tone: "urgent" as const
        }
      : {
          href: "/portal/notices",
          eyebrow: "Comunicaciones",
          title: "Avisos al día",
          description: "No hay avisos urgentes pendientes. Puedes revisar el histórico o futuras comunicaciones cuando quieras.",
          cta: "Ver avisos",
          tone: "calm" as const
        },
    hasPendingInvoice
      ? {
          href: "/portal/invoices",
          eyebrow: "Siguiente acción",
          title: `Factura pendiente para ${formatDate(nextPendingInvoice?.dueDate)}`,
          description: `Consulta detalle, importe y descarga del próximo recibo previsto en ${contractLabel}.`,
          cta: "Revisar facturación",
          tone: "default" as const
        }
      : {
          href: "/portal/invoices",
          eyebrow: "Situación económica",
          title: "Sin recibos pendientes",
          description: "Tu facturación no requiere acción inmediata. Puedes entrar para descargar o revisar movimientos anteriores.",
          cta: "Ver facturas",
          tone: "calm" as const
        },
    openIncidents > 0
      ? {
          href: "/portal/incidents",
          eyebrow: "Seguimiento activo",
          title: `${openIncidents} incidencia(s) abierta(s)`,
          description: "Haz seguimiento del estado, contactos y avances sin depender de llamadas o correos dispersos.",
          cta: "Ir a incidencias",
          tone: "default" as const
        }
      : {
          href: "/portal/profile",
          eyebrow: "Portal privado",
          title: "Todo bajo control",
          description: "Aprovecha este momento para revisar tus datos, contexto contractual y accesos de autoservicio.",
          cta: "Revisar perfil",
          tone: "default" as const
        }
  ];
  const chatPageContext = {
    pageEyebrow: "Portal privado",
    pageTitle: "Resumen",
    pageSummary: "Visualiza tu situación actual con la información más importante del contrato y los próximos movimientos.",
    visibleFacts: [
      { label: "Contrato principal", value: primaryContract?.contractNo || "Sin referencia", helper: contractLabel },
      { label: nextMilestoneTitle, value: nextMilestoneLabel, helper: nextMilestoneDescription },
      { label: "Avisos", value: String(unreadNotices), helper: "Pendientes de revisar." },
      { label: "Facturación", value: String(pendingInvoices), helper: "Recibos pendientes." },
      { label: "Incidencias", value: String(openIncidents), helper: "Gestiones abiertas." }
    ],
    visibleSections: [
      {
        title: "Resumen ejecutivo",
        summary: `${conciergeHeadline} ${conciergeSummary} ${executiveStatus.helper}`
      },
      {
        title: "Recorrido recomendado",
        summary: recommendedJourney.map((item) => item.title).join(". ")
      }
    ]
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PortalPageContext payload={chatPageContext} />
      <div>
        <div className="text-3xl font-semibold tracking-tight text-forne-ink sm:text-4xl">{greeting}</div>
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
        <div className="space-y-6">
          <section id="dashboard-concierge" className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
            <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
                  Dashboard concierge
                </div>
                <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ring-1 ${executiveStatus.chipClass}`}>
                  {executiveStatus.label}
                </div>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-[2.35rem]">
                  {conciergeHeadline}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">{conciergeSummary}</p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">{executiveStatus.helper}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {unreadNotices > 0 ? (
                    <Link
                      href="/portal/notices"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
                    >
                      Revisar avisos
                      <BrandIcon name="arrow" className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href={hasPendingInvoice ? "/portal/invoices" : "/portal/incidents"}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
                    >
                      {hasPendingInvoice ? "Ir a facturación" : "Ver incidencias"}
                      <BrandIcon name="arrow" className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    href="/portal/contracts"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    Ver contrato principal
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <HeroMetric label="Avisos" value={String(unreadNotices)} helper="pendientes de revisar" />
                <HeroMetric label="Facturación" value={String(pendingInvoices)} helper="recibos pendientes" />
                <HeroMetric label="Incidencias" value={String(openIncidents)} helper="gestiones abiertas" />
              </div>
            </div>

            <div className="relative z-[1] mt-7 grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
              <div id="dashboard-summary" className="rounded-[28px] border border-white/10 bg-white/7 p-4 sm:p-5 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">Resumen ejecutivo</div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/7 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/50">Contrato principal</div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {primaryContract?.contractNo || "Sin referencia"}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/62">{contractLabel}</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/7 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/50">{nextMilestoneTitle}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{nextMilestoneLabel}</div>
                    <div className="mt-2 text-sm leading-6 text-white/62">{nextMilestoneDescription}</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/7 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/50">Apoyo disponible</div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {insurancePhone || primaryContract?.phoneNo || "office@forne.family"}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/62">
                      Contacto rápido para seguimiento contractual, incidencias o soporte.
                    </div>
                  </div>
                </div>
              </div>

              <div id="dashboard-journey" className="rounded-[28px] border border-white/10 bg-white/7 p-4 sm:p-5 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">Recorrido recomendado</div>
                <div className="relative mt-5 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-white/10">
                  {recommendedJourney.map((step) => (
                    <TimelineStep
                      key={step.title}
                      label={step.label}
                      title={step.title}
                      description={step.description}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-[1] mt-4 grid gap-4 xl:grid-cols-3">
              {focusActions.map((action) => (
                <ConciergeActionCard
                  key={action.title}
                  href={action.href}
                  eyebrow={action.eyebrow}
                  title={action.title}
                  description={action.description}
                  cta={action.cta}
                  tone={action.tone}
                />
              ))}
            </div>

            <div className="relative z-[1] mt-4 grid gap-4 xl:grid-cols-4">
              <QuickActionCard
                href="/portal/notices"
                title="Revisar avisos"
                description="Consulta comunicaciones activas y confirma lectura cuando sea necesario."
                helper={unreadNotices > 0 ? `${unreadNotices} aviso(s) pendientes` : "Todo al día"}
              />
              <QuickActionCard
                href="/portal/invoices"
                title="Consultar facturas"
                description="Comprueba importes, vencimientos, el estado de tus facturas y descarga rapidamente las 3 ultimas sin salir del portal."
                helper={hasPendingInvoice ? "Hay facturas pendientes y descarga rapida disponible" : "Sin importes pendientes y descarga rapida disponible"}
              />
              <QuickActionCard
                href="/portal/incidents"
                title="Abrir o seguir incidencias"
                description="Da de alta una nueva gestión o revisa el avance de solicitudes abiertas."
                helper={openIncidents > 0 ? `${openIncidents} incidencia(s) abierta(s)` : "Sin incidencias abiertas"}
              />
              <QuickActionCard
                href="/portal/profile"
                title="Ver tus datos"
                description="Consulta la información asociada a tu perfil y el entorno del portal."
                helper="Revisar perfil y contexto"
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="ffo-portal-card rounded-[32px] p-5 sm:p-6">
              <DataSectionHeader
                kicker="Actividad reciente"
                title="Qué está pasando en tu portal"
                description="Una lectura rápida de los movimientos y focos actuales para no tener que revisar cada sección por separado."
              />

              <div className="mt-5 grid gap-4">
                {recentActivity.map((item) => (
                  <ActivityItem
                    key={item.title}
                    eyebrow={item.eyebrow}
                    title={item.title}
                    description={item.description}
                    href={item.href}
                    cta={item.cta}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <section className="ffo-portal-card rounded-[32px] p-5 sm:p-6">
                <DataSectionHeader
                  kicker="Próximos hitos"
                  title="Calendario de control"
                  description="Fechas clave y referencias prácticas para anticiparte sin tener que buscar entre pantallas."
                />

                <div className="mt-5 grid gap-4">
                  <MilestoneCard
                    label="Próxima facturación"
                    value={nextInvoiceDateValue}
                    helper={hasPendingInvoice
                      ? `Importe estimado: ${formatMoney(nextPendingInvoice?.remainingAmount, nextPendingInvoice?.currencyCode)}.`
                      : "No consta un recibo pendiente inmediato en este momento."}
                  />
                  <MilestoneCard
                    label="Fin de contrato"
                    value={contractEndDateValue}
                    helper={primaryContract?.contractNo
                      ? `Referencia principal: contrato ${primaryContract.contractNo}.`
                      : "No hay una fecha contractual principal informada."}
                  />
                  <MilestoneCard
                    label="Peticiones activas"
                    value={String(pendingIncidentRequests)}
                    helper={pendingIncidentRequests > 0
                      ? "Conviene revisar si alguna petición requiere respuesta o seguimiento adicional."
                      : "No hay peticiones activas que requieran actuación ahora mismo."}
                  />
                </div>
              </section>

              <section className="ffo-portal-dark rounded-[32px] border border-white/8 p-5 text-white sm:p-6">
                <div className="relative z-[1]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/62">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
                    Acompañamiento
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">Tu punto de contacto preferente</h2>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    Cuando necesites escalar una consulta o confirmar contexto contractual, aquí tienes una referencia clara y privada.
                  </p>

                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/7 p-5 backdrop-blur">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Responsable / referencia</div>
                    <div className="mt-2 text-xl font-semibold text-white">{advisorName}</div>
                    <div className="mt-2 text-sm leading-6 text-white/66">{contractLabel}</div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-white/10 bg-white/7 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Email</div>
                      <div className="mt-2 text-sm font-medium text-white">{advisorContact}</div>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/7 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Teléfono</div>
                      <div className="mt-2 text-sm font-medium text-white">{advisorPhone}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/portal/profile"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
                    >
                      Revisar perfil
                      <BrandIcon name="arrow" className="h-4 w-4" />
                    </Link>
                    <a
                      href={`mailto:${advisorContact}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                    >
                      Escribir ahora
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </section>

          {notices.length > 0 ? (
            <section className="space-y-4">
              <DataSectionHeader
                kicker="Mis avisos"
                title="Avisos activos del portal"
                description="Comunicaciones relevantes vinculadas a tus contratos y activos, visibles desde Business Central."
                href="/portal/notices"
                cta="Ver todos"
              />

              <div className="grid gap-4 xl:grid-cols-3">
                {dashboardNotices.map((notice) => (
                  <NoticeCard
                    key={`${notice.noticeId}-${notice.lineNo ?? 0}`}
                    notice={notice}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="ffo-portal-card rounded-[32px] p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="ffo-portal-dark rounded-[30px] p-5 text-white sm:p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Dashboard inicial</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Próximo recibo y situación contractual</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/7 p-5 backdrop-blur">
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
                    className="rounded-[24px] border border-white/10 bg-white/7 p-5 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
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

          <section className="rounded-[32px] border border-forne-line bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] p-5 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.18)] sm:p-6">
            <DataSectionHeader
              kicker="Ayuda rápida"
              title="Qué puedes resolver desde aquí"
              description="Pequeñas pautas para avanzar mejor dentro del portal sin depender de comunicaciones manuales."
            />

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              <HelpItem
                title="Antes de abrir una incidencia"
                description="Comprueba si ya existe una gestión abierta y aporta detalles concretos: contrato, zona afectada y teléfono de contacto."
              />
              <HelpItem
                title="Si necesitas una factura"
                description="Desde Facturas puedes ver importes, vencimientos y solicitar copia cuando la necesites sin depender de un correo manual."
              />
              <HelpItem
                title="Si el aviso requiere acción"
                description="Revisa la sección Avisos y marca la lectura cuando se solicite confirmación para dejar trazabilidad en el portal."
              />
            </div>
          </section>
        </div>
      ) : null}

      <section className="space-y-4">
        <DataSectionHeader
          kicker="Indicadores clave"
          title="Seguimiento rápido del portal"
          description="Lectura compacta de tu situación antes de entrar en el detalle completo de cada módulo."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PortalStatCard title="Facturas pendientes" value={String(pendingInvoices)} href="/portal/invoices" />
          <PortalStatCard title="Incidencias abiertas" value={String(openIncidents)} href="/portal/incidents" />
          <PortalStatCard title="Peticiones de incidencia" value={String(pendingIncidentRequests)} href="/portal/incident-requests" />
          <PortalStatCard title="Contratos activos" value={String(activeContracts)} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <DataSectionHeader
            kicker="Peticiones de incidencia"
            title="Últimas 4 peticiones"
            description="Seguimiento rápido de solicitudes enviadas desde el portal y su estado de tramitación."
            href="/portal/incident-requests"
            cta="Ver todas"
          />

          {latestIncidentRequests.length === 0 ? (
            <div className="ffo-portal-card rounded-[30px] px-5 py-7 text-sm text-forne-muted sm:px-6 sm:py-8">
              No hay peticiones de incidencia registradas en este momento.
            </div>
          ) : (
            <div className="ffo-portal-card overflow-hidden rounded-[30px]">
              <div className="border-b border-forne-line/70 px-4 py-3 text-xs leading-5 text-forne-muted sm:hidden">
                Desliza la tabla para ver el estado y el detalle de cada petición.
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-forne-line text-left text-sm">
                <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Fecha</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Petición</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forne-line bg-white">
                  {latestIncidentRequests.map((request) => (
                    <tr
                      key={request.id || request.requestId || String(request.entryNo)}
                      className="transition hover:bg-[#f8fbff]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {formatDate(request.createdAt || request.incidentDate)}
                      </td>
                      <td className="min-w-[16rem] px-4 py-3 sm:px-5 sm:py-4">
                        <div className="font-medium text-forne-ink">
                          {request.title || request.requestId || "Petición de incidencia"}
                        </div>
                        <div className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-forne-muted">
                          {request.description || request.refDescription || request.createdIncidentNo || "Sin detalle adicional"}
                        </div>
                        <div className="mt-2 text-xs font-medium text-forne-muted">
                          {request.contractNo ? `Contrato ${request.contractNo}` : "Sin contrato asociado"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        <span className="inline-flex rounded-full border border-forne-line bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-forne-ink">
                          {request.status || "Sin estado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <DataSectionHeader
            kicker="Facturación"
            title="Últimas 4 facturas"
            description="Relación rápida de las últimas facturas emitidas para consulta o seguimiento."
            href="/portal/invoices"
            cta="Ver todas"
          />

          {latestInvoices.length === 0 ? (
            <div className="ffo-portal-card rounded-[30px] px-5 py-7 text-sm text-forne-muted sm:px-6 sm:py-8">
              No hay facturas disponibles en este momento.
            </div>
          ) : (
            <div className="ffo-portal-card overflow-hidden rounded-[30px]">
              <div className="border-b border-forne-line/70 px-4 py-3 text-xs leading-5 text-forne-muted sm:hidden">
                Desliza la tabla para ver importes y estado sin perder detalle.
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-forne-line text-left text-sm">
                <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Factura</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Vencimiento</th>
                    <th className="px-4 py-3 text-right font-semibold sm:px-5 sm:py-4">Importe</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forne-line bg-white">
                  {latestInvoices.map((invoice) => (
                    <tr key={invoice.id} className="transition hover:bg-[#f8fbff]">
                      <td className="px-4 py-3 sm:px-5 sm:py-4">
                        <div className="font-medium text-forne-ink">{invoice.invoiceNo}</div>
                        <div className="mt-1 text-xs text-forne-muted">Cliente {invoice.billToCustomerNo}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-forne-ink sm:px-5 sm:py-4">
                        {formatMoney(invoice.amountIncludingVat, invoice.currencyCode)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                          (invoice.remainingAmount ?? 0) > 0
                            ? "bg-amber-50 text-amber-800 ring-amber-200"
                            : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                        }`}>
                          {(invoice.remainingAmount ?? 0) > 0 ? "Pendiente" : "Pagada"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <DataSectionHeader
          kicker="Contactos útiles"
          title="Teléfonos y emails de interés"
          description="Accesos rápidos a los canales de contacto más relevantes para tu contrato y tus gestiones."
        />

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
        <DataSectionHeader
          kicker="Noticias y avisos"
          title="Información destacada"
          description="Últimos comunicados y avisos relevantes publicados para el portal."
        />

        {newsItems.length === 0 ? (
          <div className="ffo-portal-card rounded-[30px] px-6 py-8 text-sm text-forne-muted">
            No hay noticias publicadas en este momento.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {newsItems.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="ffo-portal-card rounded-[30px] p-6"
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
