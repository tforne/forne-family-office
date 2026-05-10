import Link from "next/link";

const faqs = [
  {
    question: "¿Qué puedo hacer desde el portal privado?",
    answer:
      "Consultar facturas, revisar avisos, seguir incidencias y acceder a información centralizada vinculada a tu alquiler."
  },
  {
    question: "¿Trabajáis solo alquiler residencial?",
    answer:
      "No. La gestión contempla tanto viviendas como locales, con el mismo enfoque de orden operativo y atención directa."
  },
  {
    question: "¿Cómo se solicita información sobre disponibilidad?",
    answer:
      "Desde la portada puedes dejar tus datos e interés. El equipo revisa la necesidad y responde con una orientación más ajustada."
  },
  {
    question: "¿Qué diferencia a esta gestión de una atención más tradicional?",
    answer:
      "La combinación de trato cercano con un entorno digital donde la información no se pierde y cada gestión conserva contexto."
  }
];

export default function FaqSection() {
  return (
    <section className="bg-transparent py-20 lg:py-28">
      <div className="ffo-shell">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Preguntas frecuentes</span>
          </div>
          <h2 className="text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
            Respuestas claras para una experiencia más confiable.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((item) => (
            <article
              key={item.question}
              className="ffo-elevate rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/90 p-6"
            >
              <h3 className="text-[1.45rem] font-semibold text-[#18202B]">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5D6776]">{item.answer}</p>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/guias"
            className="inline-flex items-center rounded-[14px] border border-[rgba(27,111,216,0.22)] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1B6FD8] transition hover:bg-[#EDF5FF]"
          >
            Ver guias detalladas
          </Link>
        </div>
      </div>
    </section>
  );
}
