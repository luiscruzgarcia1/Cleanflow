import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceDescription } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const description = generateInvoiceDescription(body);
    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error generating description:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}