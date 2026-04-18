const services = [
  { title: 'Alquiler residencial', description: 'Gestión profesional de inmuebles residenciales con seguimiento cercano del contrato.' },
  { title: 'Gestión de contratos', description: 'Control documental, fechas clave y visibilidad sobre el estado contractual.' },
  { title: 'Seguimiento de incidencias', description: 'Canales claros para registrar y consultar incidencias relacionadas con el inmueble.' },
  { title: 'Atención al inquilino', description: 'Relación directa, ordenada y profesional durante toda la vida del contrato.' },
  { title: 'Documentación centralizada', description: 'Acceso privado a contratos, documentación y comunicaciones relevantes.' },
  { title: 'Gestión patrimonial', description: 'Visión estructurada del activo con una gestión enfocada en continuidad y calidad.' },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-forne-slate">Servicios</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-forne-forest sm:text-4xl">Servicios de alquiler y gestión con enfoque patrimonial</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-forne-stone bg-forne-cream p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-forne-forest" />
              <h3 className="mt-5 text-lg font-semibold text-forne-forest">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-forne-slate">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
