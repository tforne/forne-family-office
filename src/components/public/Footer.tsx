import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-forne-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <div className="text-lg font-semibold text-forne-forest">Forné Family Office</div>
          <div className="mt-2 text-sm text-forne-slate">Gestión patrimonial y alquileres con atención personalizada</div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-forne-slate">
          <Link href="/">Inicio</Link>
          <Link href="/alquileres">Alquileres</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/login">Acceso clientes</Link>
        </div>
      </div>
    </footer>
  );
}
