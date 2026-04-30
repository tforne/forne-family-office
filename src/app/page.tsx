import type { Metadata } from "next";
import AboutSection from "@/components/public/AboutSection";
import ClientAreaSection from "@/components/public/ClientAreaSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import NewsSection from "@/components/public/NewsSection";
import ServicesSection from "@/components/public/ServicesSection";
import { env } from "@/lib/config/env";

export const metadata: Metadata = {
  title: "Alquiler de pisos y locales",
  description:
    "Forné Family Office gestiona alquiler de pisos y locales con atención al inquilino, incidencias, facturas y seguimiento profesional.",
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    email: "office@forne.family",
    areaServed: ["Barcelona", "Montornès del Vallès", "Granollers"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Barcelona",
      addressCountry: "ES"
    },
    description:
      "Gestión profesional de alquiler de pisos y locales con atención personalizada y portal privado para clientes e inquilinos."
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    inLanguage: "es-ES"
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    email: "office@forne.family",
    logo: `${env.appBaseUrl}/icon.png`,
    sameAs: []
  };

  return (
    <main className="min-h-screen bg-white">
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
      <Header />
      <Hero />
      <AboutSection />
      <ServicesSection />
      <NewsSection />
      <ClientAreaSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
