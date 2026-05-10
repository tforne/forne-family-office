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
        <div className="border-b border-slate-300 pb-4">
          <div>
            <h2 className="text-xl font-semibold">Panel de chat</h2>
            <p className="mt-1 text-sm text-slate-600">
              Controla cuándo puede mostrarse el chat del portal.
            </p>
          </div>
        </div>

        <AdminChatSettingsClient
          initialSettings={settings}
          chatAvailable={env.chatAvailable}
        />
      </section>
    </div>
  );
}
