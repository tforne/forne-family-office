import { NextResponse } from "next/server";
import { mockContracts } from "@/lib/mock/contracts";
export async function GET() { return NextResponse.json(mockContracts); }
