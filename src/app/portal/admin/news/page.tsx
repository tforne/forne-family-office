import { redirect } from "next/navigation";
import AdminNewsClient from "@/components/portal/AdminNewsClient";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { listNewsItems } from "@/lib/content/news";

export default async function AdminNewsPage() {
  try {
    await getPortalAdminSession();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    redirect("/portal");
  }

  const items = await listNewsItems();

  return (
    <div className="space-y-8">
      <section id="news-admin" className="space-y-5">
        <div className="border-b border-slate-300 pb-4">
          <div>
            <h2 className="text-xl font-semibold">Panel de noticias</h2>
            <p className="mt-1 text-sm text-slate-600">
              Gestiona los avisos y novedades que se publican en la home pública.
            </p>
          </div>
        </div>

        <AdminNewsClient initialItems={items} />
      </section>
    </div>
  );
}
