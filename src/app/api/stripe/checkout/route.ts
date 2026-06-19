import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// Stripe price IDs — once connected, replace with real IDs from Stripe
const PRICE_IDS: Record<string, string> = {
  starter: "price_starter",
  pro: "price_pro",
  enterprise: "price_enterprise",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    // Check if Stripe is connected
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      // Demo mode — simulate subscription change
      const tier = Object.entries(PRICE_IDS).find(([, id]) => id === priceId)?.[0] || "pro";
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionTier: tier },
      });
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://cleanflow-neon.vercel.app"}/settings?upgraded=${tier}`,
        demo: true,
      });
    }

    // Real Stripe checkout
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.businessName || user.name,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://cleanflow-neon.vercel.app"}/settings?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://cleanflow-neon.vercel.app"}/settings?cancelled=true`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}