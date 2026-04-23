import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-forne-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forne-ink text-sm font-semibold text-white shadow-sm">F</div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-forne-ink">Forné Family Office</div>
            <div className="text-xs text-forne-muted">Alquileres, atención y portal privado</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/#quienes-somos" className="text-sm font-medium text-forne-muted hover:text-forne-ink">Quiénes somos</Link>
          <Link href="/alquileres" className="text-sm font-medium text-forne-muted hover:text-forne-ink">Alquileres</Link>
          <Link href="/contacto" className="text-sm font-medium text-forne-muted hover:text-forne-ink">Contacto</Link>
        </nav>
        <Link href="/login" className="rounded-xl bg-forne-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm">Acceso clientes</Link>
      </div>
    </header>
  );
}
