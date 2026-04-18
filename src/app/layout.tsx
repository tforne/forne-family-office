import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forné Family Office",
  description: "Gestión patrimonial y alquileres con atención personalizada.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
