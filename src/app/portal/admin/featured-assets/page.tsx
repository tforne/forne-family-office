import { redirect } from "next/navigation";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { getPublicFeaturedAssetsDiagnostics } from "@/lib/public/featured-assets.service";

export default async function AdminFeaturedAssetsPage() {
  try {
    await getPortalAdminSession();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    redirect("/portal");
  }

  const diagnostics = await getPublicFeaturedAssetsDiagnostics();

  return (
    <div className="space-y-8">
      <section id="featured-assets-admin" className="space-y-5">
        <div className="ffo-portal-dark rounded-[30px] border border-white/8 p-6 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Administración</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Activos en portada</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/72">
            La home pública ya no se edita manualmente desde el portal.
          </p>
        </div>

        <div className="ffo-portal-card rounded-[28px] p-6">
          <p className="text-sm leading-7 text-forne-muted">
            Los activos visibles en portada se obtienen automáticamente desde Business Central.
            Se muestran los inmuebles cuyo estado sea <strong>En alquiler</strong>, hasta un máximo de tres.
          </p>
          <p className="mt-4 text-sm leading-7 text-forne-muted">
            Si quieres cambiar qué aparece en la home, actualiza el estado del inmueble en Business Central.
          </p>
        </div>

        <div className="ffo-portal-card rounded-[28px] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Diagnóstico BC
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              Total activos recibidos: <strong>{diagnostics.totalAssets}</strong>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              Coinciden por estado: <strong>{diagnostics.matchedByStatus}</strong>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              Coinciden por precio: <strong>{diagnostics.matchedByPrice}</strong>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              Renderizables: <strong>{diagnostics.renderableAssets}</strong>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              Seleccionados para portada: <strong>{diagnostics.selectedCount}</strong>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              Estrategia usada: <strong>{diagnostics.usedFallback}</strong>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
            Estados detectados: <strong>{diagnostics.sampleStatuses.join(" | ") || "Ninguno"}</strong>
          </div>

          {diagnostics.errorMessage ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Error al consultar Business Central: <strong>{diagnostics.errorMessage}</strong>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
