import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#201F1E] text-white">
      <div className="ffo-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0078D4] text-sm font-semibold text-white">
                F
              </div>
              <div>
                <div className="text-[15px] font-semibold leading-tight text-white">Forné Family Office</div>
                <div className="text-xs text-[#8A8886]">Alquileres · Atención · Portal privado</div>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#8A8886]">
              Gestión de alquileres con atención directa, información clara y un portal privado para
              clientes e inquilinos.
            </p>
            <a
              href="mailto:office@forne.family"
              className="mt-4 inline-flex text-sm text-[#5BA7E0] transition hover:text-[#8CBFE8]"
            >
              office@forne.family
            </a>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A8886]">Navegación</div>
            <div className="mt-4 grid gap-3 text-sm text-[#605E5C]">
              <Link href="/" className="transition hover:text-white">Inicio</Link>
              <Link href="/#quienes-somos" className="transition hover:text-white">Quiénes somos</Link>
              <Link href="/#servicios" className="transition hover:text-white">Servicios</Link>
              <Link href="/contacto" className="transition hover:text-white">Contacto</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A8886]">Portal privado</div>
            <div className="mt-4 grid gap-3 text-sm text-[#605E5C]">
              <Link href="/login" className="transition hover:text-white">Acceso clientes</Link>
              <span>Facturas</span>
              <span>Incidencias</span>
              <span>Comunicación</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A8886]">Contacto</div>
            <div className="mt-4 grid gap-3 text-sm text-[#605E5C]">
              <a href="mailto:office@forne.family" className="transition hover:text-white">
                office@forne.family
              </a>
              <span>Barcelona, España</span>
              <span>Lun-Vie, 9:00-18:00</span>
            </div>
            <Link
              href="/login"
              className="mt-5 inline-flex rounded bg-[#0078D4] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106EBE]"
            >
              Acceso clientes
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#484644] sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Forné Family Office. Todos los derechos reservados.</div>
          <div className="flex gap-5">
            <span>Atención al inquilino</span>
            <Link href="/login" className="transition hover:text-white">
              Portal privado
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
