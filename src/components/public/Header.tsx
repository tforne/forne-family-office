import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E1DFDD] bg-white/92 backdrop-blur-md">
      <div className="ffo-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0078D4] text-sm font-semibold text-white shadow-sm">
            F
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-[#201F1E]">Forné Family Office</div>
            <div className="text-xs text-[#605E5C]">Alquileres · Atención · Portal privado</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/#quienes-somos" className="ffo-link-underline text-sm font-medium text-[#323130] hover:text-[#0078D4]">
            Quiénes somos
          </Link>
          <Link href="/#servicios" className="ffo-link-underline text-sm font-medium text-[#323130] hover:text-[#0078D4]">
            Servicios
          </Link>
          <Link href="/#portal" className="ffo-link-underline text-sm font-medium text-[#323130] hover:text-[#0078D4]">
            Portal
          </Link>
          <Link href="/contacto" className="ffo-link-underline text-sm font-medium text-[#323130] hover:text-[#0078D4]">
            Contacto
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-[#0078D4] transition hover:text-[#106EBE] lg:inline-flex">
            Acceso clientes
          </Link>
          <Link href="/#disponibilidad" className="rounded bg-[#0078D4] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_-18px_rgba(0,120,212,0.9)] transition hover:bg-[#106EBE]">
            Consultar disponibilidad
          </Link>
        </div>
      </div>
    </header>
  );
}
