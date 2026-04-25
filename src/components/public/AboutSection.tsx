const TEAM_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-reunion-bZEqzwTwSLMFKRFnp7K8Db.webp";

const points = [
  "Atención personalizada para cada inquilino",
  "Portal privado con información en tiempo real",
  "Respuesta garantizada en menos de 24 horas",
  "Gestión transparente de facturas e incidencias"
];

export default function AboutSection() {
  return (
    <section id="quienes-somos" className="bg-white py-20 lg:py-28">
      <div className="ffo-shell grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-32 w-32 rounded-[28px] bg-[#EFF6FC]" />
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_70px_-38px_rgba(0,58,108,0.32)]">
            <img
              src={TEAM_IMAGE}
              alt="Equipo de Forné Family Office"
              className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[500px]"
            />
          </div>
          <div className="absolute -bottom-5 right-0 rounded-[20px] bg-[#0078D4] p-5 text-white shadow-[0_24px_40px_-24px_rgba(0,120,212,0.85)]">
            <div className="text-3xl font-semibold">35+</div>
            <p className="mt-1 max-w-[160px] text-xs leading-5 text-white/85">
              años gestionando alquileres con confianza
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Nuestra forma de gestionar</span>
          </div>

          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#003A6C] sm:text-[2.65rem]">
            Alquileres bien atendidos, con información clara y trato directo.
          </h2>

          <p className="mt-5 text-base leading-8 text-[#605E5C]">
            Sabemos que vivir o trabajar en un inmueble gestionado exige confianza. Por eso
            combinamos atención personal, procesos ordenados y un portal privado donde cada cliente
            e inquilino puede consultar su información y comunicar necesidades con facilidad.
          </p>

          <p className="mt-5 text-base leading-8 text-[#605E5C]">
            Somos una empresa familiar con más de treinta y cinco años de experiencia en la gestión
            de alquileres residenciales y comerciales. Nuestro enfoque es siempre el mismo:
            cercanía, transparencia y respuesta ágil a cada necesidad.
          </p>

          <div className="mt-8 grid gap-3">
            {points.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FC] text-[11px] text-[#0078D4]">
                  ✓
                </div>
                <span className="text-sm leading-6 text-[#323130]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
