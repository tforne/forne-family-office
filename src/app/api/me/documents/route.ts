import { NextResponse } from "next/server";
import { mockDocuments } from "@/lib/mock/documents";
export async function GET() { return NextResponse.json(mockDocuments); }
