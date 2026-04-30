import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal/", "/api/", "/login"]
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/", "/alquileres", "/contacto", "/noticias"],
        disallow: ["/portal/", "/api/", "/login"]
      },
      {
        userAgent: "GPTBot",
        disallow: "/"
      }
    ],
    sitemap: `${env.appBaseUrl}/sitemap.xml`,
    host: env.appBaseUrl
  };
}
