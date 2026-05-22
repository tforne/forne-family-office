const highlights = [
  "Residencial y comercial",
  "Barcelona, Montornès y entorno",
  "Interlocución directa y acceso privado"
];

export default function TrustSection() {
  return (
    <section className="bg-transparent pb-10 pt-1 lg:pb-14 lg:pt-2">
      <div className="ffo-shell">
        <div className="ffo-panel rounded-[30px] p-8 lg:p-10">
          <div className="max-w-[58rem]">
            <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Una forma de estar</span>
          </div>
            <h2 className="max-w-[20ch] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10233A] sm:text-[2.7rem]">
              Una presencia más silenciosa, más clara y más segura de sí misma.
            </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5D6776]">
            La experiencia pública se apoya en orden visual, mejor jerarquía y una sensación de
            servicio cuidado desde el primer vistazo, sin necesidad de sobreactuar.
          </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(24,32,43,0.1)] bg-white/84 px-4 py-2 text-sm text-[#18202B]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
