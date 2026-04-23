"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PortalUserDto } from "@/lib/dto/portal-user.dto";

function formatDate(value: string) {
  if (!value || value.startsWith("0001-01-01")) return "-";

  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusClass(user: PortalUserDto) {
  if (user.blocked) return "bg-rose-50 text-rose-800 ring-rose-200";
  if (!user.portalEnabled) return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
}

function statusLabel(user: PortalUserDto) {
  if (user.blocked) return "Bloqueado";
  if (!user.portalEnabled) return "Desactivado";
  return "Activo";
}

async function sendJson(url: string, method: "POST" | "PATCH", body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "No se pudo completar la operación.");
  }

  return payload;
}

export default function AdminPortalUsersClient({ users }: { users: PortalUserDto[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending("create");
    setMessage("");
    setError("");

    const form = new FormData(formElement);

    try {
      await sendJson("/api/admin/portal-users", "POST", {
        email: form.get("email"),
        customerNo: form.get("customerNo"),
        externalUserId: form.get("externalUserId"),
        languageCode: form.get("languageCode"),
        bcCompanyName: form.get("bcCompanyName")
      });
      formElement.reset();
      setMessage("Usuario invitado y acceso creado en Business Central.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario.");
    } finally {
      setPending("");
    }
  };

  const updateUser = async (user: PortalUserDto, patch: Partial<PortalUserDto>, label: string) => {
    setPending(`${label}-${user.id}`);
    setMessage("");
    setError("");

    try {
      await sendJson(`/api/admin/portal-users/${encodeURIComponent(user.id)}`, "PATCH", patch);
      setMessage("Cambios guardados en Business Central.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setPending("");
    }
  };

  return (
    <div className="space-y-6">
      {(message || error) ? (
        <div
          className={`border px-4 py-3 text-sm ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || message}
        </div>
      ) : null}

      <section className="border border-slate-300 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">Crear acceso portal</h2>
        <form onSubmit={createUser} className="mt-5 grid gap-4 lg:grid-cols-5">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-slate-400 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Nº cliente</span>
            <input
              name="customerNo"
              required
              className="w-full border border-slate-400 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">External User Id</span>
            <input
              name="externalUserId"
              placeholder="Opcional: si se deja vacío, se invita por Azure"
              className="w-full border border-slate-400 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Idioma</span>
            <input
              name="languageCode"
              placeholder="ESP"
              className="w-full border border-slate-400 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Empresa BC</span>
            <input
              name="bcCompanyName"
              className="w-full border border-slate-400 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />
          </label>
          <div className="lg:col-span-5">
            <button
              type="submit"
              disabled={pending === "create"}
              className="bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending === "create" ? "Creando..." : "Crear e invitar"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden border border-slate-300 bg-white">
        <div className="border-b border-slate-300 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Usuarios portal</h2>
          <p className="mt-1 text-sm text-slate-600">{users.length} usuario{users.length === 1 ? "" : "s"} encontrado{users.length === 1 ? "" : "s"}</p>
        </div>

        {users.length === 0 ? (
          <div className="px-5 py-10 text-sm text-slate-600">No hay usuarios de portal publicados en Business Central.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-300 text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Cliente</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Invitación</th>
                  <th className="px-5 py-3 font-semibold">Último acceso</th>
                  <th className="px-5 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id || `${user.email}-${user.customerNo}`} className="align-top">
                    <td className="min-w-72 px-5 py-4">
                      <div className="font-medium text-slate-950">{user.email || "-"}</div>
                      <div className="mt-1 max-w-80 break-all text-xs text-slate-600">{user.externalUserId || "Sin External User Id"}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      <div>{user.customerNo || "-"}</div>
                      <div className="mt-1 text-xs">{user.bcCompanyName || "-"}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(user)}`}>
                        {statusLabel(user)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {user.invitationStatus || "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(user.lastLoginDateTime)}
                    </td>
                    <td className="min-w-72 px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={Boolean(pending)}
                          onClick={() => updateUser(user, { portalEnabled: !user.portalEnabled }, "enabled")}
                          className="border border-slate-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {user.portalEnabled ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(pending)}
                          onClick={() => updateUser(user, { blocked: !user.blocked }, "blocked")}
                          className="border border-slate-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {user.blocked ? "Desbloquear" : "Bloquear"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(pending)}
                          onClick={() => updateUser(user, { invitationStatus: "Pending" }, "invite")}
                          className="border border-slate-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          Marcar invitación
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
