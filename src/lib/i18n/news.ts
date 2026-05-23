import type { PublicLocale } from "@/lib/i18n/public";

export type LocalizedNewsContent = {
  category: string;
  date: string;
  title: string;
  description: string;
};

const translations: Record<string, Partial<Record<Exclude<PublicLocale, "es">, LocalizedNewsContent>>> = {
  "revision-instalaciones-electricas": {
    ca: {
      category: "Manteniment",
      date: "Abril 2026",
      title: "Revisió anual d'instal·lacions elèctriques",
      description: "Durant el mes d'abril es faran inspeccions periòdiques als immobles de la cartera. Els llogaters afectats seran contactats individualment amb almenys 48 hores d'antelació per coordinar l'accés."
    },
    en: {
      category: "Maintenance",
      date: "April 2026",
      title: "Annual review of electrical installations",
      description: "During April, periodic inspections will be carried out across the managed properties. Affected tenants will be contacted individually at least 48 hours in advance to coordinate access."
    }
  },
  "descarga-facturas-pdf": {
    ca: {
      category: "Portal",
      date: "Març 2026",
      title: "Nova funció: descàrrega de factures en PDF",
      description: "Des del portal privat ja és possible descarregar totes les factures en format PDF directament des de la fitxa de l'immoble. La millora està disponible per a tots els llogaters actius sense necessitat de sol·licitud prèvia."
    },
    en: {
      category: "Portal",
      date: "March 2026",
      title: "New feature: download invoices as PDF",
      description: "From the private portal it is now possible to download every invoice in PDF format directly from the property record. The improvement is available to all active tenants without a prior request."
    }
  },
  "actualizacion-horario-atencion": {
    ca: {
      category: "Avís general",
      date: "Febrer 2026",
      title: "Actualització de l'horari d'atenció telefònica",
      description: "A partir de l'1 de març l'horari d'atenció telefònica passa a ser de dilluns a divendres de 9:00 a 14:00 h. Fora d'aquest horari, les consultes es poden enviar per correu a office@forne.family i es respondran en menys de 24 hores."
    },
    en: {
      category: "General notice",
      date: "February 2026",
      title: "Updated phone support hours",
      description: "Starting March 1, phone support hours will be Monday to Friday from 9:00 to 14:00. Outside those hours, enquiries can be sent to office@forne.family and will be answered within 24 hours."
    }
  },
  "ajudas-lloguer-36-64": {
    ca: {
      category: "Ajuts",
      date: "14 abril 2026",
      title: "Oberta la convocatòria d'ajuts al lloguer per a persones de 36 a 64 anys",
      description: "L'Ajuntament de Montornès del Vallès ha difós l'obertura de la convocatòria d'ajuts al pagament del lloguer per a persones d'entre 36 i 64 anys. El termini de sol·licitud està obert des del 14 d'abril i finalitza el 30 d'abril de 2026."
    },
    en: {
      category: "Housing support",
      date: "April 14, 2026",
      title: "Rental aid applications open for people aged 36 to 64",
      description: "Montornès del Vallès City Council has announced the opening of rental aid applications for people between 36 and 64 years old. The application period opened on April 14 and closes on April 30, 2026."
    }
  },
  "contenedores-inteligentes-residuos": {
    ca: {
      category: "Municipi",
      date: "Abril 2026",
      title: "Entra en funcionament el nou sistema de residus amb contenidors intel·ligents",
      description: "Montornès del Vallès ha posat en funcionament a l'abril el nou model de recollida selectiva amb contenidors intel·ligents. A més, el consistori manté un període extraordinari per recollir targetes d'obertura i accés a l'app ReciclaVO durant les primeres setmanes d'implantació."
    },
    en: {
      category: "Municipality",
      date: "April 2026",
      title: "New waste collection system with smart containers goes live",
      description: "Montornès del Vallès launched in April its new selective waste collection model using smart containers. The council is also keeping an extraordinary period open to collect opening cards and access to the ReciclaVO app during the first weeks of rollout."
    }
  },
  "suport-comunitats-veins": {
    ca: {
      category: "Convivència",
      date: "Abril 2026",
      title: "Disponible el servei municipal de suport a comunitats de veïns",
      description: "El municipi ofereix un servei d'orientació per a comunitats veïnals sobre organització interna, convivència, impagaments, participació en juntes i manteniment. L'atenció es presta a l'Oficina d'Atenció Ciutadana Nord els dijous d'11:00 a 19:00 h."
    },
    en: {
      category: "Community life",
      date: "April 2026",
      title: "Municipal support service for neighbor communities available",
      description: "The municipality offers a guidance service for neighborhood communities covering internal organization, coexistence, arrears, participation in meetings and maintenance. Support is provided at the North Citizen Service Office on Thursdays from 11:00 to 19:00."
    }
  },
  "normas-convivencia-nocturna": {
    ca: {
      category: "Comunitat",
      date: "Guia del pis",
      title: "Recorda respectar el descans veïnal i l'ús de les zones comunes",
      description: "La guia de convivència de l'immoble recorda evitar sorolls molestos, especialment entre les 22:00 i les 8:00, no organitzar festes que alterin la tranquil·litat de l'edifici i mantenir nets portal, escales i la resta d'espais comuns."
    },
    en: {
      category: "Community",
      date: "Home guide",
      title: "Please respect neighbors' rest and the use of common areas",
      description: "The building coexistence guide reminds residents to avoid disruptive noise, especially between 22:00 and 8:00, not to organize parties that disturb the building and to keep the entrance, stairs and common areas clean."
    }
  },
  "mantenimiento-preventivo-vivienda": {
    ca: {
      category: "Habitatge",
      date: "Guia del pis",
      title: "Manteniment preventiu anual de caldera, termo i equips del pis",
      description: "La documentació de l'habitatge indica que el llogater ha de fer manteniment preventiu anual, al seu càrrec i mitjançant tècnic qualificat, en els equips que ho requereixin, com la caldera o el termo i el dispositiu PURAIR, per assegurar-ne el bon funcionament."
    },
    en: {
      category: "Home",
      date: "Home guide",
      title: "Annual preventive maintenance for boiler, heater and home equipment",
      description: "The home documentation states that the tenant must carry out annual preventive maintenance, at their own cost and using a qualified technician, on equipment that requires it, such as the boiler, water heater and PURAIR device, to ensure proper operation."
    }
  }
};

export function getLocalizedNewsContent(id: string, locale: PublicLocale) {
  if (locale === "es") {
    return null;
  }

  return translations[id]?.[locale] ?? null;
}
