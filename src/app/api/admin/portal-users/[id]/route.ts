import { NextResponse, type NextRequest } from "next/server";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { updatePortalUser } from "@/lib/portal/admin-users.service";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getPortalAdminSession();
    const body = await req.json();
    const patch: Record<string, string | boolean> = {};

    for (const field of ["portalEnabled", "blocked"]) {
      if (typeof body[field] === "boolean") patch[field] = body[field];
    }

    if (typeof body.invitationStatus === "string") patch.invitationStatus = body.invitationStatus;
    if (typeof body.lastSyncStatus === "string") patch.lastSyncStatus = body.lastSyncStatus;
    if (typeof body.lastSyncError === "string") patch.lastSyncError = body.lastSyncError;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No hay cambios válidos para aplicar." }, { status: 400 });
    }

    return NextResponse.json(await updatePortalUser(params.id, patch));
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown admin portal error" },
      { status }
    );
  }
}
