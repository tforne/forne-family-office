import { redirect } from "next/navigation";
import AdminChatSettingsClient from "@/components/portal/AdminChatSettingsClient";
import { getChatSettings } from "@/lib/content/chat-settings";
import { env } from "@/lib/config/env";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";

export default async function AdminChatPage() {
  try {
    await getPortalAdminSession();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    redirect("/portal");
  }

  const settings = await getChatSettings();

  return (
    <div className="space-y-8">
      <section id="chat-admin" className="space-y-5">
        <div className="ffo-portal-dark rounded-[30px] border border-white/8 p-6 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Administración</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Panel de chat</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/72">
            Controla cuándo puede mostrarse el chat del portal.
          </p>
        </div>

        <AdminChatSettingsClient
          initialSettings={settings}
          chatAvailable={env.chatAvailable}
        />
      </section>
    </div>
  );
}
