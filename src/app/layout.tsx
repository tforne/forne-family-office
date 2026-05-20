import "./globals.css";
import type { Metadata } from "next";
import type { Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
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
  manifest: "/manifest.webmanifest",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Forné Family Office"
  },
  formatDetection: {
    telephone: false
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  themeColor: "#0F2F57",
  colorScheme: "light"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        {process.env.NODE_ENV !== "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  if (!('serviceWorker' in navigator) || !window.caches) return;
                  navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    registrations.forEach(function (registration) {
                      registration.unregister().catch(function () {});
                    });
                  });
                  caches.keys().then(function (keys) {
                    keys
                      .filter(function (key) { return key.indexOf('ffo-static') === 0; })
                      .forEach(function (key) {
                        caches.delete(key).catch(function () {});
                      });
                  });
                })();
              `
            }}
          />
        ) : null}
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
