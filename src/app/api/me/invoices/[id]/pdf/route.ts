import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { getInvoiceById, getInvoicePdf } from "@/lib/portal/invoices.service";

function userFacingInvoicePdfError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (
    message.includes("No se encontró la salesInvoice estándar") ||
    message.includes("no informó un pdfDocument") ||
    message.includes("no ha devuelto pdfDocument")
  ) {
    return {
      error: "No hay PDF oficial disponible para esta factura en Business Central.",
      status: 404
    };
  }

  return {
    error: "No se ha podido generar el PDF oficial de esta factura en este momento.",
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
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada." }, { status: 404 });
  }

  try {
    const pdf = await getInvoicePdf(invoice);
    const url = new URL(req.url);
    const shouldDownload = url.searchParams.get("download") === "1";

    return new NextResponse(pdf.bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${pdf.fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const userFacingError = userFacingInvoicePdfError(error);
    return NextResponse.json(
      { error: userFacingError.error },
      { status: userFacingError.status }
    );
  }
}
