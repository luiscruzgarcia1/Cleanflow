import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { invoiceId } = await req.json();
    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // Demo mode — simulate payment
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "paid", paidAt: new Date() },
      });
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://cleanflow-neon.vercel.app"}/invoices`,
        demo: true,
        paid: true,
      });
    }

    // Real Stripe payment
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const payment = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: `Cleaning service invoice for ${invoice.customer?.name}`,
          },
          unit_amount: Math.round(invoice.total * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://cleanflow-neon.vercel.app"}/invoices?paid=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://cleanflow-neon.vercel.app"}/invoices?cancelled=${invoiceId}`,
      metadata: { invoiceId, userId: user.id },
    });

    return NextResponse.json({ url: payment.url });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}