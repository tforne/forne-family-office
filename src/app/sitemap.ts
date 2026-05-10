import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: env.appBaseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${env.appBaseUrl}/alquileres`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${env.appBaseUrl}/contacto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${env.appBaseUrl}/guias`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${env.appBaseUrl}/guias/portal-privado`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${env.appBaseUrl}/guias/incidencias-alquiler`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${env.appBaseUrl}/guias/facturas-y-vencimientos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${env.appBaseUrl}/noticias`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${env.appBaseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3
    }
  ];
}
