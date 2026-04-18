import { NextResponse } from "next/server";
import { mockIncidents } from "@/lib/mock/incidents";
export async function GET() { return NextResponse.json(mockIncidents); }
