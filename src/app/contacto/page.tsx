import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-forne-cloud text-forne-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-forne-muted">Contacto</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Hablemos</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-forne-muted">
          Cuéntanos qué necesitas y revisaremos la mejor forma de ayudarte.
        </p>
        <div className="mt-10 max-w-2xl rounded-[28px] border border-forne-line bg-white p-8 shadow-sm">
          <div className="grid gap-4">
            <input className="rounded-xl border border-forne-line px-4 py-3 text-sm outline-none focus:border-forne-ink" placeholder="Nombre" />
            <input className="rounded-xl border border-forne-line px-4 py-3 text-sm outline-none focus:border-forne-ink" placeholder="Correo electrónico" />
            <input className="rounded-xl border border-forne-line px-4 py-3 text-sm outline-none focus:border-forne-ink" placeholder="Asunto" />
            <textarea className="min-h-36 rounded-xl border border-forne-line px-4 py-3 text-sm outline-none focus:border-forne-ink" placeholder="Mensaje" />
            <button className="rounded-xl bg-forne-ink px-5 py-3.5 text-sm font-semibold text-white">Enviar</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
