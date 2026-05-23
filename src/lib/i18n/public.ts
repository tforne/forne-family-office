export const publicLocales = ["es", "ca", "en"] as const;

export type PublicLocale = (typeof publicLocales)[number];

export type PublicRouteKey =
  | "home"
  | "rentals"
  | "contact"
  | "guides"
  | "guidesPortal"
  | "guidesIncidents"
  | "guidesInvoices"
  | "news";

export const defaultPublicLocale: PublicLocale = "es";

export function isPublicLocale(value: string): value is PublicLocale {
  return publicLocales.includes(value as PublicLocale);
}

export const localeLabels: Record<PublicLocale, string> = {
  es: "ES",
  ca: "CA",
  en: "EN"
};

const routeSlugs: Record<PublicLocale, Record<PublicRouteKey, string[]>> = {
  es: {
    home: [],
    rentals: ["alquileres"],
    contact: ["contacto"],
    guides: ["guias"],
    guidesPortal: ["guias", "portal-privado"],
    guidesIncidents: ["guias", "incidencias-alquiler"],
    guidesInvoices: ["guias", "facturas-y-vencimientos"],
    news: ["noticias"]
  },
  ca: {
    home: [],
    rentals: ["lloguers"],
    contact: ["contacte"],
    guides: ["guies"],
    guidesPortal: ["guies", "portal-privat"],
    guidesIncidents: ["guies", "incidencies-lloguer"],
    guidesInvoices: ["guies", "factures-i-venciments"],
    news: ["noticies"]
  },
  en: {
    home: [],
    rentals: ["rentals"],
    contact: ["contact"],
    guides: ["guides"],
    guidesPortal: ["guides", "private-portal"],
    guidesIncidents: ["guides", "rental-incidents"],
    guidesInvoices: ["guides", "invoices-and-due-dates"],
    news: ["news"]
  }
};

export function getLocalizedPath(locale: PublicLocale, routeKey: PublicRouteKey, hash?: string) {
  const path = `/${locale}${routeSlugs[locale][routeKey].length ? `/${routeSlugs[locale][routeKey].join("/")}` : ""}`;
  return hash ? `${path}${hash.startsWith("#") ? hash : `#${hash}`}` : path;
}

export function getRouteKeyFromSegments(
  locale: PublicLocale,
  segments?: string[]
): PublicRouteKey | null {
  const normalized = segments?.filter(Boolean) ?? [];

  for (const [routeKey, slugParts] of Object.entries(routeSlugs[locale]) as Array<
    [PublicRouteKey, string[]]
  >) {
    if (slugParts.length === normalized.length && slugParts.every((part, index) => part === normalized[index])) {
      return routeKey;
    }
  }

  return null;
}

export function getRouteAlternates(routeKey: PublicRouteKey) {
  return Object.fromEntries(
    publicLocales.map((locale) => [locale, getLocalizedPath(locale, routeKey)])
  ) as Record<PublicLocale, string>;
}

type LocalizedString = Record<PublicLocale, string>;

type PublicCopy = {
  languageName: LocalizedString;
  site: {
    brandLine: LocalizedString;
    homeLabel: LocalizedString;
    privateAccess: LocalizedString;
    startConversation: LocalizedString;
    clientAccess: LocalizedString;
    allRightsReserved: LocalizedString;
    directAttention: LocalizedString;
  };
  header: {
    about: LocalizedString;
    services: LocalizedString;
    portal: LocalizedString;
    contact: LocalizedString;
  };
  footer: {
    summary: LocalizedString;
    navigation: LocalizedString;
    rentals: LocalizedString;
    about: LocalizedString;
    services: LocalizedString;
    contact: LocalizedString;
    privateArea: LocalizedString;
    invoices: LocalizedString;
    incidents: LocalizedString;
    communications: LocalizedString;
    location: LocalizedString;
    management: LocalizedString;
    availability: LocalizedString;
    privateAccess: LocalizedString;
  };
  home: {
    metadata: {
      title: LocalizedString;
      description: LocalizedString;
      keywords: Record<PublicLocale, string[]>;
    };
    hero: {
      kicker: LocalizedString;
      title1: LocalizedString;
      title2: LocalizedString;
      title3: LocalizedString;
      body: LocalizedString;
      signals: Record<PublicLocale, string[]>;
      primaryCta: LocalizedString;
      secondaryCta: LocalizedString;
      trustKicker: LocalizedString;
      trustBody: LocalizedString;
      governancePoints: Record<PublicLocale, string[]>;
      imageAlt: LocalizedString;
      institutional: LocalizedString;
      institutionalValue: LocalizedString;
      portalCallout: LocalizedString;
    };
    about: {
      kicker: LocalizedString;
      title: LocalizedString;
      body1: LocalizedString;
      body2: LocalizedString;
      imageAlt: LocalizedString;
      continuityLabel: LocalizedString;
      continuityText: LocalizedString;
      points: Record<PublicLocale, string[]>;
      principles: Record<PublicLocale, Array<{ title: string; description: string }>>;
    };
    services: {
      kicker: LocalizedString;
      title: LocalizedString;
      items: Record<PublicLocale, Array<{ title: string; description: string; accent: string; icon: "attention" | "clarity" | "operations" }>>;
    };
    guides: {
      kicker: LocalizedString;
      title: LocalizedString;
      cardLabel: LocalizedString;
      readGuide: LocalizedString;
      viewAll: LocalizedString;
      items: Record<PublicLocale, Array<{ routeKey: "guidesPortal" | "guidesIncidents"; title: string; description: string }>>;
    };
    trust: {
      kicker: LocalizedString;
      title: LocalizedString;
      body: LocalizedString;
      highlights: Record<PublicLocale, string[]>;
    };
    availability: {
      kicker: LocalizedString;
      title: LocalizedString;
      body: LocalizedString;
      empty: LocalizedString;
      metrics: Record<PublicLocale, Array<{ value: string; label: string }>>;
    };
    clientArea: {
      kicker: LocalizedString;
      title: LocalizedString;
      body: LocalizedString;
      imageAlt: LocalizedString;
      quickView: LocalizedString;
      cta: LocalizedString;
      features: Record<PublicLocale, string[]>;
      highlights: Record<PublicLocale, Array<{ label: string; value: string }>>;
    };
    contact: {
      kicker: LocalizedString;
      title: LocalizedString;
      body: LocalizedString;
      helpLabel: LocalizedString;
      writeUs: LocalizedString;
      alreadyClient: LocalizedString;
      alreadyClientBody: LocalizedString;
      secureAccess: LocalizedString;
      clientFeatures: Record<PublicLocale, string[]>;
      responsePoints: Record<PublicLocale, string[]>;
      contactItems: Record<PublicLocale, Array<{ label: string; value: string; href?: string }>>;
    };
    faq: {
      kicker: LocalizedString;
      title: LocalizedString;
      cta: LocalizedString;
      items: Record<PublicLocale, Array<{ question: string; answer: string }>>;
    };
  };
  forms: {
    contact: {
      name: LocalizedString;
      email: LocalizedString;
      subject: LocalizedString;
      message: LocalizedString;
      messagePlaceholder: LocalizedString;
      help: LocalizedString;
      send: LocalizedString;
      sending: LocalizedString;
      sent: LocalizedString;
      genericError: LocalizedString;
    };
    availability: {
      intro: LocalizedString;
      introBody: LocalizedString;
      name: LocalizedString;
      email: LocalizedString;
      message: LocalizedString;
      messagePlaceholder: LocalizedString;
      help: LocalizedString;
      send: LocalizedString;
      sending: LocalizedString;
      sent: LocalizedString;
      genericError: LocalizedString;
    };
    errors: {
      name: LocalizedString;
      email: LocalizedString;
      subject: LocalizedString;
      contactDetail: LocalizedString;
      availabilityDetail: LocalizedString;
      contactTooLong: LocalizedString;
      availabilityTooLong: LocalizedString;
      contactSendError: LocalizedString;
      availabilitySendError: LocalizedString;
    };
  };
  routes: Record<
    Exclude<PublicRouteKey, "home">,
    {
      metadata: {
        title: LocalizedString;
        description: LocalizedString;
      };
      heroKicker?: LocalizedString;
      title: LocalizedString;
      body: LocalizedString;
      cards?: Record<PublicLocale, string[]>;
      sections?: Record<PublicLocale, Array<{ title: string; text: string }>>;
      highlights?: Record<PublicLocale, string[]>;
      ctaPrimary?: LocalizedString;
      ctaSecondary?: LocalizedString;
      listTitle?: LocalizedString;
      listItems?: Record<PublicLocale, string[]>;
      items?: Record<PublicLocale, Array<{ title: string; items: string[] }>>;
      backHome?: LocalizedString;
      guideCards?: Record<PublicLocale, Array<{ routeKey: "guidesPortal" | "guidesIncidents" | "guidesInvoices"; title: string; description: string }>>;
    }
  >;
};

const copy: PublicCopy = {
  languageName: {
    es: "Español",
    ca: "Català",
    en: "English"
  },
  site: {
    brandLine: {
      es: "Criterio inmobiliario · Acceso privado",
      ca: "Criteri immobiliari · Accés privat",
      en: "Property judgment · Private access"
    },
    homeLabel: {
      es: "Inicio",
      ca: "Inici",
      en: "Home"
    },
    privateAccess: {
      es: "Acceso privado",
      ca: "Accés privat",
      en: "Private access"
    },
    startConversation: {
      es: "Iniciar conversación",
      ca: "Iniciar conversa",
      en: "Start a conversation"
    },
    clientAccess: {
      es: "Acceso clientes",
      ca: "Accés clients",
      en: "Client access"
    },
    allRightsReserved: {
      es: "Todos los derechos reservados.",
      ca: "Tots els drets reservats.",
      en: "All rights reserved."
    },
    directAttention: {
      es: "Atención directa",
      ca: "Atenció directa",
      en: "Direct support"
    }
  },
  header: {
    about: { es: "Quiénes somos", ca: "Qui som", en: "About" },
    services: { es: "Servicios", ca: "Serveis", en: "Services" },
    portal: { es: "Portal", ca: "Portal", en: "Portal" },
    contact: { es: "Contacto", ca: "Contacte", en: "Contact" }
  },
  footer: {
    summary: {
      es: "Gestión residencial y comercial con atención directa, criterio operativo y un acceso privado claro para clientes e inquilinos.",
      ca: "Gestió residencial i comercial amb atenció directa, criteri operatiu i un accés privat clar per a clients i llogaters.",
      en: "Residential and commercial management with direct support, operational discipline and a clear private area for clients and tenants."
    },
    navigation: { es: "Navegación", ca: "Navegació", en: "Navigation" },
    rentals: { es: "Activos y disponibilidad", ca: "Actius i disponibilitat", en: "Assets and availability" },
    about: { es: "Quiénes somos", ca: "Qui som", en: "About" },
    services: { es: "Servicios", ca: "Serveis", en: "Services" },
    contact: { es: "Contacto", ca: "Contacte", en: "Contact" },
    privateArea: { es: "Acceso privado", ca: "Accés privat", en: "Private area" },
    invoices: { es: "Facturas", ca: "Factures", en: "Invoices" },
    incidents: { es: "Incidencias", ca: "Incidències", en: "Incidents" },
    communications: { es: "Comunicaciones", ca: "Comunicacions", en: "Communications" },
    location: { es: "Barcelona, España", ca: "Barcelona, Espanya", en: "Barcelona, Spain" },
    management: {
      es: "Gestión residencial y comercial",
      ca: "Gestió residencial i comercial",
      en: "Residential and commercial management"
    },
    availability: { es: "Lun-Vie, 9:00-18:00", ca: "Dl-Dv, 9:00-18:00", en: "Mon-Fri, 9:00-18:00" },
    privateAccess: { es: "Entrar al área privada", ca: "Entrar a l'àrea privada", en: "Enter the private area" }
  },
  home: {
    metadata: {
      title: {
        es: "Gestión de alquileres en Barcelona y Montornès | Forné Family Office",
        ca: "Gestió de lloguers a Barcelona i Montornès | Forné Family Office",
        en: "Rental management in Barcelona and Montornès | Forné Family Office"
      },
      description: {
        es: "Gestión de alquileres residenciales y comerciales en Barcelona y Montornès del Vallès, con atención directa, portal privado e información clara para propietarios e inquilinos.",
        ca: "Gestió de lloguers residencials i comercials a Barcelona i Montornès del Vallès, amb atenció directa, portal privat i informació clara per a propietaris i llogaters.",
        en: "Residential and commercial rental management in Barcelona and Montornès del Vallès, with direct support, a private portal and clear information for owners and tenants."
      },
      keywords: {
        es: ["gestion de alquileres barcelona", "alquiler de pisos barcelona", "alquiler de locales barcelona"],
        ca: ["gestio de lloguers barcelona", "lloguer de pisos barcelona", "lloguer de locals barcelona"],
        en: ["rental management barcelona", "apartments for rent barcelona", "commercial rentals barcelona"]
      }
    },
    hero: {
      kicker: { es: "Firma familiar", ca: "Firma familiar", en: "Family firm" },
      title1: {
        es: "Una gestión inmobiliaria",
        ca: "Una gestió immobiliària",
        en: "Property management"
      },
      title2: {
        es: "con criterio, discreción",
        ca: "amb criteri, discreció",
        en: "with judgment, discretion"
      },
      title3: {
        es: "y visión estratégica.",
        ca: "i visió estratègica.",
        en: "and strategic vision."
      },
      body: {
        es: "Forné Family Office acompaña alquileres residenciales y comerciales en Barcelona, Montornès del Vallès y entorno con una gestión sobria, bien gobernada y orientada a la continuidad.",
        ca: "Forné Family Office acompanya lloguers residencials i comercials a Barcelona, Montornès del Vallès i entorn amb una gestió sòbria, ben governada i orientada a la continuïtat.",
        en: "Forné Family Office supports residential and commercial rentals across Barcelona, Montornès del Vallès and nearby areas with disciplined, well-governed management built for continuity."
      },
      signals: {
        es: ["Gestión de alquileres residenciales y comerciales", "Barcelona, Montornès del Vallès y entorno"],
        ca: ["Gestió de lloguers residencials i comercials", "Barcelona, Montornès del Vallès i entorn"],
        en: ["Residential and commercial rental management", "Barcelona, Montornès del Vallès and nearby areas"]
      },
      primaryCta: { es: "Iniciar conversación", ca: "Iniciar conversa", en: "Start a conversation" },
      secondaryCta: { es: "Ver el enfoque", ca: "Veure l'enfocament", en: "View the approach" },
      trustKicker: { es: "Señales de confianza", ca: "Senyals de confiança", en: "Trust signals" },
      trustBody: {
        es: "Una lectura rápida de cómo se estructura la relación.",
        ca: "Una lectura ràpida de com s'estructura la relació.",
        en: "A quick read on how the relationship is structured."
      },
      governancePoints: {
        es: [
          "Atención personal sin fricción innecesaria",
          "Información centralizada para decidir con calma",
          "Seguimiento consistente en incidencias, avisos y facturación"
        ],
        ca: [
          "Atenció personal sense friccions innecessàries",
          "Informació centralitzada per decidir amb calma",
          "Seguiment consistent en incidències, avisos i facturació"
        ],
        en: [
          "Personal attention without unnecessary friction",
          "Centralized information for calmer decisions",
          "Consistent follow-up across incidents, notices and invoicing"
        ]
      },
      imageAlt: {
        es: "Activo inmobiliario gestionado por Forné Family Office",
        ca: "Actiu immobiliari gestionat per Forné Family Office",
        en: "Property managed by Forné Family Office"
      },
      institutional: {
        es: "Presencia institucional",
        ca: "Presència institucional",
        en: "Institutional presence"
      },
      institutionalValue: {
        es: "Presencia cuidada",
        ca: "Presència cuidada",
        en: "Carefully composed presence"
      },
      portalCallout: {
        es: "Claridad visible, experiencia discreta",
        ca: "Claredat visible, experiència discreta",
        en: "Visible clarity, discreet experience"
      }
    },
    about: {
      kicker: { es: "Quiénes somos", ca: "Qui som", en: "About" },
      title: {
        es: "Una firma familiar donde la confianza se sostiene con orden, claridad y continuidad.",
        ca: "Una firma familiar on la confiança es sosté amb ordre, claredat i continuïtat.",
        en: "A family firm where trust is sustained by order, clarity and continuity."
      },
      body1: {
        es: "Forné Family Office nace de una forma de trabajar donde los activos no se tratan como una cartera anónima.",
        ca: "Forné Family Office neix d'una manera de treballar on els actius no es tracten com una cartera anònima.",
        en: "Forné Family Office comes from a way of working where assets are not treated like an anonymous portfolio."
      },
      body2: {
        es: "La experiencia pública debía reflejar ese mismo estándar: menos ruido, más sobriedad y una imagen capaz de transmitir confianza antes de entrar en detalle.",
        ca: "L'experiència pública havia de reflectir aquest mateix estàndard: menys soroll, més sobrietat i una imatge capaç de transmetre confiança abans d'entrar en detall.",
        en: "The public experience needed to reflect that same standard: less noise, more composure and an image able to convey trust before going into detail."
      },
      imageAlt: { es: "Equipo de Forné Family Office", ca: "Equip de Forné Family Office", en: "Forné Family Office team" },
      continuityLabel: { es: "Continuidad", ca: "Continuïtat", en: "Continuity" },
      continuityText: {
        es: "años construyendo confianza en gestión inmobiliaria familiar.",
        ca: "anys construint confiança en gestió immobiliària familiar.",
        en: "years building trust in family-led property management."
      },
      points: {
        es: [
          "Relación cercana sin perder rigor institucional",
          "Visibilidad centralizada para decisiones mejor informadas",
          "Seguimiento trazable en facturas, avisos e incidencias",
          "Preservación de la confianza en cada interacción operativa"
        ],
        ca: [
          "Relació propera sense perdre rigor institucional",
          "Visibilitat centralitzada per a decisions millor informades",
          "Seguiment traçable en factures, avisos i incidències",
          "Preservació de la confiança en cada interacció operativa"
        ],
        en: [
          "Close relationships without losing institutional rigor",
          "Centralized visibility for better-informed decisions",
          "Traceable follow-up across invoices, notices and incidents",
          "Trust preserved in every operational interaction"
        ]
      },
      principles: {
        es: [
          { title: "Criterio", description: "Gestionamos el día a día con una lógica de continuidad, criterio y discreción." },
          { title: "Gobernanza", description: "Cada proceso se apoya en orden, trazabilidad y una interlocución clara para clientes e inquilinos." },
          { title: "Presencia", description: "La experiencia debe transmitir solidez antes de explicar funcionalidades. Eso también es servicio." }
        ],
        ca: [
          { title: "Criteri", description: "Gestionem el dia a dia amb una lògica de continuïtat, criteri i discreció." },
          { title: "Governança", description: "Cada procés es recolza en ordre, traçabilitat i una interlocució clara per a clients i llogaters." },
          { title: "Presència", description: "L'experiència ha de transmetre solidesa abans d'explicar funcionalitats. Això també és servei." }
        ],
        en: [
          { title: "Judgment", description: "We manage the day to day with continuity, judgment and discretion." },
          { title: "Governance", description: "Every process relies on order, traceability and clear communication for clients and tenants." },
          { title: "Presence", description: "The experience should convey solidity before explaining features. That is service too." }
        ]
      }
    },
    services: {
      kicker: { es: "Señales de servicio", ca: "Senyals de servei", en: "Service signals" },
      title: {
        es: "Menos promesa. Más señales de cómo se trabaja.",
        ca: "Menys promesa. Més senyals de com es treballa.",
        en: "Less promise. More signals of how the work is done."
      },
      items: {
        es: [
          { title: "Interlocución serena", description: "Una relación directa, discreta y bien acompañada durante toda la gestión.", accent: "#B89B6D", icon: "attention" },
          { title: "Visibilidad ordenada", description: "Facturas, avisos e incidencias reunidos en un entorno claro y fácil de seguir.", accent: "#7F97AF", icon: "clarity" },
          { title: "Continuidad real", description: "Procesos sobrios y consistentes para sostener confianza en el día a día.", accent: "#10233A", icon: "operations" }
        ],
        ca: [
          { title: "Interlocució serena", description: "Una relació directa, discreta i ben acompanyada durant tota la gestió.", accent: "#B89B6D", icon: "attention" },
          { title: "Visibilitat ordenada", description: "Factures, avisos i incidències reunits en un entorn clar i fàcil de seguir.", accent: "#7F97AF", icon: "clarity" },
          { title: "Continuïtat real", description: "Processos sobris i consistents per sostenir la confiança en el dia a dia.", accent: "#10233A", icon: "operations" }
        ],
        en: [
          { title: "Calm communication", description: "A direct, discreet relationship supported throughout the management process.", accent: "#B89B6D", icon: "attention" },
          { title: "Ordered visibility", description: "Invoices, notices and incidents gathered in a clear environment that is easy to follow.", accent: "#7F97AF", icon: "clarity" },
          { title: "Real continuity", description: "Composed, consistent processes that sustain trust day after day.", accent: "#10233A", icon: "operations" }
        ]
      }
    },
    guides: {
      kicker: { es: "Guías", ca: "Guies", en: "Guides" },
      title: {
        es: "Lecturas breves para quien quiera entender mejor el detalle.",
        ca: "Lectures breus per a qui vulgui entendre millor el detall.",
        en: "Short reads for anyone who wants to better understand the details."
      },
      cardLabel: { es: "Guía", ca: "Guia", en: "Guide" },
      readGuide: { es: "Leer guía", ca: "Llegir guia", en: "Read guide" },
      viewAll: { es: "Ver todas las lecturas", ca: "Veure totes les lectures", en: "View all reads" },
      items: {
        es: [
          { routeKey: "guidesPortal", title: "Cómo funciona el acceso privado", description: "Una lectura breve para entender el acceso, la información disponible y la lógica del entorno privado." },
          { routeKey: "guidesIncidents", title: "Cómo comunicar una incidencia", description: "Guía breve para trasladar una necesidad con el contexto que ayuda a resolverla mejor." }
        ],
        ca: [
          { routeKey: "guidesPortal", title: "Com funciona l'accés privat", description: "Una lectura breu per entendre l'accés, la informació disponible i la lògica de l'entorn privat." },
          { routeKey: "guidesIncidents", title: "Com comunicar una incidència", description: "Guia breu per traslladar una necessitat amb el context que ajuda a resoldre-la millor." }
        ],
        en: [
          { routeKey: "guidesPortal", title: "How private access works", description: "A short read to understand access, available information and the logic of the private environment." },
          { routeKey: "guidesIncidents", title: "How to report an incident", description: "A short guide to share a need with the context that helps resolve it better." }
        ]
      }
    },
    trust: {
      kicker: { es: "Una forma de estar", ca: "Una manera d'estar", en: "A way of being" },
      title: {
        es: "Una presencia más silenciosa, más clara y más segura de sí misma.",
        ca: "Una presència més silenciosa, més clara i més segura de si mateixa.",
        en: "A quieter, clearer and more self-assured presence."
      },
      body: {
        es: "La experiencia pública se apoya en orden visual, mejor jerarquía y una sensación de servicio cuidado desde el primer vistazo, sin necesidad de sobreactuar.",
        ca: "L'experiència pública es recolza en ordre visual, millor jerarquia i una sensació de servei cuidat des del primer cop d'ull, sense sobreactuar.",
        en: "The public experience relies on visual order, stronger hierarchy and a sense of care from the first glance, without overplaying it."
      },
      highlights: {
        es: ["Residencial y comercial", "Barcelona, Montornès y entorno", "Interlocución directa y acceso privado"],
        ca: ["Residencial i comercial", "Barcelona, Montornès i entorn", "Interlocució directa i accés privat"],
        en: ["Residential and commercial", "Barcelona, Montornès and nearby areas", "Direct communication and private access"]
      }
    },
    availability: {
      kicker: { es: "Disponibilidad y primera conversación", ca: "Disponibilitat i primera conversa", en: "Availability and first conversation" },
      title: {
        es: "Disponibilidad tratada con criterio, no con ruido comercial.",
        ca: "Disponibilitat tractada amb criteri, no amb soroll comercial.",
        en: "Availability handled with judgment, not commercial noise."
      },
      body: {
        es: "Si buscas piso o local, preferimos abrir la conversación con referencias claras, contexto suficiente y una respuesta ajustada.",
        ca: "Si busques pis o local, preferim obrir la conversa amb referències clares, context suficient i una resposta ajustada.",
        en: "If you are looking for an apartment or a commercial unit, we prefer to open the conversation with clear references, enough context and a measured response."
      },
      empty: {
        es: "En este momento no hay inmuebles con estado En alquiler para mostrar en portada.",
        ca: "En aquest moment no hi ha immobles amb estat En lloguer per mostrar a portada.",
        en: "There are currently no properties marked For rent to show on the home page."
      },
      metrics: {
        es: [
          { value: "35+", label: "años de continuidad y criterio de gestión" },
          { value: "Selección", label: "menos volumen, más contexto útil para decidir" },
          { value: "Directo", label: "interlocución clara desde el primer contacto" }
        ],
        ca: [
          { value: "35+", label: "anys de continuïtat i criteri de gestió" },
          { value: "Selecció", label: "menys volum, més context útil per decidir" },
          { value: "Directe", label: "interlocució clara des del primer contacte" }
        ],
        en: [
          { value: "35+", label: "years of continuity and management judgment" },
          { value: "Selective", label: "less volume, more useful context for decisions" },
          { value: "Direct", label: "clear communication from first contact" }
        ]
      }
    },
    clientArea: {
      kicker: { es: "Acceso privado", ca: "Accés privat", en: "Private access" },
      title: {
        es: "Un acceso privado claro, sobrio y bien resuelto.",
        ca: "Un accés privat clar, sobri i ben resolt.",
        en: "A private area that is clear, composed and well resolved."
      },
      body: {
        es: "El portal reúne facturas, incidencias y seguimiento en un entorno seguro y sobrio, pensado para consultar lo importante sin fricción.",
        ca: "El portal reuneix factures, incidències i seguiment en un entorn segur i sobri, pensat per consultar allò important sense fricció.",
        en: "The portal brings together invoices, incidents and follow-up in a secure, composed environment built to review what matters without friction."
      },
      imageAlt: {
        es: "Portal de clientes Forné Family Office",
        ca: "Portal de clients Forné Family Office",
        en: "Forné Family Office client portal"
      },
      quickView: {
        es: "Vista rápida del área privada",
        ca: "Vista ràpida de l'àrea privada",
        en: "Private area quick view"
      },
      cta: { es: "Entrar al área privada", ca: "Entrar a l'àrea privada", en: "Enter the private area" },
      features: {
        es: ["Consulta tus facturas y vencimientos", "Comunica incidencias del inmueble", "Revisa el estado de cada gestión"],
        ca: ["Consulta les teves factures i venciments", "Comunica incidències de l'immoble", "Revisa l'estat de cada gestió"],
        en: ["Review your invoices and due dates", "Report property incidents", "Check the status of each request"]
      },
      highlights: {
        es: [
          { label: "Facturas", value: "Histórico y vencimientos" },
          { label: "Incidencias", value: "Seguimiento estructurado" },
          { label: "Avisos", value: "Comunicaciones visibles" }
        ],
        ca: [
          { label: "Factures", value: "Històric i venciments" },
          { label: "Incidències", value: "Seguiment estructurat" },
          { label: "Avisos", value: "Comunicacions visibles" }
        ],
        en: [
          { label: "Invoices", value: "History and due dates" },
          { label: "Incidents", value: "Structured follow-up" },
          { label: "Notices", value: "Visible communications" }
        ]
      }
    },
    contact: {
      kicker: { es: "Contacto", ca: "Contacte", en: "Contact" },
      title: {
        es: "Una conversación directa, discreta y bien atendida.",
        ca: "Una conversa directa, discreta i ben atesa.",
        en: "A direct, discreet and carefully handled conversation."
      },
      body: {
        es: "Si quieres conocer disponibilidad, resolver una cuestión operativa o entender mejor nuestro enfoque de gestión, puedes escribirnos directamente.",
        ca: "Si vols conèixer disponibilitat, resoldre una qüestió operativa o entendre millor el nostre enfocament de gestió, ens pots escriure directament.",
        en: "If you want to check availability, resolve an operational question or better understand our management approach, you can write to us directly."
      },
      helpLabel: { es: "Podemos ayudarte con", ca: "Et podem ajudar amb", en: "We can help with" },
      writeUs: { es: "Escribirnos", ca: "Escriure'ns", en: "Write to us" },
      alreadyClient: { es: "¿Ya eres cliente?", ca: "Ja ets client?", en: "Already a client?" },
      alreadyClientBody: {
        es: "Accede a tu portal privado para revisar facturas, incidencias y comunicaciones en un entorno claro y seguro.",
        ca: "Accedeix al teu portal privat per revisar factures, incidències i comunicacions en un entorn clar i segur.",
        en: "Access your private portal to review invoices, incidents and communications in a clear and secure environment."
      },
      secureAccess: {
        es: "Acceso seguro para clientes registrados",
        ca: "Accés segur per a clients registrats",
        en: "Secure access for registered clients"
      },
      clientFeatures: {
        es: ["Facturas y vencimientos visibles", "Incidencias con seguimiento ordenado", "Comunicaciones con contexto"],
        ca: ["Factures i venciments visibles", "Incidències amb seguiment ordenat", "Comunicacions amb context"],
        en: ["Visible invoices and due dates", "Incidents with structured follow-up", "Communications with context"]
      },
      responsePoints: {
        es: ["Consultas sobre disponibilidad", "Información sobre gestión residencial y comercial", "Acceso o soporte para clientes ya registrados en el portal"],
        ca: ["Consultes sobre disponibilitat", "Informació sobre gestió residencial i comercial", "Accés o suport per a clients ja registrats al portal"],
        en: ["Availability enquiries", "Information about residential and commercial management", "Access or support for clients already registered in the portal"]
      },
      contactItems: {
        es: [
          { label: "Email", value: "office@forne.family", href: "mailto:office@forne.family" },
          { label: "Ubicación", value: "Barcelona, España" },
          { label: "Disponibilidad", value: "Lun-Vie, 9:00-18:00" }
        ],
        ca: [
          { label: "Email", value: "office@forne.family", href: "mailto:office@forne.family" },
          { label: "Ubicació", value: "Barcelona, Espanya" },
          { label: "Disponibilitat", value: "Dl-Dv, 9:00-18:00" }
        ],
        en: [
          { label: "Email", value: "office@forne.family", href: "mailto:office@forne.family" },
          { label: "Location", value: "Barcelona, Spain" },
          { label: "Availability", value: "Mon-Fri, 9:00-18:00" }
        ]
      }
    },
    faq: {
      kicker: { es: "Preguntas frecuentes", ca: "Preguntes freqüents", en: "Frequently asked questions" },
      title: {
        es: "Respuestas claras para una experiencia más confiable.",
        ca: "Respostes clares per a una experiència més fiable.",
        en: "Clear answers for a more trustworthy experience."
      },
      cta: { es: "Ver guias detalladas", ca: "Veure guies detallades", en: "View detailed guides" },
      items: {
        es: [
          { question: "¿Qué puedo hacer desde el portal privado?", answer: "Consultar facturas, revisar avisos, seguir incidencias y acceder a información centralizada vinculada a tu alquiler." },
          { question: "¿Trabajáis solo alquiler residencial?", answer: "No. La gestión contempla tanto viviendas como locales, con el mismo enfoque de orden operativo y atención directa." },
          { question: "¿Cómo se solicita información sobre disponibilidad?", answer: "Desde la portada puedes dejar tus datos e interés. El equipo revisa la necesidad y responde con una orientación más ajustada." },
          { question: "¿Qué diferencia a esta gestión de una atención más tradicional?", answer: "La combinación de trato cercano con un entorno digital donde la información no se pierde y cada gestión conserva contexto." }
        ],
        ca: [
          { question: "Què puc fer des del portal privat?", answer: "Consultar factures, revisar avisos, seguir incidències i accedir a informació centralitzada vinculada al teu lloguer." },
          { question: "Treballeu només lloguer residencial?", answer: "No. La gestió contempla tant habitatges com locals, amb el mateix enfocament d'ordre operatiu i atenció directa." },
          { question: "Com se sol·licita informació sobre disponibilitat?", answer: "Des de la portada pots deixar les teves dades i interès. L'equip revisa la necessitat i respon amb una orientació més ajustada." },
          { question: "Què diferencia aquesta gestió d'una atenció més tradicional?", answer: "La combinació de tracte proper amb un entorn digital on la informació no es perd i cada gestió conserva context." }
        ],
        en: [
          { question: "What can I do from the private portal?", answer: "Review invoices, check notices, follow incidents and access centralized information connected to your rental." },
          { question: "Do you only handle residential rentals?", answer: "No. Management covers both homes and commercial units with the same operational discipline and direct attention." },
          { question: "How do I request information about availability?", answer: "From the home page you can leave your details and interest. The team reviews the need and responds with more tailored guidance." },
          { question: "What makes this management approach different from a more traditional one?", answer: "The combination of close attention with a digital environment where information is not lost and each request keeps its context." }
        ]
      }
    }
  },
  forms: {
    contact: {
      name: { es: "Nombre", ca: "Nom", en: "Name" },
      email: { es: "Correo electrónico", ca: "Correu electrònic", en: "Email" },
      subject: { es: "Asunto", ca: "Assumpte", en: "Subject" },
      message: { es: "Mensaje", ca: "Missatge", en: "Message" },
      messagePlaceholder: {
        es: "Cuéntanos qué necesitas y te responderemos lo antes posible.",
        ca: "Explica'ns què necessites i et respondrem al més aviat possible.",
        en: "Tell us what you need and we will reply as soon as possible."
      },
      help: {
        es: "Si prefieres, puedes indicar la zona o el tipo de inmueble que te interesa para responderte con más precisión.",
        ca: "Si ho prefereixes, pots indicar la zona o el tipus d'immoble que t'interessa per respondre't amb més precisió.",
        en: "If you prefer, you can mention the area or type of property you are interested in so we can respond more precisely."
      },
      send: { es: "Enviar", ca: "Enviar", en: "Send" },
      sending: { es: "Enviando...", ca: "Enviant...", en: "Sending..." },
      sent: {
        es: "Consulta enviada correctamente. Te responderemos lo antes posible.",
        ca: "Consulta enviada correctament. Et respondrem al més aviat possible.",
        en: "Your enquiry has been sent successfully. We will reply as soon as possible."
      },
      genericError: {
        es: "No se pudo enviar la consulta.",
        ca: "No s'ha pogut enviar la consulta.",
        en: "We could not send your enquiry."
      }
    },
    availability: {
      intro: { es: "Solicitud inicial", ca: "Sol·licitud inicial", en: "Initial request" },
      introBody: {
        es: "Cuéntanos el tipo de inmueble, la zona o el timing que estás valorando. Revisaremos la disponibilidad con una lectura selectiva y te responderemos de forma personalizada.",
        ca: "Explica'ns el tipus d'immoble, la zona o el moment que valores. Revisarem la disponibilitat amb una lectura selectiva i et respondrem de manera personalitzada.",
        en: "Tell us the type of property, area or timing you are considering. We will review availability selectively and reply in a personalized way."
      },
      name: { es: "Nombre", ca: "Nom", en: "Name" },
      email: { es: "Correo electrónico", ca: "Correu electrònic", en: "Email" },
      message: { es: "Qué estás buscando", ca: "Què estàs buscant", en: "What are you looking for?" },
      messagePlaceholder: {
        es: "Ejemplo: Busco un piso de 2 habitaciones en Barcelona o alrededores, disponible en los próximos meses.",
        ca: "Exemple: Busco un pis de 2 habitacions a Barcelona o voltants, disponible els pròxims mesos.",
        en: "Example: I am looking for a 2-bedroom apartment in Barcelona or nearby, available in the coming months."
      },
      help: {
        es: "Te responderemos desde Forné Family Office con la información disponible más relevante para tu búsqueda, sin comunicaciones genéricas.",
        ca: "Et respondrem des de Forné Family Office amb la informació disponible més rellevant per a la teva cerca, sense comunicacions genèriques.",
        en: "We will reply from Forné Family Office with the most relevant information available for your search, without generic outreach."
      },
      send: { es: "Enviar solicitud", ca: "Enviar sol·licitud", en: "Send request" },
      sending: { es: "Enviando solicitud...", ca: "Enviant sol·licitud...", en: "Sending request..." },
      sent: {
        es: "Solicitud enviada correctamente. Te contactaremos lo antes posible.",
        ca: "Sol·licitud enviada correctament. Et contactarem al més aviat possible.",
        en: "Your request has been sent successfully. We will contact you as soon as possible."
      },
      genericError: {
        es: "No se pudo enviar la solicitud.",
        ca: "No s'ha pogut enviar la sol·licitud.",
        en: "We could not send your request."
      }
    },
    errors: {
      name: { es: "Indica tu nombre.", ca: "Indica el teu nom.", en: "Please enter your name." },
      email: { es: "Indica un correo electrónico válido.", ca: "Indica un correu electrònic vàlid.", en: "Please enter a valid email address." },
      subject: { es: "Indica un asunto.", ca: "Indica un assumpte.", en: "Please enter a subject." },
      contactDetail: { es: "Cuéntanos con algo más de detalle qué necesitas.", ca: "Explica'ns amb una mica més de detall què necessites.", en: "Please share a little more detail about what you need." },
      availabilityDetail: { es: "Cuéntanos con algo más de detalle qué activo te interesa.", ca: "Explica'ns amb una mica més de detall quin actiu t'interessa.", en: "Please share a bit more detail about the property you are interested in." },
      contactTooLong: { es: "El mensaje no puede superar los 2000 caracteres.", ca: "El missatge no pot superar els 2000 caràcters.", en: "The message cannot be longer than 2000 characters." },
      availabilityTooLong: { es: "El mensaje no puede superar los 1000 caracteres.", ca: "El missatge no pot superar els 1000 caràcters.", en: "The message cannot be longer than 1000 characters." },
      contactSendError: { es: "No se pudo enviar la consulta.", ca: "No s'ha pogut enviar la consulta.", en: "We could not send your enquiry." },
      availabilitySendError: { es: "No se pudo enviar la solicitud.", ca: "No s'ha pogut enviar la sol·licitud.", en: "We could not send your request." }
    }
  },
  routes: {
    rentals: {
      metadata: {
        title: { es: "Alquiler de pisos y locales", ca: "Lloguer de pisos i locals", en: "Apartment and commercial rentals" },
        description: {
          es: "Servicios de alquiler de pisos y locales con seguimiento profesional, gestión operativa, incidencias y facturación clara.",
          ca: "Serveis de lloguer de pisos i locals amb seguiment professional, gestió operativa, incidències i facturació clara.",
          en: "Apartment and commercial rental services with professional follow-up, operational management, incident handling and clear invoicing."
        }
      },
      heroKicker: { es: "Alquileres", ca: "Lloguers", en: "Rentals" },
      title: {
        es: "Alquiler residencial y comercial con una gestión más clara para todas las partes.",
        ca: "Lloguer residencial i comercial amb una gestió més clara per a totes les parts.",
        en: "Residential and commercial rentals with clearer management for every party involved."
      },
      body: {
        es: "Gestionamos viviendas y locales con una combinación de cercanía, seguimiento operativo y herramientas digitales pensadas para que el día a día del alquiler sea más ordenado.",
        ca: "Gestionem habitatges i locals amb una combinació de proximitat, seguiment operatiu i eines digitals pensades perquè el dia a dia del lloguer sigui més ordenat.",
        en: "We manage homes and commercial units through close support, operational follow-up and digital tools designed to make rental day to day more orderly."
      },
      cards: {
        es: ["Seguimiento de facturas y vencimientos", "Canal ordenado para incidencias y avisos", "Documentación y contexto accesibles desde el portal"],
        ca: ["Seguiment de factures i venciments", "Canal ordenat per a incidències i avisos", "Documentació i context accessibles des del portal"],
        en: ["Invoice and due-date follow-up", "A structured channel for incidents and notices", "Documentation and context accessible from the portal"]
      },
      sections: {
        es: [
          { title: "Gestión operativa", text: "Procesos claros para que la administración del alquiler no dependa de improvisaciones." },
          { title: "Facturación y vencimientos", text: "Importes, estados y próximas fechas visibles para reducir dudas y dar más contexto." },
          { title: "Incidencias y comunicación", text: "Seguimiento estructurado de las necesidades del inmueble con una experiencia más ordenada." }
        ],
        ca: [
          { title: "Gestió operativa", text: "Processos clars perquè l'administració del lloguer no depengui d'improvisacions." },
          { title: "Facturació i venciments", text: "Imports, estats i properes dates visibles per reduir dubtes i donar més context." },
          { title: "Incidències i comunicació", text: "Seguiment estructurat de les necessitats de l'immoble amb una experiència més ordenada." }
        ],
        en: [
          { title: "Operational management", text: "Clear processes so rental administration does not depend on improvisation." },
          { title: "Invoicing and due dates", text: "Amounts, statuses and upcoming dates made visible to reduce doubts and provide context." },
          { title: "Incidents and communication", text: "Structured follow-up of property needs through a more orderly experience." }
        ]
      },
      listTitle: {
        es: "Qué aporta",
        ca: "Què aporta",
        en: "What it adds"
      },
      highlights: {
        es: ["Más visibilidad sobre el estado real de cada gestión.", "Menos fricción entre comunicaciones, facturas y soporte.", "Una relación más cuidada entre gestión, cliente e inquilino."],
        ca: ["Més visibilitat sobre l'estat real de cada gestió.", "Menys fricció entre comunicacions, factures i suport.", "Una relació més cuidada entre gestió, client i llogater."],
        en: ["More visibility into the real status of each request.", "Less friction between communications, invoices and support.", "A more carefully managed relationship between management, client and tenant."]
      }
    },
    contact: {
      metadata: {
        title: { es: "Contacto para alquiler de pisos y locales", ca: "Contacte per a lloguer de pisos i locals", en: "Contact for apartment and commercial rentals" },
        description: {
          es: "Contacta con Forné Family Office para alquiler de pisos, alquiler de locales y gestión profesional de inmuebles en Barcelona y alrededores.",
          ca: "Contacta amb Forné Family Office per a lloguer de pisos, lloguer de locals i gestió professional d'immobles a Barcelona i entorn.",
          en: "Contact Forné Family Office for apartment rentals, commercial rentals and professional property management in Barcelona and nearby areas."
        }
      },
      heroKicker: { es: "Contacto", ca: "Contacte", en: "Contact" },
      title: {
        es: "Hablemos de disponibilidad, gestión o soporte para tu alquiler.",
        ca: "Parlem de disponibilitat, gestió o suport per al teu lloguer.",
        en: "Let us talk about availability, management or support for your rental."
      },
      body: {
        es: "Cuéntanos si buscas un piso en alquiler, un local comercial o apoyo en la gestión de un inmueble y revisaremos la mejor forma de ayudarte.",
        ca: "Explica'ns si busques un pis de lloguer, un local comercial o suport en la gestió d'un immoble i revisarem la millor manera d'ajudar-te.",
        en: "Tell us whether you are looking for an apartment, a commercial unit or support with property management and we will review the best way to help."
      },
      listTitle: { es: "Respuesta y atención", ca: "Resposta i atenció", en: "Response and support" },
      listItems: {
        es: ["Consultas sobre disponibilidad de pisos y locales", "Información sobre el funcionamiento del portal privado", "Contacto general para clientes e inquilinos"],
        ca: ["Consultes sobre disponibilitat de pisos i locals", "Informació sobre el funcionament del portal privat", "Contacte general per a clients i llogaters"],
        en: ["Availability enquiries for apartments and commercial units", "Information about how the private portal works", "General contact for clients and tenants"]
      }
    },
    guides: {
      metadata: {
        title: { es: "Guias del portal y gestion del alquiler", ca: "Guies del portal i gestió del lloguer", en: "Portal and rental management guides" },
        description: {
          es: "Guias practicas sobre portal privado, incidencias, facturas y gestion del alquiler para clientes e inquilinos.",
          ca: "Guies pràctiques sobre portal privat, incidències, factures i gestió del lloguer per a clients i llogaters.",
          en: "Practical guides about the private portal, incidents, invoices and rental management for clients and tenants."
        }
      },
      heroKicker: { es: "Guias", ca: "Guies", en: "Guides" },
      title: {
        es: "Guias para entender mejor a quien servimos y como gestionamos cada alquiler.",
        ca: "Guies per entendre millor a qui servim i com gestionem cada lloguer.",
        en: "Guides to better understand who we serve and how each rental is managed."
      },
      body: {
        es: "Reunimos respuestas pensadas para clientes e inquilinos que quieren saber como funciona el servicio, que pueden esperar y como usar mejor el portal.",
        ca: "Reunim respostes pensades per a clients i llogaters que volen saber com funciona el servei, què poden esperar i com fer millor ús del portal.",
        en: "We gather answers for clients and tenants who want to know how the service works, what to expect and how to make better use of the portal."
      },
      guideCards: {
        es: [
          { routeKey: "guidesPortal", title: "Como funciona el portal privado", description: "Que puede hacer un cliente dentro del portal, que secciones existen y como aprovechar mejor el autoservicio." },
          { routeKey: "guidesIncidents", title: "Que hacer si tienes una incidencia en el alquiler", description: "Pasos para comunicar una averia, una consulta o una solicitud con la informacion que ayuda a tramitarla mejor." },
          { routeKey: "guidesInvoices", title: "Como consultar facturas y vencimientos", description: "Guia para revisar importes, fechas, estados y copias de facturas desde el portal privado." }
        ],
        ca: [
          { routeKey: "guidesPortal", title: "Com funciona el portal privat", description: "Què pot fer un client dins del portal, quines seccions hi ha i com aprofitar millor l'autoservei." },
          { routeKey: "guidesIncidents", title: "Què fer si tens una incidència en el lloguer", description: "Passos per comunicar una avaria, una consulta o una sol·licitud amb la informació que ajuda a tramitar-la millor." },
          { routeKey: "guidesInvoices", title: "Com consultar factures i venciments", description: "Guia per revisar imports, dates, estats i còpies de factures des del portal privat." }
        ],
        en: [
          { routeKey: "guidesPortal", title: "How the private portal works", description: "What a client can do inside the portal, which sections exist and how to make better use of self-service." },
          { routeKey: "guidesIncidents", title: "What to do if you have a rental incident", description: "Steps to report a fault, question or request with the information that helps handle it better." },
          { routeKey: "guidesInvoices", title: "How to review invoices and due dates", description: "Guide to reviewing amounts, dates, statuses and invoice copies from the private portal." }
        ]
      }
    },
    guidesPortal: {
      metadata: {
        title: { es: "Como funciona el portal privado", ca: "Com funciona el portal privat", en: "How the private portal works" },
        description: {
          es: "Guia sobre como funciona el portal privado para consultar facturas, avisos, incidencias, perfil del cliente y acceso rapido como app.",
          ca: "Guia sobre com funciona el portal privat per consultar factures, avisos, incidències, perfil del client i accés ràpid com a app.",
          en: "Guide to how the private portal works to review invoices, notices, incidents, client profile and quick app-style access."
        }
      },
      heroKicker: { es: "Guia del portal", ca: "Guia del portal", en: "Portal guide" },
      title: {
        es: "Como funciona el portal privado de clientes e inquilinos.",
        ca: "Com funciona el portal privat de clients i llogaters.",
        en: "How the private portal for clients and tenants works."
      },
      body: {
        es: "El portal privado esta pensado para que la informacion del alquiler sea mas accesible y para que las gestiones no dependan de cadenas de correos o llamadas sin contexto.",
        ca: "El portal privat està pensat perquè la informació del lloguer sigui més accessible i perquè les gestions no depenguin de cadenes de correus o trucades sense context.",
        en: "The private portal is designed to make rental information more accessible and to keep requests from depending on email chains or calls without context."
      },
      ctaPrimary: { es: "Acceder al portal", ca: "Accedir al portal", en: "Access the portal" },
      ctaSecondary: { es: "Ver mas guias", ca: "Veure més guies", en: "View more guides" },
      items: {
        es: [
          { title: "Que puedes consultar", items: ["Facturas y vencimientos del alquiler", "Avisos activos y comunicaciones del portal", "Incidencias abiertas y su seguimiento", "Datos del perfil y contexto asociado al acceso"] },
          { title: "Para que sirve cada seccion", items: ["Inicio resume lo mas importante y muestra acciones rapidas.", "Facturas permite revisar importes, estados y copias.", "Incidencias sirve para abrir nuevas gestiones y seguir las existentes.", "Avisos concentra comunicaciones que pueden requerir lectura o confirmacion."] },
          { title: "Como aprovechar mejor el autoservicio", items: ["Revisa primero el panel de inicio para detectar pendientes.", "Consulta avisos antes de abrir una incidencia si la gestion puede estar ya comunicada.", "Usa el portal para mantener el contexto junto a cada contrato o activo."] },
          { title: "Acceso rapido como app", items: ["La opcion para guardar el portal como app ya no aparece en la portada publica, para no distraer cuando todavia no hace falta.", "Ahora se muestra en el acceso al portal y dentro de la zona privada, que es donde realmente ayuda a entrar mas rapido.", "Si el navegador permite instalarla, veras la accion para anadir acceso rapido.", "En iPhone o iPad se muestra la ayuda para anadir el portal a la pantalla de inicio.", "Si ya estas usando el portal como app, la sugerencia deja de mostrarse."] }
        ],
        ca: [
          { title: "Què pots consultar", items: ["Factures i venciments del lloguer", "Avisos actius i comunicacions del portal", "Incidències obertes i el seu seguiment", "Dades del perfil i context associat a l'accés"] },
          { title: "Per a què serveix cada secció", items: ["Inici resumeix el més important i mostra accions ràpides.", "Factures permet revisar imports, estats i còpies.", "Incidències serveix per obrir noves gestions i seguir les existents.", "Avisos concentra comunicacions que poden requerir lectura o confirmació."] },
          { title: "Com aprofitar millor l'autoservei", items: ["Revisa primer el panell d'inici per detectar pendents.", "Consulta avisos abans d'obrir una incidència si la gestió pot estar ja comunicada.", "Fes servir el portal per mantenir el context junt amb cada contracte o actiu."] },
          { title: "Accés ràpid com a app", items: ["L'opció per guardar el portal com a app ja no apareix a la portada pública, per no distreure quan encara no cal.", "Ara es mostra a l'accés al portal i dins de la zona privada, que és on realment ajuda a entrar més ràpid.", "Si el navegador permet instal·lar-la, veuràs l'acció per afegir accés ràpid.", "En iPhone o iPad es mostra l'ajuda per afegir el portal a la pantalla d'inici.", "Si ja estàs fent servir el portal com a app, el suggeriment deixa de mostrar-se."] }
        ],
        en: [
          { title: "What you can review", items: ["Rental invoices and due dates", "Active notices and portal communications", "Open incidents and their follow-up", "Profile data and context linked to access"] },
          { title: "What each section is for", items: ["Home summarizes the most important items and shows quick actions.", "Invoices lets you review amounts, statuses and copies.", "Incidents lets you open new requests and follow existing ones.", "Notices gathers communications that may require reading or confirmation."] },
          { title: "How to make better use of self-service", items: ["Check the home dashboard first to spot pending items.", "Review notices before opening an incident if the matter may already be communicated.", "Use the portal to keep context next to each contract or asset."] },
          { title: "Quick access as an app", items: ["The option to save the portal as an app no longer appears on the public home page so it does not distract before it is needed.", "It now appears on the portal access screen and inside the private area, where it really helps speed up entry.", "If the browser allows installation, you will see the action to add quick access.", "On iPhone or iPad, help is shown to add the portal to the home screen.", "If you are already using the portal as an app, the suggestion stops appearing."] }
        ]
      }
    },
    guidesIncidents: {
      metadata: {
        title: { es: "Que hacer si tienes una incidencia en el alquiler", ca: "Què fer si tens una incidència en el lloguer", en: "What to do if you have a rental incident" },
        description: {
          es: "Guia practica para comunicar incidencias, averias, consultas y solicitudes relacionadas con el alquiler.",
          ca: "Guia pràctica per comunicar incidències, avaries, consultes i sol·licituds relacionades amb el lloguer.",
          en: "Practical guide to reporting incidents, faults, questions and requests related to a rental."
        }
      },
      heroKicker: { es: "Guia de incidencias", ca: "Guia d'incidències", en: "Incident guide" },
      title: {
        es: "Que hacer si tienes una incidencia en el alquiler.",
        ca: "Què fer si tens una incidència en el lloguer.",
        en: "What to do if you have a rental incident."
      },
      body: {
        es: "Una incidencia se tramita mejor cuando llega con contexto claro. Esta guia resume que revisar antes y que informacion ayuda a resolver una gestion con mas rapidez.",
        ca: "Una incidència es tramita millor quan arriba amb context clar. Aquesta guia resumeix què revisar abans i quina informació ajuda a resoldre una gestió més ràpidament.",
        en: "An incident is handled better when it arrives with clear context. This guide summarizes what to review first and which information helps resolve a request faster."
      },
      ctaPrimary: { es: "Ir a incidencias", ca: "Anar a incidències", en: "Go to incidents" },
      ctaSecondary: { es: "Ver mas guias", ca: "Veure més guies", en: "View more guides" },
      items: {
        es: [
          { title: "Pasos recomendados", items: ["1. Comprueba si ya existe un aviso o una incidencia abierta relacionada.", "2. Reune el contexto clave: contrato, zona afectada, desde cuando ocurre y telefono de contacto.", "3. Abre la incidencia desde el portal indicando si es problema, solicitud o consulta.", "4. Aporta una descripcion concreta para facilitar la tramitacion y el seguimiento."] },
          { title: "Tipos de gestion mas habituales", items: ["Averia o problema: fuga de agua, fallo electrico, equipo que no funciona.", "Solicitud: peticion de aclaracion, necesidad de revisar un elemento o coordinar acceso.", "Consulta: duda sobre una gestion, un aviso o el uso del portal."] }
        ],
        ca: [
          { title: "Passos recomanats", items: ["1. Comprova si ja existeix un avís o una incidència oberta relacionada.", "2. Reuneix el context clau: contracte, zona afectada, des de quan passa i telèfon de contacte.", "3. Obre la incidència des del portal indicant si és problema, sol·licitud o consulta.", "4. Aporta una descripció concreta per facilitar la tramitació i el seguiment."] },
          { title: "Tipus de gestió més habituals", items: ["Avaria o problema: fuita d'aigua, fallada elèctrica, equip que no funciona.", "Sol·licitud: petició d'aclariment, necessitat de revisar un element o coordinar accés.", "Consulta: dubte sobre una gestió, un avís o l'ús del portal."] }
        ],
        en: [
          { title: "Recommended steps", items: ["1. Check whether a related notice or open incident already exists.", "2. Gather key context: contract, affected area, since when it has been happening and contact phone number.", "3. Open the incident from the portal indicating whether it is a problem, request or question.", "4. Add a specific description to make handling and follow-up easier."] },
          { title: "Most common request types", items: ["Fault or problem: water leak, electrical issue, equipment not working.", "Request: need for clarification, a check on an item or access coordination.", "Question: doubt about a request, a notice or how to use the portal."] }
        ]
      }
    },
    guidesInvoices: {
      metadata: {
        title: { es: "Como consultar facturas y vencimientos", ca: "Com consultar factures i venciments", en: "How to review invoices and due dates" },
        description: {
          es: "Guia sobre como consultar facturas, estados, importes pendientes y solicitar copias desde el portal privado.",
          ca: "Guia sobre com consultar factures, estats, imports pendents i sol·licitar còpies des del portal privat.",
          en: "Guide to checking invoices, statuses, outstanding amounts and requesting copies from the private portal."
        }
      },
      heroKicker: { es: "Guia de facturas", ca: "Guia de factures", en: "Invoice guide" },
      title: {
        es: "Como consultar facturas y vencimientos del alquiler.",
        ca: "Com consultar factures i venciments del lloguer.",
        en: "How to review rental invoices and due dates."
      },
      body: {
        es: "El portal ayuda a revisar importes, estados y copias de facturas sin depender de una gestion manual. Esta guia resume que mirar y donde hacerlo.",
        ca: "El portal ajuda a revisar imports, estats i còpies de factures sense dependre d'una gestió manual. Aquesta guia resumeix què mirar i on fer-ho.",
        en: "The portal helps review amounts, statuses and invoice copies without depending on manual handling. This guide summarizes what to review and where to do it."
      },
      ctaPrimary: { es: "Ir a facturas", ca: "Anar a factures", en: "Go to invoices" },
      ctaSecondary: { es: "Ver mas guias", ca: "Veure més guies", en: "View more guides" },
      items: {
        es: [{ title: "Puntos clave", items: ["La seccion Facturas muestra importes, fechas y estado de pago.", "Si una factura tiene importe pendiente, conviene revisar primero el vencimiento.", "Desde el portal se puede solicitar copia cuando se necesite una factura concreta.", "El panel de inicio destaca los recibos pendientes y la proxima referencia economica."] }],
        ca: [{ title: "Punts clau", items: ["La secció Factures mostra imports, dates i estat de pagament.", "Si una factura té import pendent, convé revisar primer el venciment.", "Des del portal es pot sol·licitar còpia quan es necessiti una factura concreta.", "El panell d'inici destaca els rebuts pendents i la propera referència econòmica."] }],
        en: [{ title: "Key points", items: ["The Invoices section shows amounts, dates and payment status.", "If an invoice has an outstanding amount, it is worth checking the due date first.", "From the portal you can request a copy when you need a specific invoice.", "The home dashboard highlights pending receipts and the next financial reference."] }]
      }
    },
    news: {
      metadata: {
        title: { es: "Noticias y avisos para clientes e inquilinos", ca: "Notícies i avisos per a clients i llogaters", en: "News and notices for clients and tenants" },
        description: {
          es: "Consulta noticias, avisos y novedades relacionadas con inmuebles en alquiler, incidencias y comunicaciones del portal.",
          ca: "Consulta notícies, avisos i novetats relacionades amb immobles de lloguer, incidències i comunicacions del portal.",
          en: "Review news, notices and updates related to rental properties, incidents and portal communications."
        }
      },
      heroKicker: { es: "Noticias y avisos", ca: "Notícies i avisos", en: "News and notices" },
      title: {
        es: "Noticias y avisos para clientes e inquilinos",
        ca: "Notícies i avisos per a clients i llogaters",
        en: "News and notices for clients and tenants"
      },
      body: {
        es: "Aquí puedes consultar avisos, novedades y recordatorios publicados para viviendas, locales en alquiler y su comunidad.",
        ca: "Aquí pots consultar avisos, novetats i recordatoris publicats per a habitatges, locals de lloguer i la seva comunitat.",
        en: "Here you can review notices, updates and reminders published for homes, rental units and their community."
      },
      backHome: { es: "Volver a la portada", ca: "Tornar a la portada", en: "Back to the home page" }
    }
  }
};

export function getPublicCopy(locale: PublicLocale) {
  return {
    locale,
    languageName: copy.languageName[locale],
    site: mapLocalized(copy.site, locale),
    header: mapLocalized(copy.header, locale),
    footer: mapLocalized(copy.footer, locale),
    home: mapHome(locale),
    forms: mapForms(locale),
    routes: mapRoutes(locale)
  };
}

function mapLocalized<T extends Record<string, LocalizedString>>(value: T, locale: PublicLocale) {
  return Object.fromEntries(
    Object.entries(value).map(([key, localized]) => [key, localized[locale]])
  ) as { [K in keyof T]: string };
}

function mapHome(locale: PublicLocale) {
  return {
    metadata: {
      title: copy.home.metadata.title[locale],
      description: copy.home.metadata.description[locale],
      keywords: copy.home.metadata.keywords[locale]
    },
    hero: {
      ...mapLocalized({
        kicker: copy.home.hero.kicker,
        title1: copy.home.hero.title1,
        title2: copy.home.hero.title2,
        title3: copy.home.hero.title3,
        body: copy.home.hero.body,
        primaryCta: copy.home.hero.primaryCta,
        secondaryCta: copy.home.hero.secondaryCta,
        trustKicker: copy.home.hero.trustKicker,
        trustBody: copy.home.hero.trustBody,
        imageAlt: copy.home.hero.imageAlt,
        institutional: copy.home.hero.institutional,
        institutionalValue: copy.home.hero.institutionalValue,
        portalCallout: copy.home.hero.portalCallout
      }, locale),
      signals: copy.home.hero.signals[locale],
      governancePoints: copy.home.hero.governancePoints[locale]
    },
    about: {
      ...mapLocalized({
        kicker: copy.home.about.kicker,
        title: copy.home.about.title,
        body1: copy.home.about.body1,
        body2: copy.home.about.body2,
        imageAlt: copy.home.about.imageAlt,
        continuityLabel: copy.home.about.continuityLabel,
        continuityText: copy.home.about.continuityText
      }, locale),
      points: copy.home.about.points[locale],
      principles: copy.home.about.principles[locale]
    },
    services: {
      ...mapLocalized({
        kicker: copy.home.services.kicker,
        title: copy.home.services.title
      }, locale),
      items: copy.home.services.items[locale]
    },
    guides: {
      ...mapLocalized({
        kicker: copy.home.guides.kicker,
        title: copy.home.guides.title,
        cardLabel: copy.home.guides.cardLabel,
        readGuide: copy.home.guides.readGuide,
        viewAll: copy.home.guides.viewAll
      }, locale),
      items: copy.home.guides.items[locale]
    },
    trust: {
      ...mapLocalized({
        kicker: copy.home.trust.kicker,
        title: copy.home.trust.title,
        body: copy.home.trust.body
      }, locale),
      highlights: copy.home.trust.highlights[locale]
    },
    availability: {
      ...mapLocalized({
        kicker: copy.home.availability.kicker,
        title: copy.home.availability.title,
        body: copy.home.availability.body,
        empty: copy.home.availability.empty
      }, locale),
      metrics: copy.home.availability.metrics[locale]
    },
    clientArea: {
      ...mapLocalized({
        kicker: copy.home.clientArea.kicker,
        title: copy.home.clientArea.title,
        body: copy.home.clientArea.body,
        imageAlt: copy.home.clientArea.imageAlt,
        quickView: copy.home.clientArea.quickView,
        cta: copy.home.clientArea.cta
      }, locale),
      features: copy.home.clientArea.features[locale],
      highlights: copy.home.clientArea.highlights[locale]
    },
    contact: {
      ...mapLocalized({
        kicker: copy.home.contact.kicker,
        title: copy.home.contact.title,
        body: copy.home.contact.body,
        helpLabel: copy.home.contact.helpLabel,
        writeUs: copy.home.contact.writeUs,
        alreadyClient: copy.home.contact.alreadyClient,
        alreadyClientBody: copy.home.contact.alreadyClientBody,
        secureAccess: copy.home.contact.secureAccess
      }, locale),
      clientFeatures: copy.home.contact.clientFeatures[locale],
      responsePoints: copy.home.contact.responsePoints[locale],
      contactItems: copy.home.contact.contactItems[locale]
    },
    faq: {
      ...mapLocalized({
        kicker: copy.home.faq.kicker,
        title: copy.home.faq.title,
        cta: copy.home.faq.cta
      }, locale),
      items: copy.home.faq.items[locale]
    }
  };
}

function mapForms(locale: PublicLocale) {
  return {
    contact: mapLocalized(copy.forms.contact as Record<string, LocalizedString>, locale),
    availability: mapLocalized(copy.forms.availability as Record<string, LocalizedString>, locale),
    errors: mapLocalized(copy.forms.errors as Record<string, LocalizedString>, locale)
  };
}

function mapRoutes(locale: PublicLocale) {
  return Object.fromEntries(
    Object.entries(copy.routes).map(([key, value]) => [
      key,
      {
        metadata: {
          title: value.metadata.title[locale],
          description: value.metadata.description[locale]
        },
        heroKicker: value.heroKicker?.[locale],
        title: value.title[locale],
        body: value.body[locale],
        cards: value.cards?.[locale],
        sections: value.sections?.[locale],
        highlights: value.highlights?.[locale],
        ctaPrimary: value.ctaPrimary?.[locale],
        ctaSecondary: value.ctaSecondary?.[locale],
        listTitle: value.listTitle?.[locale],
        listItems: value.listItems?.[locale],
        items: value.items?.[locale],
        backHome: value.backHome?.[locale],
        guideCards: value.guideCards?.[locale]
      }
    ])
  ) as {
    [K in keyof PublicCopy["routes"]]: {
      metadata: { title: string; description: string };
      heroKicker?: string;
      title: string;
      body: string;
      cards?: string[];
      sections?: Array<{ title: string; text: string }>;
      highlights?: string[];
      ctaPrimary?: string;
      ctaSecondary?: string;
      listTitle?: string;
      listItems?: string[];
      items?: Array<{ title: string; items: string[] }>;
      backHome?: string;
      guideCards?: Array<{ routeKey: "guidesPortal" | "guidesIncidents" | "guidesInvoices"; title: string; description: string }>;
    };
  };
}
