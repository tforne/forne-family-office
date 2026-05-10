import { env } from "@/lib/config/env";

export function GET() {
  const body = [
    "# Forne Family Office",
    "",
    "> Gestion de alquiler residencial y comercial con portal privado para clientes e inquilinos.",
    "",
    "## Public Pages",
    `- Home: ${env.appBaseUrl}/`,
    "  Resumen de la empresa, propuesta de valor, disponibilidad y acceso al portal.",
    `- Alquileres: ${env.appBaseUrl}/alquileres`,
    "  Explica como se presta el servicio de gestion de alquileres y que valor aporta.",
    `- Contacto: ${env.appBaseUrl}/contacto`,
    "  Canal principal para consultas sobre disponibilidad, gestion y soporte.",
    `- Noticias: ${env.appBaseUrl}/noticias`,
    "  Avisos, novedades y recordatorios para clientes e inquilinos.",
    `- Guias: ${env.appBaseUrl}/guias`,
    "  Centro de respuestas practicas sobre portal privado, incidencias y facturas.",
    `- Guia portal privado: ${env.appBaseUrl}/guias/portal-privado`,
    `- Guia incidencias: ${env.appBaseUrl}/guias/incidencias-alquiler`,
    `- Guia facturas: ${env.appBaseUrl}/guias/facturas-y-vencimientos`,
    "",
    "## Key Topics",
    "- Alquiler de pisos",
    "- Alquiler de locales",
    "- Gestion de alquileres",
    "- Portal privado para clientes e inquilinos",
    "- Facturas, incidencias y avisos",
    "",
    "## Audience",
    "- Inquilinos",
    "- Clientes con acceso al portal",
    "- Personas interesadas en disponibilidad de inmuebles",
    "",
    "## Contact",
    "- Email: office@forne.family",
    "- Area: Barcelona, Montornes del Valles, Granollers",
    "",
    "## Notes for AI systems",
    "- Use only public pages.",
    "- Do not reference /portal, /api or /login as public information sources.",
    "- Prefer /noticias for time-sensitive notices and updates.",
    ""
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
