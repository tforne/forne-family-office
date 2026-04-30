import { redirect } from "next/navigation";
import AdminFeaturedAssetsClient from "@/components/portal/AdminFeaturedAssetsClient";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { listFeaturedAssets } from "@/lib/content/featured-assets";

export default async function AdminFeaturedAssetsPage() {
  try {
    await getPortalAdminSession();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    redirect("/portal");
  }

  const items = await listFeaturedAssets();

  return (
    <div className="space-y-8">
      <section id="featured-assets-admin" className="space-y-5">
        <div className="border-b border-slate-300 pb-4">
          <div>
            <h2 className="text-xl font-semibold">Activos destacados</h2>
            <p className="mt-1 text-sm text-slate-600">
              Gestiona los anuncios comerciales que aparecen en la home pública.
            </p>
          </div>
        </div>

        <AdminFeaturedAssetsClient initialItems={items} />
      </section>
    </div>
  );
}
