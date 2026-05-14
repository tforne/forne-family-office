import "server-only";

import { isCurrentPortalAdmin } from "@/lib/portal/admin-auth";
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
        "Desde el portal puedes revisar avisos, consultar facturas, seguir incidencias y ver tu perfil. Si me dices en que necesitas ayuda, te llevo a la seccion adecuada y te explico el siguiente paso.",
      links: [
        { href: "/portal", label: "Inicio del portal" },
        { href: "/portal/invoices", label: "Facturas" },
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
