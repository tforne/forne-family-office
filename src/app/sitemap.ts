import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";
import {
  getLocalizedPath,
  getRouteAlternates,
  publicLocales,
  type PublicRouteKey
} from "@/lib/i18n/public";

const routeKeys: PublicRouteKey[] = [
  "home",
  "rentals",
  "contact",
  "guides",
  "guidesPortal",
  "guidesIncidents",
  "guidesInvoices",
  "news"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localizedEntries = publicLocales.flatMap((locale) =>
    routeKeys.map((routeKey) => ({
      url: `${env.appBaseUrl}${getLocalizedPath(locale, routeKey)}`,
      lastModified: now,
      changeFrequency: routeKey === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: routeKey === "home" ? 1 : routeKey === "rentals" ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(getRouteAlternates(routeKey)).map(([language, path]) => [language, `${env.appBaseUrl}${path}`])
        )
      }
    }))
  );

  return [
    ...localizedEntries,
    {
      url: `${env.appBaseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: `${env.appBaseUrl}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3
    }
  ];
}
