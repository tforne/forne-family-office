import { notFound } from "next/navigation";
import PublicRouteRenderer from "@/components/public/PublicRouteRenderer";
import {
  getRouteKeyFromSegments,
  isPublicLocale,
  publicLocales,
  type PublicLocale
} from "@/lib/i18n/public";
import { buildMetadata } from "@/lib/i18n/public-metadata";

type LocalizedPageProps = {
  params: {
    locale: string;
    slug?: string[];
  };
};

export async function generateMetadata({ params }: LocalizedPageProps) {
  if (!isPublicLocale(params.locale)) {
    return {};
  }

  const routeKey = getRouteKeyFromSegments(params.locale, params.slug);
  if (!routeKey) {
    return {};
  }

  return buildMetadata(params.locale, routeKey);
}

export function generateStaticParams() {
  return publicLocales.map((locale) => ({ locale }));
}

export default function LocalizedPublicPage({ params }: LocalizedPageProps) {
  if (!isPublicLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as PublicLocale;
  const routeKey = getRouteKeyFromSegments(locale, params.slug);

  if (!routeKey) {
    notFound();
  }

  return <PublicRouteRenderer locale={locale} routeKey={routeKey} />;
}
