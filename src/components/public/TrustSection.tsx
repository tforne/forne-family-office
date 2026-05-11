const pillars = [
  {
    title: "Operativa bien resuelta",
    description:
      "La experiencia mejora cuando la gestión diaria está ordenada: facturas, incidencias, avisos y seguimiento en un mismo ecosistema."
  },
  {
    title: "Relación más clara",
    description:
      "Cliente, inquilino y equipo de gestión comparten más contexto. Eso reduce fricción y mejora la percepción del servicio."
  },
  {
    title: "Presencia digital útil",
    description:
      "El portal privado no es un extra cosmético: es una herramienta real para dar continuidad y visibilidad a cada gestión."
  }
];

const highlights = [
  "Gestión residencial y comercial",
  "Barcelona, Montornès y entorno",
  "Atención directa y portal privado"
];

export default function TrustSection() {
  return (
    <section className="bg-transparent pb-12 pt-0 lg:pb-16">
      <div className="ffo-shell">
        <div className="ffo-panel overflow-hidden p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="ffo-accent-line" />
                <span className="ffo-kicker">Por qué se siente diferente</span>
              </div>
              <h2 className="max-w-xl text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
                Una web más profesional empieza por una gestión que también lo parece.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#5D6776]">
                Hemos llevado la web hacia una presencia más premium porque el servicio que
                comunica también pide esa misma solidez: menos improvisación, más claridad y una
                experiencia digital que transmite orden.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[rgba(24,32,43,0.1)] bg-white/80 px-4 py-2 text-sm text-[#18202B]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {pillars.map((item) => (
                <article
                  key={item.title}
                  className="ffo-elevate rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/86 p-6"
                >
                  <h3 className="text-[1.6rem] font-semibold text-[#18202B]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5D6776]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
