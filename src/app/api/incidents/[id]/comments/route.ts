import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { prepareIncidentComment } from "@/lib/portal/incident-comment-draft.service";
import { createIncidentComment } from "@/lib/portal/incident-comments.service";
import { getIncidentById } from "@/lib/portal/incidents.service";
import { buildPostOperationIntelligence } from "@/lib/portal/post-operation-intelligence.service";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const incidentId = decodeURIComponent(params.id || "").trim();
    if (!incidentId) {
      return NextResponse.json({ error: "No se ha indicado la incidencia." }, { status: 400 });
    }

    const payload = (await request.json().catch(() => ({}))) as {
      comment?: unknown;
    };
    const preparedComment = prepareIncidentComment(typeof payload.comment === "string" ? payload.comment : "");

    if (!preparedComment.isValid) {
      return NextResponse.json({ error: "Escribe un comentario antes de enviarlo." }, { status: 400 });
    }

    const incident = await getIncidentById(incidentId);
    if (!incident) {
      return NextResponse.json({ error: "No se ha encontrado la incidencia indicada." }, { status: 404 });
    }

    const comment = await createIncidentComment({
      incidentId: incident.id,
      incidentNo: incident.incidentId || incident.id,
      comment: preparedComment.comment
    });
    const postOperation = buildPostOperationIntelligence({
      kind: "incident_commented",
      incident,
      commentText: preparedComment.comment
    });

    return NextResponse.json({
      ok: true,
      comment,
      postOperation,
      warning: preparedComment.wasTrimmed
        ? "El comentario superaba el máximo permitido y se ha recortado a 1000 caracteres."
        : undefined
    });
  } catch (error) {
    console.error("[api/incidents/[id]/comments] Comment creation failed.", error);
    return NextResponse.json(
      {
        error:
          "No se ha podido guardar el comentario en esta incidencia. Inténtalo de nuevo o revisa la incidencia desde su ficha."
      },
      { status: 500 }
    );
  }
}
