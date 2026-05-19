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
        <div className="ffo-portal-dark rounded-[30px] border border-white/8 p-6 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Administración</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Panel de noticias</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/72">
            Gestiona los avisos y novedades que se publican en la home pública.
          </p>
        </div>

        <AdminNewsClient initialItems={items} />
      </section>
    </div>
  );
}
