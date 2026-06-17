import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    tier: user.subscriptionTier || "free",
    trialEndsAt: user.trialEndsAt,
    stripeCustomerId: user.stripeCustomerId,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, tier } = body;
  const email = session.user.email!;

  if (action === "upgrade" && tier) {
    await prisma.user.update({
      where: { email },
      data: { subscriptionTier: tier },
    });
    return NextResponse.json({ success: true, message: `Upgraded to ${tier}` });
  }

  if (action === "cancel") {
    await prisma.user.update({
      where: { email },
      data: { subscriptionTier: "free" },
    });
    return NextResponse.json({ success: true, message: "Subscription cancelled" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}