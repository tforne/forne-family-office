import { NextResponse, type NextRequest } from "next/server";
import { invitePortalUser } from "@/lib/identity/graph";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { createPortalUser, listPortalUsers } from "@/lib/portal/admin-users.service";

function internalTenantDomains() {
  const domains = new Set<string>();
  const rawValues = [
    process.env.GRAPH_INTERNAL_DOMAINS || "",
    process.env.ENTRA_INTERNAL_DOMAINS || "",
    process.env.ENTRA_TENANT_PRIMARY_DOMAIN || ""
  ];

  for (const rawValue of rawValues) {
    rawValue
      .split(/[,\n;|]/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
      .forEach((value) => domains.add(value));
  }

  return domains;
}

function isInternalTenantEmail(email: string) {
  const domain = email.split("@")[1]?.trim().toLowerCase() || "";
  if (!domain) return false;
  return internalTenantDomains().has(domain);
}

function userFacingPortalUserError(error: unknown) {
  const message = error instanceof Error ? error.message : "No se pudo crear el usuario de portal.";

  if (message.includes("Internal_EntityWithSameKeyExists") && message.includes("Customer No.")) {
    const match = message.match(/Customer No\.='([^']+)'/);
    const customerNo = match?.[1] || "este cliente";
    return `Ya existe un usuario de portal para el cliente ${customerNo}. Revisa el registro existente o actualízalo en lugar de crear uno nuevo.`;
  }

  if (message.includes("Internal_EntityWithSameKeyExists") && message.includes("Email")) {
    const match = message.match(/Email='([^']+)'/);
    const email = match?.[1] || "este email";
    return `Ya existe un usuario de portal con el email ${email}. Revisa el registro existente antes de crear uno nuevo.`;
  }

  if (message.includes("BadRequest_MethodNotAllowed") || message.includes("Entity does not support insert")) {
    return "Business Central no permite crear usuarios en tenantPortalUsers. Revisa que la API Page permita inserción y que la aplicación tenga permisos de alta.";
  }

  return message;
}

export async function GET(req: NextRequest) {
  try {
    await getPortalAdminSession();
    const search = req.nextUrl.searchParams.get("search") || "";
    return NextResponse.json({ value: await listPortalUsers(search) });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown admin portal error" },
      { status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await getPortalAdminSession();
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const customerNo = typeof body.customerNo === "string" ? body.customerNo.trim() : "";
    let externalUserId = typeof body.externalUserId === "string" ? body.externalUserId.trim() : "";
    const createMode = typeof body.createMode === "string" ? body.createMode.trim() : "invite";

    if (!email || !customerNo) {
      return NextResponse.json({ error: "Email y cliente son obligatorios." }, { status: 400 });
    }

    const internalEmail = isInternalTenantEmail(email);

    if (internalEmail && !externalUserId) {
      return NextResponse.json(
        {
          error:
            "El email pertenece a un dominio interno del tenant. Para crear acceso interno debes indicar el External User Id (Object ID / User ID de Entra)."
        },
        { status: 400 }
      );
    }

    const skipInvitation = createMode === "internal" || Boolean(externalUserId);
    let invitationStatus: "None" | "Pending" | "Sent" = skipInvitation ? "None" : "Pending";
    let invitationSentAt = "";
    let lastInvitationError = "";

    if (!skipInvitation) {
      try {
        const invited = await invitePortalUser({
          email,
          displayName: typeof body.displayName === "string" ? body.displayName.trim() : email
        });
        externalUserId = invited.externalUserId;
        invitationStatus = "Sent";
        invitationSentAt = new Date().toISOString();
      } catch (error) {
        lastInvitationError = error instanceof Error ? error.message : "No se pudo invitar el usuario en Microsoft Graph.";
        return NextResponse.json({ error: lastInvitationError }, { status: 502 });
      }
    }

    try {
      return NextResponse.json(
        await createPortalUser({
          email,
          customerNo,
          externalUserId,
          languageCode: typeof body.languageCode === "string" ? body.languageCode.trim() : "",
          bcCompanyName: typeof body.bcCompanyName === "string" ? body.bcCompanyName.trim() : "",
          invitationStatus,
          invitationSentAt,
          lastInvitationError
        }),
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json({ error: userFacingPortalUserError(error) }, { status: 400 });
    }
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown admin portal error" },
      { status }
    );
  }
}
