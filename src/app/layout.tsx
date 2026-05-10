import "./globals.css";
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { env } from "@/lib/config/env";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appBaseUrl),
  title: {
    default: "Forné Family Office | Alquiler de pisos y locales",
    template: "%s | Forné Family Office"
  },
  description:
    "Alquiler de pisos y locales con atención personalizada, gestión profesional e información clara para clientes e inquilinos.",
  keywords: [
    "alquiler de pisos",
    "alquiler de locales",
    "alquiler en Barcelona",
    "alquiler en Montornès",
    "gestión de alquileres",
    "portal del inquilino"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Forné Family Office | Alquiler de pisos y locales",
    description:
      "Gestión profesional de alquiler de pisos y locales con atención cercana, portal privado y seguimiento claro.",
    url: "/",
    siteName: "Forné Family Office",
    locale: "es_ES",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Forné Family Office | Alquiler de pisos y locales",
    description:
      "Gestion profesional de alquileres con portal privado, facturas, incidencias y seguimiento claro."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
