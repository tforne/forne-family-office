import "server-only";

import { isCurrentPortalAdmin } from "@/lib/portal/admin-auth";
import { getDocuments } from "@/lib/portal/documents.service";
import { getIncidentRequests } from "@/lib/portal/incident-requests.service";
import { getIncidents } from "@/lib/portal/incidents.service";
import { getInvoices } from "@/lib/portal/invoices.service";
import { getMe } from "@/lib/portal/me.service";
import { getTenantMyNotices } from "@/lib/portal/tenant-my-notices.service";

type ChatLink = {
  href: string;
  label: string;
};

export type PortalChatReply = {
  answer: string;
  links: ChatLink[];
  suggestions: string[];
  canEscalate?: boolean;
};

type ChatContext = {
  page: string;
  message: string;
  normalizedMessage: string;
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

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function buildWelcomeReply(page: string, isAdmin: boolean): PortalChatReply {
  const base = isAdmin
    ? "Puedo orientarte sobre usuarios, noticias, avisos, facturas e incidencias del portal."
    : "Puedo ayudarte a entender tus avisos, facturas, incidencias y el uso del portal.";

  return {
    answer: `${base} Escribe una pregunta o usa una sugerencia rápida para empezar.`,
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

export async function buildPortalChatReply(page: string, rawMessage: string): Promise<PortalChatReply> {
  const isAdmin = await isCurrentPortalAdmin();
  const message = rawMessage.trim();
  const normalizedMessage = normalizeText(message);
  const context: ChatContext = {
    page,
    message,
    normalizedMessage
  };

  if (!message) {
    return buildWelcomeReply(page, isAdmin);
  }

  if (includesAny(context.normalizedMessage, ["hola", "buenas", "ayuda", "empezar"])) {
    return buildWelcomeReply(page, isAdmin);
  }

  if (includesAny(context.normalizedMessage, ["resumen", "pendiente", "situacion actual"])) {
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
      answer:
        `${me.customerName ? `${me.customerName}, ` : ""}ahora mismo veo ${pendingInvoices.length} factura(s) pendiente(s), ${openIncidents} incidencia(s) abierta(s)` +
        ` y ${unreadNotices} aviso(s) sin leer. Si quieres, te indico el siguiente paso más útil.`,
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
    const invoices = await getInvoices();
    const pendingInvoices = invoices.filter((invoice) => (invoice.remainingAmount || 0) > 0);
    const totalPendingAmount = pendingInvoices.reduce((sum, invoice) => sum + (invoice.remainingAmount || 0), 0);

    if (includesAny(context.normalizedMessage, ["ultimas 3", "ultimas tres", "descargar las ultimas", "descargar ultimas"])) {
      return {
        answer:
          "Desde la seccion Facturas veras un boton para descargar las ultimas 3 facturas con PDF oficial disponible. Al pulsarlo, el portal prepara la descarga y lanza los archivos automaticamente.",
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
        answer:
          "Para descargar una factura, entra en Facturas, abre el detalle de la factura que te interesa y pulsa la accion de ver o descargar el PDF oficial. Si esa factura no tiene PDF oficial disponible, puedes usar el boton de peticion de copia.",
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
        answer:
          "Desde la seccion Facturas puedes entrar al detalle de cada factura o usar el boton de copia para solicitarla rapidamente. Si buscas un PDF concreto, lo normal es abrir la factura y revisar sus acciones disponibles.",
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
      answer: `${invoiceStatusSummary(pendingInvoices.length, totalPendingAmount, invoices[0]?.currencyCode)} ${
        pendingInvoices.length > 0
          ? "Si quieres, revisa primero las que siguen pendientes de pago."
          : "Si necesitas una copia, entra igualmente en Facturas."
      }`,
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
        answer:
          pendingCount > 0
            ? `Tienes ${pendingCount} peticion(es) pendiente(s). En Peticiones puedes revisar su estado y, si ya existe una contestacion, verla en la columna Respuesta.`
            : "Ahora mismo no veo peticiones pendientes. Puedes entrar en Peticiones para revisar el historico y comprobar si alguna ya tiene respuesta o incidencia creada.",
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
        answer:
          answeredCount > 0
            ? "La respuesta aparece en la columna Respuesta dentro del listado de Peticiones. Veras un resumen en la celda y, si existe mas texto, puedes abrirlo desde el enlace Ver texto completo."
            : "Ahora mismo no veo respuestas publicadas en tus peticiones. Aun asi, puedes entrar en Peticiones para revisar el estado y comprobar si se ha creado una incidencia asociada.",
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
        answer:
          "En la columna Respuesta veras un extracto. Para leer todo el contenido, pulsa el enlace Ver texto completo dentro de la misma fila y el portal desplegara el mensaje completo sin salir de la pagina.",
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
        answer:
          processedCount > 0
            ? "Cuando una peticion ya ha generado una incidencia o referencia interna, lo veras en la columna Referencia creada. Si aparece un codigo, puedes pulsarlo para abrir el detalle de la incidencia asociada."
            : "Todavia no veo peticiones con incidencia creada. Puedes revisar la columna Referencia creada en Peticiones para comprobar cuando se asigne una.",
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
      answer: `${incidentRequestsSummary(pendingCount, inProgressCount, processedCount)} ${
        answeredCount > 0
          ? "Ademas, algunas ya tienen contenido en la columna Respuesta y puedes ampliar el mensaje desde Ver texto completo."
          : "Si una peticion recibe contestacion, la veras en la columna Respuesta."
      }`,
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
    const incidents = await getIncidents();
    const openCount = incidents.filter((incident) => incident.stateCode === "Active").length;

    if (includesAny(context.normalizedMessage, ["abrir", "crear", "nueva"])) {
      return {
        answer:
          "Para abrir una incidencia, entra en Incidencias y completa el formulario con contrato, inmueble afectado, descripcion clara y telefono de contacto. Cuanto mas concreto seas, mas facil sera tramitarla.",
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
        answer:
          "Lo ideal es indicar contrato, zona afectada, que ocurre exactamente, desde cuando pasa y un telefono de contacto. Si ya has hablado con alguien o hay urgencia, tambien conviene dejarlo por escrito.",
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
      answer: `${unresolvedIncidentsSummary(openCount)} ${
        openCount > 0
          ? "Si una requiere accion, entra al detalle para revisar la informacion registrada."
          : "Si necesitas reportar algo nuevo, puedes hacerlo desde la misma seccion."
      }`,
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
    const pendingReview = documents.filter((document) => {
      const normalized = document.reviewStatus?.trim().toLowerCase() || "";
      return document.missingMandatoryData || normalized !== "reviewed";
    }).length;

    if (includesAny(context.normalizedMessage, ["copia", "solicitar", "pedir"])) {
      return {
        answer:
          "Desde Documentos puedes descargar directamente los archivos publicados. Si un documento no tiene descarga disponible, puedes usar el boton de solicitar copia para que el equipo lo revise y te contacte si hace falta.",
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
        answer:
          "Para descargar un documento, entra en Documentos y pulsa 'Descargar documento' en la fila correspondiente. El portal pedirá el archivo al backend y lanzará la descarga sin depender del enlace externo.",
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
        answer:
          downloadableDocuments.length > 0
            ? `Ahora mismo veo ${downloadableDocuments.length} documento(s) con descarga disponible. Entra en Documentos y usa el boton de descarga de cada fila para bajar el archivo correspondiente.`
            : "Ahora mismo no veo documentos con descarga directa disponible. Si necesitas uno concreto, entra en Documentos y usa la opcion de solicitar copia.",
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
      answer: `${documentsSummary(downloadableDocuments.length, documents.length, pendingReview)} ${
        downloadableDocuments.length > 0
          ? "Si necesitas uno concreto, la mejor siguiente accion es abrir Documentos y usar el boton de descarga."
          : "Si buscas uno concreto y no aparece descarga, puedes pedir copia desde esa misma seccion."
      }`,
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
        answer:
          "Confirmacion requerida significa que el portal espera que marques la lectura del aviso para dejar trazabilidad. No suele ser solo informativo: conviene entrar en Avisos y confirmar cuanto antes.",
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
      answer:
        unreadCount > 0 || confirmationCount > 0
          ? `Tienes ${unreadCount} aviso(s) sin leer y ${confirmationCount} con confirmacion requerida. La mejor siguiente accion es revisar Avisos y confirmar lectura donde se pida.`
          : "No veo avisos pendientes de revisar en este momento. Aun asi, puedes entrar en Avisos para comprobar el historico visible.",
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
      answer:
        `En Perfil puedes revisar tu nombre, email, numero de cliente y el entorno de Business Central asociado a tu acceso. ` +
        `${me.email ? `Ahora mismo tu acceso esta vinculado a ${me.email}.` : "Ahora mismo el portal no muestra un email asociado."}`,
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
    return {
      answer:
        "Desde el portal puedes revisar avisos, consultar facturas, descargar documentos, seguir incidencias y ver tu perfil. Si me dices en que necesitas ayuda, te llevo a la seccion adecuada y te explico el siguiente paso.",
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
      "Todavia no entiendo esa consulta con suficiente detalle. Si quieres, puedo enviarla por correo a nuestro equipo para que la revisen y te respondan.",
    links: [
      { href: page.startsWith("/portal") ? page : "/portal", label: "Seguir en esta seccion" }
    ],
    suggestions: pageSuggestions(page),
    canEscalate: true
  };
}
