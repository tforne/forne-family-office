import { redirect } from "next/navigation";
import AdminPortalUsersClient from "@/components/portal/AdminPortalUsersClient";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { listPortalUsers } from "@/lib/portal/admin-users.service";

export default async function AdminPortalUsersPage({
  searchParams
}: {
  searchParams?: { search?: string };
}) {
  try {
    await getPortalAdminSession();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    redirect("/portal");
  }

  const users = await listPortalUsers(searchParams?.search);

  return (
    <div className="space-y-8">
      <section id="usuarios-portal" className="space-y-5">
          <div className="ffo-portal-dark rounded-[30px] border border-white/8 p-6 text-white">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Administración</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Usuarios portal</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/72">
              Gestión centralizada en Business Central sobre la tabla OD Tenant Portal User.
            </p>
          </div>

          <AdminPortalUsersClient users={users} />
      </section>
    </div>
  );
}
