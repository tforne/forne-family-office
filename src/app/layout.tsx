import "./globals.css";
import type { Metadata } from "next";
import { env } from "@/lib/config/env";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
