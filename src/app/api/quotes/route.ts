import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateQuote } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { squareFootage, bedrooms, bathrooms, cleaningType, frequency, addOns } = body;

    let rates = undefined;
    if (session?.user) {
      const settings = await prisma.businessSetting.findUnique({
        where: { userId: (session.user as any).id },
      });

      if (settings) {
        rates = {
          perSqftRate: settings.defaultPerSqftRate || undefined,
          baseRate: settings.baseRate || undefined,
        };
      }
    }

    const quote = generateQuote({
      squareFootage,
      bedrooms,
      bathrooms,
      cleaningType,
      frequency,
      addOns
    }, rates);

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Quote generation error:", error);
    return NextResponse.json({ error: "Failed to generate quote" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json([]);
}
