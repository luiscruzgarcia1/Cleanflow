import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateQuote } from "@/lib/ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { settings: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const s = user.settings;
  return NextResponse.json({
    baseRate: s?.baseRate || 80,
    perSqftRate: s?.defaultPerSqftRate || 0.15,
    bedroomRate: 25,
    bathroomRate: 20,
    multipliers: {
      standard: 1.0,
      deep: s?.deepCleanMultiplier || 1.5,
      move_out: s?.moveOutMultiplier || 1.3,
      post_construction: s?.postConstructionMultiplier || 1.8,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { settings: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { squareFootage, bedrooms, bathrooms, cleaningType, frequency, addOns } = body;

  if (!squareFootage || bedrooms === undefined || bathrooms === undefined || !cleaningType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const s = user.settings;
  const quote = generateQuote(
    { squareFootage, bedrooms, bathrooms, cleaningType, frequency, addOns },
    { perSqftRate: s?.defaultPerSqftRate ?? undefined, baseRate: s?.baseRate ?? undefined }
  );

  return NextResponse.json(quote);
}