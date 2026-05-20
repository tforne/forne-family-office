import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Forné Family Office",
    short_name: "Forné",
    description:
      "Portal de alquileres, incidencias, facturas y seguimiento para clientes e inquilinos de Forné Family Office.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7FBFF",
    theme_color: "#0F2F57",
    lang: "es-ES",
    categories: ["business", "productivity", "real-estate"],
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
