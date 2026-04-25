import { listNewsItems } from "@/lib/content/news";

function pickRandomItems<T>(items: T[], count: number) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export default async function NewsSection() {
  const newsItems = await listNewsItems();
  const featuredNewsItems = pickRandomItems(newsItems, 3);

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
              className="rounded-[18px] border border-[#E1DFDD] bg-white p-6 shadow-[0_18px_40px_-34px_rgba(0,58,108,0.22)]"
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
      </div>
    </section>
  );
}
