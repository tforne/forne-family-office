import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { getDocumentById, getDocumentFile } from "@/lib/portal/documents.service";

function userFacingDocumentDownloadError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (
    message.includes("no tiene identificador") ||
    message.includes("no está permitida") ||
    message.includes("no tiene adjunto")
  ) {
    return {
      error: "Este documento no está disponible para descarga.",
      status: 404
    };
  }

  if (message.includes("no ha devuelto contenido")) {
    return {
      error: "El documento existe, pero Business Central no ha devuelto su contenido.",
      status: 502
    };
  }

  return {
    error: "No se ha podido descargar este documento en este momento.",
    status: 502
  };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Sesión no autenticada." }, { status: 401 });
  }

  const id = decodeURIComponent(params.id);
  const document = await getDocumentById(id);

  if (!document) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }

  try {
    const file = await getDocumentFile(document);
    const url = new URL(req.url);
    const shouldDownload = url.searchParams.get("download") !== "0";

    return new NextResponse(file.bytes, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${file.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const userFacingError = userFacingDocumentDownloadError(error);
    return NextResponse.json(
      { error: userFacingError.error },
      { status: userFacingError.status }
    );
  }
}
