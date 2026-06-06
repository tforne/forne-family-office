import bundledNews from "@/data/news.json";
import { getLocalizedNewsContent } from "@/lib/i18n/news";
import type { PublicLocale } from "@/lib/i18n/public";

export type BundledNewsItem = {
  id: string;
  category: string;
  categoryColor: string;
  categoryBackground: string;
  date: string;
  title: string;
  description: string;
  link: string;
};

function normalizeItem(item: Partial<BundledNewsItem>, index: number): BundledNewsItem {
  return {
    id: String(item.id || `news-${index + 1}`),
    category: String(item.category || "Aviso"),
    categoryColor: String(item.categoryColor || "#0078D4"),
    categoryBackground: String(item.categoryBackground || "#EAF4FE"),
    date: String(item.date || ""),
    title: String(item.title || ""),
    description: String(item.description || ""),
    link: String(item.link || "")
  };
}

export function listBundledNewsItemsForLocale(locale: PublicLocale) {
  return (bundledNews as Partial<BundledNewsItem>[]).map(normalizeItem).map((item) => {
    const localized = getLocalizedNewsContent(item.id, locale);
    if (!localized) {
      return item;
    }

    return {
      ...item,
      category: localized.category,
      date: localized.date,
      title: localized.title,
      description: localized.description
    };
  });
}
