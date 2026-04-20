import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-forne-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forne-forest text-sm font-semibold text-white">F</div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-forne-forest">Forné Family Office</div>
            <div className="text-xs text-forne-slate">Gestión patrimonial y alquileres</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/#quienes-somos" className="text-sm font-medium text-forne-slate hover:text-forne-forest">Quiénes somos</Link>
          <Link href="/alquileres" className="text-sm font-medium text-forne-slate hover:text-forne-forest">Alquileres</Link>
          <Link href="/contacto" className="text-sm font-medium text-forne-slate hover:text-forne-forest">Contacto</Link>
        </nav>
        <Link href="/login" className="rounded-2xl border border-forne-stone bg-white px-4 py-2.5 text-sm font-semibold text-forne-forest">Acceso clientes</Link>
      </div>
    </header>
  );
}
