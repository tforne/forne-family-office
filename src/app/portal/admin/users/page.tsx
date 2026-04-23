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
          <div className="border-b border-slate-300 pb-4">
            <div>
              <h2 className="text-xl font-semibold">Usuarios portal</h2>
              <p className="mt-1 text-sm text-slate-600">Gestión centralizada en Business Central sobre la tabla OD Tenant Portal User.</p>
            </div>
          </div>

          <AdminPortalUsersClient users={users} />
        </section>
    </div>
  );
}
