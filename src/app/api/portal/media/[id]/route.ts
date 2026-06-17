import { NextResponse } from "next/server";
import { getPortalMediaFile } from "@/lib/portal/media-assets.service";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const mediaId = decodeURIComponent(params.id);
    const file = await getPortalMediaFile(mediaId);

    if (!file) {
      return NextResponse.json({ error: "Archivo multimedia no disponible." }, { status: 404 });
    }

    const bytes = Buffer.from(file.contentBase64, "base64");
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown media file error";
    console.error("[api/portal/media/[id]]", message, error);
    return NextResponse.json({ error: "No se pudo cargar el archivo multimedia." }, { status: 500 });
  }
}
