import "server-only";

import { isCurrentPortalAdmin } from "@/lib/portal/admin-auth";
import { isDocumentReviewed } from "@/lib/portal/document-review";
import { getDocuments } from "@/lib/portal/documents.service";
import { getIncidentRequests } from "@/lib/portal/incident-requests.service";
import { getIncidentById, getIncidents } from "@/lib/portal/incidents.service";
import { getInvoiceById, getInvoices } from "@/lib/portal/invoices.service";
import { getMe } from "@/lib/portal/me.service";
import { getTenantMyNotices } from "@/lib/portal/tenant-my-notices.service";
import { getContracts } from "@/lib/portal/contracts.service";

type ChatLink = {
  href: string;
  label: string;
};

export type PortalIntentType =
  | "maintenance_incident"
  | "urgent_incident"
  | "invoice_question"
  | "contract_question"
  | "document_request"
  | "support_request"
  | "general_chat";

export type PortalIntentUrgency = "low" | "medium" | "high" | "critical";

export interface PortalIntentMetadata {
  type: PortalIntentType;
  confidence: number;
  urgency?: PortalIntentUrgency;
  matchedSignals?: string[];
}

export interface PortalIncidentDraft {
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  urgency: PortalIntentUrgency;
  description: string;
  suggestedNextStep?: string;
}

export interface PortalAction {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
}

export type PortalChatReply = {
  answer: string;
  links: ChatLink[];
  suggestions: string[];
  canEscalate?: boolean;
  intent?: PortalIntentMetadata;
  incidentDraft?: PortalIncidentDraft | null;
  actions?: PortalAction[];
};

export type PortalChatHistoryItem = {
  role: "assistant" | "user";
  content: string;
};

export type PortalPageContext = {
  pageTitle?: string;
  pageSummary?: string;
  pageEyebrow?: string;
  visibleFacts?: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
  visibleSections?: Array<{
    title: string;
    summary: string;
  }>;
  visibleUpdates?: Array<{
    date?: string;
    text: string;
  }>;
};

type ChatContext = {
  page: string;
  message: string;
  normalizedMessage: string;
  history: PortalChatHistoryItem[];
  normalizedHistory: string;
  pageContext: PortalPageContext;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function dedupeSuggestions(values: string[]) {
  return [...new Set(values.filter(Boolean))].slice(0, 4);
}

function conciergeWrap(summary: string, nextStep: string) {
  return `${summary} Mi recomendacion ahora es ${nextStep}.`;
}

function conversationReply(summary: string, nextStep: string) {
  return `${summary}\n\nSiguiente paso recomendado: ${nextStep}.`;
}

function executiveReply(summary: string, nextStep: string, priority?: string) {
  return `${priority ? `Prioridad ahora: ${priority}.\n\n` : ""}${summary}\n\nSiguiente paso recomendado: ${nextStep}.`;
}

function cleanDate(value: string | null | undefined) {
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

function pagePrimaryLink(page: string): ChatLink {
  if (page.startsWith("/portal/invoices")) return { href: "/portal/invoices", label: "Ir a facturas" };
  if (page.startsWith("/portal/incidents")) return { href: "/portal/incidents", label: "Ir a incidencias" };
  if (page.startsWith("/portal/documents")) return { href: "/portal/documents", label: "Ir a documentos" };
  if (page.startsWith("/portal/incident-requests")) return { href: "/portal/incident-requests", label: "Ir a peticiones" };
  if (page.startsWith("/portal/notices")) return { href: "/portal/notices", label: "Ir a avisos" };
  if (page.startsWith("/portal/profile")) return { href: "/portal/profile", label: "Ir a perfil" };
  return { href: "/portal", label: "Ir al resumen" };
}

function pageSectionLink(page: string, sectionId: string, label: string): ChatLink {
  return { href: `${page}#${sectionId}`, label };
}

function pageSuggestions(page: string) {
  if (page.startsWith("/portal/invoices")) {
    return [
      "Tengo facturas pendientes",
      "Como descargar una factura",
      "Como descargar las ultimas 3 facturas",
      "Como pido una copia de factura",
      "Que significa el estado de una factura"
    ];
  }

  if (page.startsWith("/portal/incidents")) {
    return [
      "Quiero abrir una incidencia",
      "Que datos debo indicar en una incidencia",
      "Cuantas incidencias tengo abiertas"
    ];
  }

  if (page.startsWith("/portal/documents")) {
    return [
      "Como descargar un documento",
      "Que documentos puedo descargar",
      "Como pido una copia de un documento",
      "Tengo documentos pendientes"
    ];
  }

  if (page.startsWith("/portal/incident-requests")) {
    return [
      "Que peticiones tengo pendientes",
      "Donde veo la respuesta de una peticion",
      "Como ver el texto completo de la respuesta",
      "Donde veo si una peticion genero incidencia"
    ];
  }

  if (page.startsWith("/portal/notices")) {
    return [
      "Tengo avisos sin leer",
      "Que significa confirmacion requerida",
      "Donde reviso mis avisos"
    ];
  }

  if (page.startsWith("/portal/profile")) {
    return [
      "Que datos puedo revisar aqui",
      "Que empresa usa el portal",
      "Como actualizo mis datos"
    ];
  }

  return [
    "Resume mi situacion actual",
    "Tengo algo pendiente",
    "Que puedo hacer desde el portal"
  ];
}

function pageConciergeTip(page: string) {
  if (page.startsWith("/portal/invoices")) return "centrarte en vencimientos, copias y descargas oficiales";
  if (page.startsWith("/portal/incidents")) return "priorizar apertura, seguimiento y contacto asociado";
  if (page.startsWith("/portal/documents")) return "localizar documentos descargables o pedir copia";
  if (page.startsWith("/portal/incident-requests")) return "seguir respuestas y referencias creadas";
  if (page.startsWith("/portal/notices")) return "revisar lecturas pendientes y confirmaciones";
  if (page.startsWith("/portal/profile")) return "confirmar datos de acceso y entorno";
  return "ordenar prioridades y llevarte a la seccion adecuada";
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function recentUserMessages(history: PortalChatHistoryItem[]) {
  return history
    .filter((item) => item.role === "user")
    .slice(-4)
    .map((item) => normalizeText(item.content));
}

function resolveTopic(context: ChatContext) {
  const combined = `${context.normalizedMessage} ${context.normalizedHistory}`.trim();

  if (includesAny(combined, ["factura", "facturas", "recibo", "recibos", "vencimiento", "pdf"])) return "invoices";
  if (includesAny(combined, ["incidencia", "incidencias", "averia", "averias", "siniestro", "reparacion"])) return "incidents";
  if (includesAny(combined, ["documento", "documentos", "archivo", "archivos", "adjunto", "adjuntos"])) return "documents";
  if (includesAny(combined, ["peticion", "peticiones", "solicitud", "solicitudes", "respuesta"])) return "incident-requests";
  if (includesAny(combined, ["aviso", "avisos", "lectura", "confirmacion"])) return "notices";
  if (includesAny(combined, ["perfil", "cliente", "empresa", "business central"])) return "profile";
  return null;
}

function messageNeedsContext(normalizedMessage: string) {
  return includesAny(normalizedMessage, [
    "y eso",
    "y esto",
    "y como",
    "como lo hago",
    "como hago eso",
    "donde",
    "cual",
    "que mas",
    "y copia",
    "y descargar",
    "y abrir",
    "vale",
    "ok",
    "perfecto"
  ]);
}

function withResolvedTopic(context: ChatContext) {
  const topic = resolveTopic(context);
  if (!topic || !messageNeedsContext(context.normalizedMessage)) return context;

  const prefixByTopic: Record<string, string> = {
    invoices: "facturas ",
    incidents: "incidencias ",
    documents: "documentos ",
    "incident-requests": "peticiones ",
    notices: "avisos ",
    profile: "perfil "
  };

  return {
    ...context,
    normalizedMessage: `${prefixByTopic[topic] || ""}${context.normalizedMessage}`.trim()
  };
}

function currentInvoiceId(page: string) {
  const match = page.match(/^\/portal\/invoices\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function currentIncidentId(page: string) {
  const match = page.match(/^\/portal\/incidents\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function loadCurrentInvoice(page: string) {
  const id = currentInvoiceId(page);
  if (!id) return null;
  return getInvoiceById(id);
}

async function loadCurrentIncident(page: string) {
  const id = currentIncidentId(page);
  if (!id) return null;
  return getIncidentById(id);
}

function buildWelcomeReply(page: string, isAdmin: boolean): PortalChatReply {
  const base = isAdmin
    ? "Puedo orientarte sobre usuarios, noticias, avisos, facturas e incidencias del portal."
    : "Puedo ayudarte a entender tus avisos, facturas, incidencias y el uso del portal.";

  return {
    answer: `${base} Desde aqui puedo ${pageConciergeTip(page)} y, si hace falta, ayudarte a escalar la consulta al equipo humano.`,
    links: page.startsWith("/portal") ? [{ href: page, label: "Seccion actual" }] : [{ href: "/portal", label: "Ir a inicio del portal" }],
    suggestions: pageSuggestions(page)
  };
}

function invoiceStatusSummary(pendingCount: number, totalPendingAmount: number, currencyCode: string | null | undefined) {
  const amount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode || "EUR"
  }).format(totalPendingAmount);

  if (pendingCount === 0) {
    return "No veo facturas pendientes ahora mismo en tu portal.";
  }

  if (pendingCount === 1) {
    return `Veo 1 factura pendiente por ${amount}. Puedes entrar en Facturas para revisar vencimiento, detalle o pedir copia.`;
  }

  return `Veo ${pendingCount} facturas pendientes por un total aproximado de ${amount}. Puedes revisarlas desde Facturas y pedir copia si la necesitas.`;
}

function unresolvedIncidentsSummary(openCount: number) {
  if (openCount === 0) {
    return "Ahora mismo no veo incidencias abiertas en tu portal.";
  }

  if (openCount === 1) {
    return "Tienes 1 incidencia abierta. Desde Incidencias puedes revisar su detalle y seguimiento.";
  }

  return `Tienes ${openCount} incidencias abiertas. Desde Incidencias puedes revisar el estado de cada una y abrir una nueva si hace falta.`;
}

function documentsSummary(downloadableCount: number, totalCount: number, pendingReview: number) {
  if (totalCount === 0) {
    return "Ahora mismo no veo documentos publicados para tu perfil en el portal.";
  }

  if (downloadableCount === 0) {
    return `Veo ${totalCount} documento(s) publicado(s), pero ninguno con descarga directa ahora mismo.`;
  }

  return `Veo ${totalCount} documento(s) en portal, ${downloadableCount} con descarga disponible y ${pendingReview} pendiente(s) o sin revisar.`;
}

function incidentRequestStatusLabel(status: string | null | undefined, createdIncidentNo: string | null | undefined) {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "error") return "Error";
  if (["created", "new", "pending"].includes(normalized)) return "Pendiente";
  if (["active", "processing", "inprogress", "in progress"].includes(normalized)) return "En curso";
  if (["resolved", "closed", "completed"].includes(normalized)) return "Cerrada";
  if (createdIncidentNo) return "Tramitada";

  return status || "Sin estado";
}

function incidentRequestsSummary(pendingCount: number, inProgressCount: number, processedCount: number) {
  if (pendingCount === 0 && inProgressCount === 0 && processedCount === 0) {
    return "Ahora mismo no veo peticiones de incidencia registradas en tu portal.";
  }

  return `Veo ${pendingCount} peticion(es) pendiente(s), ${inProgressCount} en curso y ${processedCount} con incidencia creada o referencia interna.`;
}

function describeVisiblePageContext(pageContext: PortalPageContext) {
  const parts = [pageContext.pageEyebrow, pageContext.pageTitle, pageContext.pageSummary].filter(Boolean);
  return parts.join(". ");
}

function findVisibleFact(pageContext: PortalPageContext, terms: string[]) {
  const facts = pageContext.visibleFacts || [];

  return facts.find((fact) => {
    const normalizedLabel = normalizeText(fact.label);
    return terms.some((term) => normalizedLabel.includes(term));
  });
}

function describeVisibleFact(fact: { label: string; value: string; helper?: string }) {
  return `${fact.label}: ${fact.value}${fact.helper ? `. ${fact.helper}` : ""}`;
}

function visibleFactsSummary(pageContext: PortalPageContext, limit = 4) {
  return (pageContext.visibleFacts || [])
    .slice(0, limit)
    .map(describeVisibleFact)
    .join(" ");
}

function findVisibleSection(pageContext: PortalPageContext, terms: string[]) {
  const sections = pageContext.visibleSections || [];

  return sections.find((section) => {
    const normalizedTitle = normalizeText(section.title);
    return terms.some((term) => normalizedTitle.includes(term));
  });
}

function latestVisibleUpdate(pageContext: PortalPageContext) {
  return (pageContext.visibleUpdates || [])[0];
}

export async function buildPortalChatReply(
  page: string,
  rawMessage: string,
  history: PortalChatHistoryItem[] = [],
  pageContext: PortalPageContext = {}
): Promise<PortalChatReply> {
  const isAdmin = await isCurrentPortalAdmin();
  const message = rawMessage.trim();
  const normalizedHistory = recentUserMessages(history).join(" ");
  const normalizedMessage = normalizeText(message);
  const context = withResolvedTopic({
    page,
    message,
    normalizedMessage,
    history,
    normalizedHistory,
    pageContext
  });

  if (!message) {
    return buildWelcomeReply(page, isAdmin);
  }

  if (includesAny(context.normalizedMessage, ["hola", "buenas", "ayuda", "empezar"])) {
    return buildWelcomeReply(page, isAdmin);
  }

  if (page.startsWith("/portal/contracts")) {
    const contractFact = findVisibleFact(pageContext, ["contrato"]);
    const statusFact = findVisibleFact(pageContext, ["estado"]);
    const nextBillingFact = findVisibleFact(pageContext, ["proxima facturacion", "facturacion", "proxima"]);
    const endFact = findVisibleFact(pageContext, ["fin de contrato", "fin"]);
    const equipmentFact = findVisibleFact(pageContext, ["equipamiento"]);
    const visibleSummary = visibleFactsSummary(pageContext, 5);

    if (
      includesAny(context.normalizedMessage, [
        "que es importante aqui",
        "que tengo importante aqui",
        "que debo revisar aqui",
        "que revisar primero",
        "que me recomiendas revisar",
        "por donde empiezo",
        "que es lo principal"
      ])
    ) {
      const focusItems = [
        nextBillingFact ? `${nextBillingFact.label.toLowerCase()}: ${nextBillingFact.value}` : "",
        endFact ? `${endFact.label.toLowerCase()}: ${endFact.value}` : "",
        statusFact ? `${statusFact.label.toLowerCase()}: ${statusFact.value}` : "",
        contractFact ? `contrato principal: ${contractFact.value}` : ""
      ].filter(Boolean);

        return {
          answer: executiveReply(
            `${
              pageContext.pageSummary
                ? `${pageContext.pageSummary} `
                : "Esta ficha funciona como expediente operativo, contractual y economico del inmueble. "
            }${
            focusItems.length > 0
              ? `Ahora mismo lo mas relevante que veo es ${focusItems.join(", ")}.`
              : visibleSummary
                ? `Ahora mismo lo mas relevante visible es ${visibleSummary}`
                : "Ahora mismo conviene mirar primero contrato, estado y fechas clave."
          }`,
          nextBillingFact
            ? "empezar por la proxima facturacion y despues confirmar estado y fin de contrato"
            : endFact
              ? "empezar por estado y fin de contrato para tener una lectura ejecutiva rapida"
              : "empezar por el contrato principal y la situacion operativa del inmueble"
            ,
            nextBillingFact ? "proxima facturacion" : "estado y contrato"
          ),
          links: [
            pageSectionLink(page, "contract-dossier", "Ver hitos clave"),
            pageSectionLink(page, "contract-overview", "Volver arriba"),
            { href: "/portal/invoices", label: "Ir a facturas" }
          ],
        suggestions: dedupeSuggestions([
          "Cual es el estado del inmueble",
          "Cual es la proxima facturacion",
          "Cuando termina el contrato",
          "Cual es el contrato principal"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["estado del inmueble", "estado", "situacion", "como esta el inmueble"])) {
      if (statusFact) {
        return {
          answer: executiveReply(
            `En la ficha visible del inmueble figura ${statusFact.value}. ${statusFact.helper || "Es la situacion operativa actual que muestra el portal."}`,
            contractFact ? `usar como referencia el contrato ${contractFact.value} si quieres seguir profundizando en esta ficha` : "seguir con la ficha contractual si quieres mas detalle",
            "estado operativo"
          ),
          links: [
            pageSectionLink(page, "contract-dossier", "Ver resumen contractual"),
            { href: "/portal", label: "Ir al resumen" }
          ],
          suggestions: dedupeSuggestions([
            "Cual es el contrato principal",
            "Cuando termina el contrato",
            "Cual es la proxima facturacion"
          ])
        };
      }
    }

    if (includesAny(context.normalizedMessage, ["contrato principal", "cual es el contrato", "numero de contrato", "contrato"])) {
      if (contractFact) {
        return {
          answer: executiveReply(
            `La referencia contractual visible en esta ficha es ${contractFact.value}. ${contractFact.helper || "Es el contrato principal vinculado al activo."}`,
            nextBillingFact ? `revisar despues ${nextBillingFact.label.toLowerCase()} para completar la lectura ejecutiva` : "seguir con el estado y las fechas clave del inmueble",
            "contrato principal"
          ),
          links: [
            pageSectionLink(page, "contract-dossier", "Ver contrato y fechas")
          ],
          suggestions: dedupeSuggestions([
            "Cual es el estado del inmueble",
            "Cuando termina el contrato",
            "Cual es la proxima facturacion"
          ])
        };
      }
    }

    if (includesAny(context.normalizedMessage, ["proxima facturacion", "siguiente facturacion", "cuando facturan", "vencimiento", "proximo recibo"])) {
      if (nextBillingFact) {
        return {
          answer: executiveReply(
            `En la informacion visible del inmueble aparece ${nextBillingFact.value} como ${nextBillingFact.label.toLowerCase()}. ${nextBillingFact.helper || "Es el siguiente hito economico registrado en el portal."}`,
            "usar esa fecha como siguiente punto de control economico",
            "siguiente hito economico"
          ),
          links: [
            pageSectionLink(page, "contract-dossier", "Ver hitos del inmueble"),
            { href: "/portal/invoices", label: "Ir a facturas" }
          ],
          suggestions: dedupeSuggestions([
            "Cual es el estado del inmueble",
            "Cuando termina el contrato",
            "Resume mi situacion actual"
          ])
        };
      }
    }

    if (includesAny(context.normalizedMessage, ["fin de contrato", "cuando termina", "cuando acaba", "vencimiento del contrato"])) {
      if (endFact) {
        return {
          answer: executiveReply(
            `La fecha visible de fin de contrato es ${endFact.value}. ${endFact.helper || "Es la fecha contractual relevante para seguimiento."}`,
            nextBillingFact ? "comparar tambien la proxima facturacion si estas revisando calendario economico y contractual" : "usar esta fecha como referencia principal del expediente",
            "calendario contractual"
          ),
          links: [
            pageSectionLink(page, "contract-dossier", "Ver calendario contractual")
          ],
          suggestions: dedupeSuggestions([
            "Cual es el contrato principal",
            "Cual es la proxima facturacion",
            "Cual es el estado del inmueble"
          ])
        };
      }
    }

    if (includesAny(context.normalizedMessage, ["equipamiento", "equipamientos", "cuantos equipos", "elementos registrados"])) {
      if (equipmentFact) {
        return {
          answer: conversationReply(
            `En la ficha visible aparecen ${equipmentFact.value} ${equipmentFact.helper ? equipmentFact.helper.toLowerCase() : "elementos registrados"}.`,
            "bajar en la ficha si quieres revisar el detalle tecnico del activo"
          ),
          links: [{ href: page, label: "Ver inmueble" }],
          suggestions: dedupeSuggestions([
            "Cual es el estado del inmueble",
            "Cual es el contrato principal",
            "Cuando termina el contrato"
          ])
        };
      }
    }
  }

  if (includesAny(context.normalizedMessage, ["hablar con alguien", "persona", "humano", "asesor", "contacto", "llamar", "correo", "email"])) {
    return {
      answer:
        "Si prefieres atencion humana, puedo ayudarte a escalar la consulta por correo al equipo del portal. Si la duda ya es concreta, escribela aqui y te orientare antes de derivarla para ahorrar tiempo.",
      links: [
        pagePrimaryLink(page),
        { href: "/portal/profile", label: "Ver perfil" }
      ],
      suggestions: dedupeSuggestions([
        "Resume mi situacion actual",
        "Tengo facturas pendientes",
        "Quiero abrir una incidencia",
        "Tengo avisos sin leer"
      ]),
      canEscalate: true
    };
  }

  if (includesAny(context.normalizedMessage, ["resumen", "pendiente", "situacion actual"])) {
    const currentInvoice = await loadCurrentInvoice(page);
    if (currentInvoice) {
      const remaining = currentInvoice.remainingAmount || 0;
      return {
        answer: conversationReply(
          `Estas dentro de la factura ${currentInvoice.invoiceNo || currentInvoice.id}. Ahora mismo figura ${remaining > 0 ? `pendiente por ${formatMoney(remaining, currentInvoice.currencyCode)}` : "sin importe pendiente"} y con vencimiento ${cleanDate(currentInvoice.dueDate)}.`,
          remaining > 0 ? "revisar el detalle o descargar el PDF de esta factura" : "usar esta ficha como comprobante o pedir copia si la necesitas"
        ),
        links: [
          { href: page, label: "Ver esta factura" },
          { href: "/portal/invoices", label: "Todas las facturas" }
        ],
        suggestions: dedupeSuggestions([
          "Como descargar una factura",
          "Como pido una copia de factura",
          "Que significa el estado de una factura"
        ])
      };
    }

    const currentIncident = await loadCurrentIncident(page);
    if (currentIncident) {
      const status = currentIncident.stateCode === "Active" ? "abierta" : currentIncident.stateCode || "sin estado";
      return {
        answer: conversationReply(
          `Estas dentro de la incidencia ${currentIncident.incidentId || currentIncident.id}. Ahora mismo figura ${status}, vinculada al contrato ${currentIncident.contractNo || "-"} y con seguimiento de referencia el ${cleanDate(currentIncident.followupBy || currentIncident.expectedResolutionDate)}.`,
          status === "abierta" ? "revisar comentarios, seguimiento y siguientes acciones de esta incidencia" : "usar esta ficha como expediente de referencia"
        ),
        links: [
          { href: page, label: "Ver esta incidencia" },
          { href: "/portal/incidents", label: "Todas las incidencias" }
        ],
        suggestions: dedupeSuggestions([
          "Cuantas incidencias tengo abiertas",
          "Que datos debo indicar en una incidencia",
          "Quiero abrir una incidencia"
        ])
      };
    }

    const [me, invoices, incidents, notices] = await Promise.all([
      getMe(),
      getInvoices(),
      getIncidents(),
      getTenantMyNotices().catch(() => [])
    ]);
    const pendingInvoices = invoices.filter((invoice) => (invoice.remainingAmount || 0) > 0);
    const unreadNotices = notices.filter((notice) => notice.isUnread).length;
    const openIncidents = incidents.filter((incident) => incident.stateCode === "Active").length;

    return {
      answer: conciergeWrap(
        `${me.customerName ? `${me.customerName}, ` : ""}ahora mismo veo ${pendingInvoices.length} factura(s) pendiente(s), ${openIncidents} incidencia(s) abierta(s) y ${unreadNotices} aviso(s) sin leer`,
        unreadNotices > 0
          ? "empezar por Avisos para confirmar lecturas y despejar prioridades"
          : pendingInvoices.length > 0
            ? "pasar por Facturas para revisar vencimientos e importes abiertos"
            : openIncidents > 0
              ? "revisar Incidencias para comprobar el seguimiento activo"
              : "usar el resumen del portal como punto de control general"
      ),
      links: [
        { href: "/portal/invoices", label: "Ver facturas" },
        { href: "/portal/incidents", label: "Ver incidencias" },
        { href: "/portal/notices", label: "Ver avisos" }
      ],
      suggestions: dedupeSuggestions([
        "Tengo facturas pendientes",
        "Cuantas incidencias tengo abiertas",
        "Como descargar un documento",
        "Tengo avisos sin leer",
        ...pageSuggestions(page)
      ])
    };
  }

  if (includesAny(context.normalizedMessage, ["factura", "facturas", "recibo", "recibos", "vencimiento", "copia", "pdf", "pagada", "pendiente"])) {
    const currentInvoice = await loadCurrentInvoice(page);
    if (currentInvoice) {
      const remaining = currentInvoice.remainingAmount || 0;
      const statusLabel = remaining > 0 ? "Pendiente" : "Pagada";
      const readingSection = findVisibleSection(pageContext, ["lectura recomendada"]);
      const timelineSection = findVisibleSection(pageContext, ["fechas", "cronologia"]);

      if (
        includesAny(context.normalizedMessage, [
          "que es importante aqui",
          "que tengo importante aqui",
          "que debo revisar aqui",
          "que revisar primero",
          "que me recomiendas revisar",
          "por donde empiezo",
          "que es lo principal"
        ])
      ) {
        return {
          answer: executiveReply(
            `En esta factura, ${currentInvoice.invoiceNo || currentInvoice.id}, lo mas importante es su estado ${statusLabel.toLowerCase()}, el importe pendiente de ${formatMoney(remaining, currentInvoice.currencyCode)} y el vencimiento ${cleanDate(currentInvoice.dueDate)}.${readingSection ? ` ${readingSection.summary}` : ""}${timelineSection ? ` ${timelineSection.summary}` : ""}`,
            remaining > 0
              ? "empezar por confirmar vencimiento e importe pendiente y despues decidir si necesitas PDF o copia"
              : "empezar por descargar el justificante solo si necesitas comprobante",
            remaining > 0 ? "vencimiento e importe pendiente" : "justificante y archivo"
          ),
          links: [
            pageSectionLink(page, "invoice-summary", "Ver importes"),
            pageSectionLink(page, "invoice-timeline", "Ver fechas"),
            { href: "/portal/invoices", label: "Todas las facturas" }
          ],
          suggestions: dedupeSuggestions([
            "Que significa el estado de una factura",
            "Como descargar una factura",
            "Como pido una copia de factura"
          ])
        };
      }

      if (includesAny(context.normalizedMessage, ["proxima fecha exacta", "fecha exacta", "siguiente fecha"])) {
        return {
          answer: executiveReply(
            `La fecha exacta que veo como referencia en esta factura es ${cleanDate(currentInvoice.dueDate)}.`,
            remaining > 0 ? "usar ese vencimiento como prioridad de control economico" : "usar esa fecha como referencia documental",
            "vencimiento"
          ),
          links: [pageSectionLink(page, "invoice-timeline", "Ver cronología")],
          suggestions: dedupeSuggestions([
            "Que es importante aqui",
            "Como descargar una factura",
            "Que significa el estado de una factura"
          ])
        };
      }

      if (includesAny(context.normalizedMessage, ["copia", "pdf", "descargar"])) {
        return {
          answer: executiveReply(
            `En esta factura concreta, ${currentInvoice.invoiceNo || currentInvoice.id}, lo normal es empezar por el PDF oficial si esta disponible. Si no te basta o no aparece, puedes usar la accion de copia desde la propia ficha.`,
            "quedarte en esta factura y revisar primero sus acciones de descarga o copia",
            "descarga o copia"
          ),
          links: [
            pageSectionLink(page, "invoice-overview", "Ver acciones"),
            { href: "/portal/invoices", label: "Ver facturas" }
          ],
          suggestions: dedupeSuggestions([
            "Que significa el estado de una factura",
            "Tengo facturas pendientes",
            "Resume mi situacion actual"
          ])
        };
      }

      return {
        answer: conversationReply(
          `La factura ${currentInvoice.invoiceNo || currentInvoice.id} esta ${statusLabel.toLowerCase()}. Importe total: ${formatMoney(currentInvoice.amountIncludingVat, currentInvoice.currencyCode)}. Importe pendiente: ${formatMoney(remaining, currentInvoice.currencyCode)}. Vencimiento: ${cleanDate(currentInvoice.dueDate)}.`,
          remaining > 0 ? "revisar esta factura antes que el resto si quieres priorizar lo pendiente" : "descargarla o pedir copia solo si necesitas justificante"
        ),
        links: [
          { href: page, label: "Ver esta factura" },
          { href: "/portal/invoices", label: "Todas las facturas" }
        ],
        suggestions: dedupeSuggestions([
          "Como descargar una factura",
          "Como pido una copia de factura",
          "Que significa el estado de una factura"
        ])
      };
    }

    const invoices = await getInvoices();
    const pendingInvoices = invoices.filter((invoice) => (invoice.remainingAmount || 0) > 0);
    const totalPendingAmount = pendingInvoices.reduce((sum, invoice) => sum + (invoice.remainingAmount || 0), 0);

    if (includesAny(context.normalizedMessage, ["ultimas 3", "ultimas tres", "descargar las ultimas", "descargar ultimas"])) {
      return {
        answer: conversationReply(
          "Desde la seccion Facturas veras un boton para descargar las ultimas 3 facturas con PDF oficial disponible. Al pulsarlo, el portal prepara la descarga y lanza los archivos automaticamente",
          "entrar en Facturas y usar la descarga rapida si quieres ahorrar pasos"
        ),
        links: [
          { href: "/portal/invoices", label: "Ir a facturas" }
        ],
        suggestions: dedupeSuggestions([
          "Como descargar una factura",
          "Como pido una copia de factura",
          "Que significa el estado de una factura"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["descargar una factura", "bajar una factura", "descargar factura"])) {
      return {
        answer: conversationReply(
          "Para descargar una factura, entra en Facturas, abre el detalle de la factura que te interesa y pulsa la accion de ver o descargar el PDF oficial. Si esa factura no tiene PDF oficial disponible, puedes usar el boton de peticion de copia",
          "localizar primero la factura concreta y despues revisar sus acciones en el detalle"
        ),
        links: [
          { href: "/portal/invoices", label: "Abrir facturas" }
        ],
        suggestions: dedupeSuggestions([
          "Como descargar las ultimas 3 facturas",
          "Como pido una copia de factura",
          "Tengo facturas pendientes"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["copia", "pdf"])) {
      return {
        answer: conversationReply(
          "Desde la seccion Facturas puedes entrar al detalle de cada factura o usar el boton de copia para solicitarla rapidamente. Si buscas un PDF concreto, lo normal es abrir la factura y revisar sus acciones disponibles",
          "usar primero el PDF oficial y dejar la peticion de copia para los casos sin descarga directa"
        ),
        links: [
          { href: "/portal/invoices", label: "Ir a facturas" }
        ],
        suggestions: dedupeSuggestions([
          "Como descargar una factura",
          "Como descargar las ultimas 3 facturas",
          "Tengo facturas pendientes",
          "Que significa el estado de una factura",
          "Resume mi situacion actual"
        ])
      };
    }

    return {
      answer: `${conversationReply(invoiceStatusSummary(pendingInvoices.length, totalPendingAmount, invoices[0]?.currencyCode),
        pendingInvoices.length > 0
          ? "revisar primero las facturas que siguen pendientes de pago"
          : "entrar igualmente en Facturas si necesitas una copia o un comprobante"
      )}`,
      links: [
        { href: "/portal/invoices", label: "Abrir facturas" }
      ],
      suggestions: dedupeSuggestions([
        "Como descargar una factura",
        "Como descargar las ultimas 3 facturas",
        "Como pido una copia de factura",
        "Que significa el estado de una factura",
        ...pageSuggestions("/portal/invoices")
      ])
    };
  }

  if (includesAny(context.normalizedMessage, ["peticion", "peticiones", "solicitud", "solicitudes", "respuesta", "texto completo"])) {
    const incidentRequests = await getIncidentRequests();
    const pendingCount = incidentRequests.filter((request) => incidentRequestStatusLabel(request.status, request.createdIncidentNo) === "Pendiente").length;
    const inProgressCount = incidentRequests.filter((request) => incidentRequestStatusLabel(request.status, request.createdIncidentNo) === "En curso").length;
    const processedCount = incidentRequests.filter((request) => request.createdIncidentNo).length;
    const answeredCount = incidentRequests.filter((request) => Boolean(request.portalDecisionMessage)).length;

    if (includesAny(context.normalizedMessage, ["pendiente", "pendientes"])) {
      return {
        answer: conversationReply(
          pendingCount > 0
            ? `Tienes ${pendingCount} peticion(es) pendiente(s). En Peticiones puedes revisar su estado y, si ya existe una contestacion, verla en la columna Respuesta.`
            : "Ahora mismo no veo peticiones pendientes. Puedes entrar en Peticiones para revisar el historico y comprobar si alguna ya tiene respuesta o incidencia creada.",
          pendingCount > 0 ? "abrir Peticiones y empezar por las que siguen pendientes" : "revisar el historico solo si buscas una referencia concreta"
        ),
        links: [{ href: "/portal/incident-requests", label: "Ver peticiones" }],
        suggestions: dedupeSuggestions([
          "Donde veo la respuesta de una peticion",
          "Como ver el texto completo de la respuesta",
          "Donde veo si una peticion genero incidencia",
          ...pageSuggestions("/portal/incident-requests")
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["respuesta", "ver la respuesta", "donde veo la respuesta"])) {
      return {
        answer: conversationReply(
          answeredCount > 0
            ? "La respuesta aparece en la columna Respuesta dentro del listado de Peticiones. Veras un resumen en la celda y, si existe mas texto, puedes abrirlo desde el enlace Ver texto completo."
            : "Ahora mismo no veo respuestas publicadas en tus peticiones. Aun asi, puedes entrar en Peticiones para revisar el estado y comprobar si se ha creado una incidencia asociada.",
          answeredCount > 0 ? "abrir Peticiones y fijarte en la columna Respuesta" : "revisar tambien la columna Referencia creada por si ya existe una incidencia asociada"
        ),
        links: [{ href: "/portal/incident-requests", label: "Abrir peticiones" }],
        suggestions: dedupeSuggestions([
          "Como ver el texto completo de la respuesta",
          "Donde veo si una peticion genero incidencia",
          "Que peticiones tengo pendientes"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["texto completo", "ver completo", "ver el texto completo"])) {
      return {
        answer: conversationReply(
          "En la columna Respuesta veras un extracto. Para leer todo el contenido, pulsa el enlace Ver texto completo dentro de la misma fila y el portal desplegara el mensaje completo sin salir de la pagina",
          "usar esa vista ampliada antes de decidir si la peticion necesita mas seguimiento"
        ),
        links: [{ href: "/portal/incident-requests", label: "Ir a peticiones" }],
        suggestions: dedupeSuggestions([
          "Donde veo la respuesta de una peticion",
          "Donde veo si una peticion genero incidencia",
          "Que peticiones tengo pendientes"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["genero incidencia", "ha generado incidencia", "referencia creada", "tramita", "tramitada"])) {
      return {
        answer: conversationReply(
          processedCount > 0
            ? "Cuando una peticion ya ha generado una incidencia o referencia interna, lo veras en la columna Referencia creada. Si aparece un codigo, puedes pulsarlo para abrir el detalle de la incidencia asociada."
            : "Todavia no veo peticiones con incidencia creada. Puedes revisar la columna Referencia creada en Peticiones para comprobar cuando se asigne una.",
          processedCount > 0 ? "abrir la incidencia enlazada si ya existe referencia creada" : "seguir primero el estado de la peticion hasta que se asigne una referencia"
        ),
        links: [
          { href: "/portal/incident-requests", label: "Ver peticiones" },
          { href: "/portal/incidents", label: "Ver incidencias" }
        ],
        suggestions: dedupeSuggestions([
          "Donde veo la respuesta de una peticion",
          "Como ver el texto completo de la respuesta",
          "Que peticiones tengo pendientes"
        ])
      };
    }

    return {
      answer: `${conversationReply(incidentRequestsSummary(pendingCount, inProgressCount, processedCount),
        answeredCount > 0
          ? "revisar primero las que ya tienen respuesta o referencia creada"
          : "seguir las pendientes desde la misma tabla hasta que llegue contestacion"
      )}`,
      links: [{ href: "/portal/incident-requests", label: "Abrir peticiones" }],
      suggestions: dedupeSuggestions([
        "Que peticiones tengo pendientes",
        "Donde veo la respuesta de una peticion",
        "Como ver el texto completo de la respuesta",
        "Donde veo si una peticion genero incidencia"
      ])
    };
  }

  if (includesAny(context.normalizedMessage, ["incidencia", "incidencias", "averia", "averias", "problema", "reparacion", "siniestro"])) {
    const currentIncident = await loadCurrentIncident(page);
    if (currentIncident) {
      const isOpen = currentIncident.stateCode === "Active";
      const commentsSection = findVisibleSection(pageContext, ["comentarios", "seguimiento narrativo"]);
      const coverageSection = findVisibleSection(pageContext, ["seguro", "cobertura"]);
      const latestUpdate = latestVisibleUpdate(pageContext);

      if (
        includesAny(context.normalizedMessage, [
          "que es importante aqui",
          "que tengo importante aqui",
          "que debo revisar aqui",
          "que revisar primero",
          "que me recomiendas revisar",
          "por donde empiezo",
          "que es lo principal"
        ])
      ) {
        return {
          answer: executiveReply(
            `En esta incidencia, ${currentIncident.title || currentIncident.incidentId || currentIncident.id}, lo principal es revisar si sigue ${isOpen ? "abierta" : currentIncident.stateCode || "sin estado visible"}, el contrato asociado ${currentIncident.contractNo || "-"} y la fecha de seguimiento ${cleanDate(currentIncident.followupBy || currentIncident.expectedResolutionDate)}.${commentsSection ? ` ${commentsSection.summary}` : ""}${coverageSection ? ` ${coverageSection.summary}` : ""}`,
            isOpen
              ? "empezar por estado y seguimiento antes de revisar comentarios o abrir otra incidencia"
              : "empezar por el historial y comprobar si ya no necesita ninguna accion",
            isOpen ? "estado y seguimiento" : "historial y cierre"
          ),
          links: [
            pageSectionLink(page, "incident-timeline", "Ver cronología"),
            pageSectionLink(page, "incident-comments", "Ver comentarios"),
            { href: "/portal/incidents", label: "Todas las incidencias" }
          ],
          suggestions: dedupeSuggestions([
            "Cuantas incidencias tengo abiertas",
            "Quiero abrir una incidencia",
            "Que datos debo indicar en una incidencia"
          ])
        };
      }

      if (includesAny(context.normalizedMessage, ["ultima nota", "ultimo comentario", "ultima actualizacion", "ultimo seguimiento"])) {
        if (latestUpdate) {
          return {
            answer: executiveReply(
              `${latestUpdate.date ? `La ultima actualizacion visible es del ${latestUpdate.date}. ` : ""}${latestUpdate.text}`,
              isOpen ? "usar esa ultima nota junto con la fecha de seguimiento para decidir el siguiente paso" : "tomarla como referencia final del expediente",
              "ultima actualizacion"
            ),
            links: [pageSectionLink(page, "incident-comments", "Abrir comentarios")],
            suggestions: dedupeSuggestions([
              "Que es importante aqui",
              "Cual es la proxima fecha exacta",
              "Cuantas incidencias tengo abiertas"
            ])
          };
        }
      }

      if (includesAny(context.normalizedMessage, ["proxima fecha exacta", "fecha exacta", "siguiente fecha", "proximo seguimiento"])) {
        return {
          answer: executiveReply(
            `La siguiente fecha visible de seguimiento para esta incidencia es ${cleanDate(currentIncident.followupBy || currentIncident.expectedResolutionDate)}.`,
            isOpen ? "usar esa fecha como siguiente punto de control operativo" : "tomarla como referencia de cierre o seguimiento final",
            "proximo control"
          ),
          links: [pageSectionLink(page, "incident-timeline", "Abrir cronología")],
          suggestions: dedupeSuggestions([
            "Ultimo comentario",
            "Que es importante aqui",
            "Quiero abrir una incidencia"
          ])
        };
      }

      if (includesAny(context.normalizedMessage, ["estado", "seguimiento", "abierta", "cerrada", "comentario"])) {
        return {
          answer: executiveReply(
            `Esta incidencia concreta, ${currentIncident.title || currentIncident.incidentId || currentIncident.id}, esta ${isOpen ? "abierta" : currentIncident.stateCode || "sin estado visible"}. Contrato asociado: ${currentIncident.contractNo || "-"}. Seguimiento de referencia: ${cleanDate(currentIncident.followupBy || currentIncident.expectedResolutionDate)}.`,
            isOpen ? "revisar comentarios y fechas de seguimiento antes de abrir otra incidencia" : "usar la ficha como historial y comprobar si ya no requiere accion",
            "seguimiento actual"
          ),
          links: [
            pageSectionLink(page, "incident-comments", "Ver comentarios"),
            pageSectionLink(page, "incident-timeline", "Ver seguimiento"),
            { href: "/portal/incidents", label: "Todas las incidencias" }
          ],
          suggestions: dedupeSuggestions([
            "Cuantas incidencias tengo abiertas",
            "Quiero abrir una incidencia",
            "Que datos debo indicar en una incidencia"
          ])
        };
      }
    }

    const incidents = await getIncidents();
    const openCount = incidents.filter((incident) => incident.stateCode === "Active").length;

    if (includesAny(context.normalizedMessage, ["abrir", "crear", "nueva"])) {
      return {
        answer: conversationReply(
          "Para abrir una incidencia, entra en Incidencias y completa el formulario con contrato, inmueble afectado, descripcion clara y telefono de contacto. Cuanto mas concreto seas, mas facil sera tramitarla",
          "preparar bien la descripcion y el telefono antes de enviar la incidencia"
        ),
        links: [
          { href: "/portal/incidents", label: "Abrir incidencias" }
        ],
        suggestions: dedupeSuggestions([
          "Que datos debo indicar en una incidencia",
          "Cuantas incidencias tengo abiertas",
          "Resume mi situacion actual"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["datos", "indicar", "poner"])) {
      return {
        answer: conversationReply(
          "Lo ideal es indicar contrato, zona afectada, que ocurre exactamente, desde cuando pasa y un telefono de contacto. Si ya has hablado con alguien o hay urgencia, tambien conviene dejarlo por escrito",
          "dar contexto suficiente para evitar idas y vueltas en la tramitacion"
        ),
        links: [
          { href: "/portal/incidents", label: "Ir a incidencias" }
        ],
        suggestions: dedupeSuggestions([
          "Quiero abrir una incidencia",
          "Cuantas incidencias tengo abiertas",
          "Que puedo hacer desde el portal"
        ])
      };
    }

    return {
      answer: `${conversationReply(unresolvedIncidentsSummary(openCount),
        openCount > 0
          ? "entrar al detalle de la incidencia que requiera accion o seguimiento"
          : "abrir una nueva incidencia solo si necesitas reportar algo nuevo"
      )}`,
      links: [
        { href: "/portal/incidents", label: "Ver incidencias" }
      ],
      suggestions: dedupeSuggestions([
        "Quiero abrir una incidencia",
        "Que datos debo indicar en una incidencia",
        ...pageSuggestions("/portal/incidents")
      ])
    };
  }

  if (includesAny(context.normalizedMessage, ["documento", "documentos", "archivo", "archivos", "adjunto", "adjuntos", "descarga", "descargar"])) {
    const documents = await getDocuments();
    const downloadableDocuments = documents.filter((document) => document.hasAttachment && document.downloadAllowed !== false);
    const pendingReview = documents.filter((document) => !isDocumentReviewed(document)).length;

    if (includesAny(context.normalizedMessage, ["copia", "solicitar", "pedir"])) {
      return {
        answer: conversationReply(
          "Desde Documentos puedes descargar directamente los archivos publicados. Si un documento no tiene descarga disponible, puedes usar el boton de solicitar copia para que el equipo lo revise y te contacte si hace falta",
          "intentar primero la descarga directa y usar la copia cuando el archivo no este disponible"
        ),
        links: [
          { href: "/portal/documents", label: "Ir a documentos" }
        ],
        suggestions: dedupeSuggestions([
          "Como descargar un documento",
          "Que documentos puedo descargar",
          "Tengo documentos pendientes"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["descargar uno", "descargar un documento", "bajar un documento", "abrir un documento"])) {
      return {
        answer: conversationReply(
          "Para descargar un documento, entra en Documentos y pulsa 'Descargar documento' en la fila correspondiente. El portal pedirá el archivo al backend y lanzará la descarga sin depender del enlace externo",
          "localizar primero el documento exacto y revisar si tiene descarga disponible"
        ),
        links: [
          { href: "/portal/documents", label: "Abrir documentos" }
        ],
        suggestions: dedupeSuggestions([
          "Que documentos puedo descargar",
          "Como pido una copia de un documento",
          "Tengo documentos pendientes"
        ])
      };
    }

    if (includesAny(context.normalizedMessage, ["que documentos puedo descargar", "cuales puedo descargar", "descarga disponible"])) {
      return {
        answer: conversationReply(
          downloadableDocuments.length > 0
            ? `Ahora mismo veo ${downloadableDocuments.length} documento(s) con descarga disponible. Entra en Documentos y usa el boton de descarga de cada fila para bajar el archivo correspondiente.`
            : "Ahora mismo no veo documentos con descarga directa disponible. Si necesitas uno concreto, entra en Documentos y usa la opcion de solicitar copia.",
          downloadableDocuments.length > 0 ? "abrir Documentos y empezar por los que ya tienen descarga" : "pedir copia del documento concreto que necesites"
        ),
        links: [
          { href: "/portal/documents", label: "Ver documentos" }
        ],
        suggestions: dedupeSuggestions([
          "Como descargar un documento",
          "Como pido una copia de un documento",
          "Resume mi situacion actual"
        ])
      };
    }

    return {
      answer: `${conversationReply(documentsSummary(downloadableDocuments.length, documents.length, pendingReview),
        downloadableDocuments.length > 0
          ? "abrir Documentos y usar la descarga del archivo concreto que busques"
          : "usar la solicitud de copia si el archivo no aparece listo para descargar"
      )}`,
      links: [
        { href: "/portal/documents", label: "Abrir documentos" }
      ],
      suggestions: dedupeSuggestions([
        "Como descargar un documento",
        "Que documentos puedo descargar",
        "Como pido una copia de un documento",
        ...pageSuggestions("/portal/documents")
      ])
    };
  }

  if (includesAny(context.normalizedMessage, ["aviso", "avisos", "comunicado", "lectura", "confirmacion"])) {
    const notices = await getTenantMyNotices().catch(() => []);
    const unreadCount = notices.filter((notice) => notice.isUnread).length;
    const confirmationCount = notices.filter((notice) => notice.requiresReadConfirmation).length;

    if (includesAny(context.normalizedMessage, ["confirmacion", "requerida"])) {
      return {
        answer: conversationReply(
          "Confirmacion requerida significa que el portal espera que marques la lectura del aviso para dejar trazabilidad. No suele ser solo informativo: conviene entrar en Avisos y confirmar cuanto antes",
          "revisar primero esos avisos para despejar cualquier accion pendiente"
        ),
        links: [
          { href: "/portal/notices", label: "Revisar avisos" }
        ],
        suggestions: dedupeSuggestions([
          "Tengo avisos sin leer",
          "Donde reviso mis avisos",
          "Resume mi situacion actual"
        ])
      };
    }

    return {
      answer: conversationReply(
        unreadCount > 0 || confirmationCount > 0
          ? `Tienes ${unreadCount} aviso(s) sin leer y ${confirmationCount} con confirmacion requerida. La mejor siguiente accion es revisar Avisos y confirmar lectura donde se pida.`
          : "No veo avisos pendientes de revisar en este momento. Aun asi, puedes entrar en Avisos para comprobar el historico visible.",
        unreadCount > 0 || confirmationCount > 0 ? "abrir Avisos y empezar por los que piden confirmacion" : "usar Avisos como historico de comunicaciones cuando lo necesites"
      ),
      links: [
        { href: "/portal/notices", label: "Abrir avisos" }
      ],
      suggestions: dedupeSuggestions([
        "Que significa confirmacion requerida",
        "Donde reviso mis avisos",
        ...pageSuggestions("/portal/notices")
      ])
    };
  }

  if (includesAny(context.normalizedMessage, ["perfil", "datos", "email", "correo", "empresa", "tenant", "business central"])) {
    const me = await getMe();

    return {
      answer: conversationReply(
        `En Perfil puedes revisar tu nombre, email, numero de cliente y el entorno de Business Central asociado a tu acceso. ` +
        `${me.email ? `Ahora mismo tu acceso esta vinculado a ${me.email}.` : "Ahora mismo el portal no muestra un email asociado."}`,
        "entrar en Perfil si quieres confirmar tus datos de acceso o contexto de cliente"
      ),
      links: [
        { href: "/portal/profile", label: "Ver perfil" }
      ],
      suggestions: dedupeSuggestions([
        "Que datos puedo revisar aqui",
        "Que empresa usa el portal",
        "Resume mi situacion actual"
      ])
    };
  }

  if (includesAny(context.normalizedMessage, ["que puedo hacer", "como funciona", "portal"])) {
    if (page.startsWith("/portal/contracts")) {
      const contracts = await getContracts();
      const primaryContract = contracts[0];

      return {
        answer: conversationReply(
          primaryContract
            ? `Desde ${pageContext.pageTitle || "esta ficha contractual"} puedes revisar el contrato ${primaryContract.contractNo}, su proxima facturacion, fin de contrato y el contexto del inmueble asociado.`
            : `Desde ${pageContext.pageTitle || "esta seccion"} puedes revisar el contexto contractual, economico y operativo asociado a tu alquiler.`,
          "empezar por la referencia contractual y la proxima facturacion si buscas una lectura ejecutiva"
        ),
        links: [
          { href: "/portal/contracts", label: "Ver contrato" },
          { href: "/portal", label: "Volver al resumen" }
        ],
        suggestions: dedupeSuggestions([
          "Resume mi situacion actual",
          "Tengo facturas pendientes",
          "Cuantas incidencias tengo abiertas"
        ])
      };
    }

    return {
      answer:
        `${pageContext.pageTitle ? `Ahora mismo estas en ${pageContext.pageTitle}. ` : ""}${describeVisiblePageContext(pageContext) ? `Contexto visible: ${describeVisiblePageContext(pageContext)}. ` : ""}${visibleFactsSummary(pageContext) ? `Datos visibles destacados: ${visibleFactsSummary(pageContext)}. ` : ""}Desde el portal puedes revisar avisos, consultar facturas, descargar documentos, seguir incidencias y ver tu perfil. Mi trabajo aqui es llevarte a la seccion adecuada y decirte el siguiente paso mas util sin que tengas que buscarlo manualmente.`,
      links: [
        { href: "/portal", label: "Inicio del portal" },
        { href: "/portal/invoices", label: "Facturas" },
        { href: "/portal/documents", label: "Documentos" },
        { href: "/portal/incidents", label: "Incidencias" }
      ],
      suggestions: pageSuggestions(page)
    };
  }

  return {
    answer:
      "Todavia no entiendo esa consulta con suficiente detalle. Si quieres, reformulala con mas contexto o puedo ayudarte a escalarla por correo al equipo para que la revise contigo.",
    links: [
      { href: page.startsWith("/portal") ? page : "/portal", label: "Seguir en esta seccion" },
      pagePrimaryLink(page)
    ],
    suggestions: pageSuggestions(page),
    canEscalate: true
  };
}
