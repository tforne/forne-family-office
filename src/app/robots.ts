import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";

const publicAllow = ["/es", "/es/:path*", "/ca", "/ca/:path*", "/en", "/en/:path*"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: publicAllow,
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
