"use client";

type MediaCategoryTabsProps = {
  categories: Array<{
    id: string;
    label: string;
    count: number;
  }>;
  activeCategory: string;
  onSelect: (categoryId: string) => void;
};

export default function MediaCategoryTabs({
  categories,
  activeCategory,
  onSelect
}: MediaCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const active = category.id === activeCategory;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] text-white shadow-[0_18px_34px_-24px_rgba(15,47,87,0.65)]"
                : "border border-forne-line bg-white text-forne-muted hover:text-forne-ink"
            }`}
          >
            <span>{category.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/16" : "bg-forne-cloud"}`}>
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
