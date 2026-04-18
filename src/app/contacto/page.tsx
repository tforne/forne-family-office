import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-forne-cream text-forne-forest">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-forne-slate">Contacto</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Estamos disponibles para ayudarte</h1>
          <p className="mt-5 text-lg leading-8 text-forne-slate">Si quieres conocer nuestros servicios de alquiler o necesitas información sobre tu relación contractual, puedes escribirnos desde este formulario.</p>
        </div>
        <div className="mt-12 max-w-2xl rounded-[32px] border border-forne-stone bg-white p-8 shadow-sm">
          <div className="grid gap-4">
            <input className="rounded-2xl border border-forne-stone px-4 py-3 text-sm" placeholder="Nombre" />
            <input className="rounded-2xl border border-forne-stone px-4 py-3 text-sm" placeholder="Correo electrónico" />
            <input className="rounded-2xl border border-forne-stone px-4 py-3 text-sm" placeholder="Asunto" />
            <textarea className="min-h-36 rounded-2xl border border-forne-stone px-4 py-3 text-sm" placeholder="Mensaje" />
            <button className="rounded-2xl bg-forne-forest px-5 py-3.5 text-sm font-semibold text-white">Enviar</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
