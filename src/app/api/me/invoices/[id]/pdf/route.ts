import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { getInvoiceById, getInvoicePdf } from "@/lib/portal/invoices.service";

export async function GET(
  _req: Request,
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

    return new NextResponse(pdf.bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdf.fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido generar el PDF de esta factura en Business Central." },
      { status: 404 }
    );
  }
}
