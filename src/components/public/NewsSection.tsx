import { listNewsItems } from "@/lib/content/news";

function parseSpanishDate(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const normalized = value
    .toLowerCase()
    .replace("enero", "january")
    .replace("febrero", "february")
    .replace("marzo", "march")
    .replace("abril", "april")
    .replace("mayo", "may")
    .replace("junio", "june")
    .replace("julio", "july")
    .replace("agosto", "august")
    .replace("septiembre", "september")
    .replace("octubre", "october")
    .replace("noviembre", "november")
    .replace("diciembre", "december");

  const translated = Date.parse(normalized);
  return Number.isNaN(translated) ? 0 : translated;
}

function pickFeaturedNewsItems<T extends { date: string }>(items: T[], count: number) {
  return [...items]
    .sort((left, right) => parseSpanishDate(right.date) - parseSpanishDate(left.date))
    .slice(0, count);
}

export default async function NewsSection() {
  const newsItems = await listNewsItems();
  const featuredNewsItems = pickFeaturedNewsItems(newsItems, 3);

  return (
    <section id="noticias" className="bg-white py-20 lg:py-28">
      <div className="ffo-shell">
        <div className="max-w-4xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Noticias y avisos</span>
          </div>
          <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#003A6C] sm:text-[2.65rem]">
            Mantente informado sobre tu inmueble.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#605E5C]">
            Publicamos aquí los comunicados, avisos de mantenimiento y novedades del portal para
            que siempre estés al día.
          </p>
        </div>

        <div className="mt-12 grid gap-6 xl:grid-cols-3">
          {featuredNewsItems.map((item) => (
            <article
              key={item.id}
              className="ffo-elevate rounded-[18px] border border-[#E1DFDD] bg-white p-6 shadow-[0_18px_40px_-34px_rgba(0,58,108,0.22)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className="rounded-md px-3 py-1 text-xs font-semibold"
                  style={{
                    color: item.categoryColor,
                    backgroundColor: item.categoryBackground
                  }}
                >
                  {item.category}
                </span>
                <span className="text-sm text-[#A19F9D]">{item.date}</span>
              </div>

              <h3 className="mt-6 text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-[#0F172A]">
                {item.title}
              </h3>
              <p className="mt-5 text-base leading-8 text-[#605E5C]">{item.description}</p>

              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0078D4] transition hover:text-[#106EBE]"
                >
                  Más información
                  <span aria-hidden="true">›</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="/noticias"
            className="inline-flex items-center justify-center rounded border border-[#0078D4] px-6 py-3 text-sm font-semibold text-[#0078D4] transition hover:bg-[#EFF6FC]"
          >
            Ver todas las noticias y avisos
          </a>
        </div>
      </div>
    </section>
  );
}
