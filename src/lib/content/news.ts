import "server-only";
import { readContentFile, writeContentFile } from "@/lib/content/storage";

export type NewsItem = {
  id: string;
  category: string;
  categoryColor: string;
  categoryBackground: string;
  date: string;
  title: string;
  description: string;
  link: string;
};

function normalizeItem(item: Partial<NewsItem>, index: number): NewsItem {
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

export async function listNewsItems() {
  const raw = await readContentFile("news.json");
  const parsed = JSON.parse(raw) as Partial<NewsItem>[];
  return parsed.map(normalizeItem);
}

export async function saveNewsItems(items: NewsItem[]) {
  const normalized = items.map(normalizeItem);
  await writeContentFile("news.json", `${JSON.stringify(normalized, null, 2)}\n`);
  return normalized;
}
