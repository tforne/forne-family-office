import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-forne-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forne-ink text-sm font-semibold text-white shadow-sm">
                F
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-forne-ink">Forné Family Office</div>
                <div className="text-xs text-forne-muted">Patrimonio, alquileres y reporting</div>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-forne-muted">
              Gestión patrimonial y alquileres con foco en trazabilidad, atención directa y una experiencia digital clara para clientes.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">Navegación</div>
            <div className="mt-4 grid gap-3 text-sm text-forne-muted">
              <Link href="/" className="hover:text-forne-ink">Inicio</Link>
              <Link href="/#quienes-somos" className="hover:text-forne-ink">Quiénes somos</Link>
              <Link href="/alquileres" className="hover:text-forne-ink">Alquileres</Link>
              <Link href="/contacto" className="hover:text-forne-ink">Contacto</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">Portal</div>
            <div className="mt-4 grid gap-3 text-sm text-forne-muted">
              <Link href="/login" className="hover:text-forne-ink">Acceso clientes</Link>
              <span>Facturas</span>
              <span>Incidencias</span>
              <span>Comunicación</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">Contacto</div>
            <div className="mt-4 grid gap-3 text-sm text-forne-muted">
              <a href="mailto:office@forne.family" className="hover:text-forne-ink">office@forne.family</a>
              <Link href="/contacto" className="hover:text-forne-ink">Enviar consulta</Link>
              <Link href="/login" className="mt-2 inline-flex w-fit rounded-xl bg-forne-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
                Acceso clientes
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-forne-line pt-6 text-xs text-forne-muted sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Forné Family Office. Todos los derechos reservados.</div>
          <div className="flex gap-5">
            <span>Gestión patrimonial</span>
            <span>Portal privado</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
