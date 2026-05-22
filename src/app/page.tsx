import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import AvailabilitySection from "@/components/public/AvailabilitySection";
import AboutSection from "@/components/public/AboutSection";
import ClientAreaSection from "@/components/public/ClientAreaSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import GuidesSection from "@/components/public/GuidesSection";
import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import ServicesSection from "@/components/public/ServicesSection";
import TrustSection from "@/components/public/TrustSection";
import { env } from "@/lib/config/env";

export const metadata: Metadata = {
  title: "Forné Family Office | Gestión inmobiliaria con criterio",
  description:
    "Forné Family Office presenta una gestión inmobiliaria con criterio, gobernanza, atención directa y portal privado para clientes e inquilinos.",
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  noStore();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Que puedo hacer desde el portal privado",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Consultar facturas, revisar avisos, seguir incidencias y acceder a informacion centralizada vinculada al alquiler."
        }
      },
      {
        "@type": "Question",
        name: "Trabajais solo alquiler residencial",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. La gestion contempla tanto viviendas como locales, con un enfoque de orden operativo, atencion directa y portal privado."
        }
      },
      {
        "@type": "Question",
        name: "Como se solicita informacion sobre disponibilidad",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Desde la portada se pueden dejar los datos y el interes en disponibilidad para recibir una respuesta mas ajustada."
        }
      },
      {
        "@type": "Question",
        name: "Que diferencia esta gestion de una atencion mas tradicional",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Combina trato cercano con un entorno digital donde la informacion, las facturas, los avisos y las incidencias conservan contexto."
        }
      }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    email: "office@forne.family",
    image: [
      `${env.appBaseUrl}/icon.png`
    ],
    areaServed: ["Barcelona", "Montornès del Vallès", "Granollers"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Barcelona",
      addressRegion: "Barcelona",
      addressCountry: "ES"
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00"
      }
    ],
    knowsAbout: [
      "alquiler de pisos",
      "alquiler de locales",
      "gestion de alquileres",
      "portal del inquilino",
      "incidencias de inmuebles",
      "facturacion de alquileres"
    ],
    description:
      "Gestión profesional de alquiler de pisos y locales con atención personalizada y portal privado para clientes e inquilinos."
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    inLanguage: "es-ES",
    about: {
      "@type": "Thing",
      name: "Gestion de alquileres residenciales y comerciales"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    email: "office@forne.family",
    logo: `${env.appBaseUrl}/icon.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "office@forne.family",
        availableLanguage: ["es", "ca", "en"],
        areaServed: ["ES"]
      }
    ],
    areaServed: ["Barcelona", "Montornès del Vallès", "Granollers"],
    knowsAbout: [
      "alquiler residencial",
      "alquiler comercial",
      "gestion de incidencias",
      "facturas de alquiler",
      "portal privado para inquilinos"
    ],
    sameAs: []
  };

  return (
    <main className="min-h-screen bg-transparent">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <Hero />
      <AboutSection />
      <ServicesSection />
      <GuidesSection />
      <TrustSection />
      <AvailabilitySection />
      <ClientAreaSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
