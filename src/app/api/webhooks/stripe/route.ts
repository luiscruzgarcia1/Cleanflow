import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31-basil" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && tier) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: tier,
              stripeCustomerId: session.customer as string,
              subscriptionId: session.subscription as string,
            },
          });
          console.log(`Updated user ${userId} to tier ${tier}`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (stripeCustomerId) {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId },
          });
          if (user) {
            // Subscription payment successful - keep active
            console.log(`Payment received for user ${user.id}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as Stripe.Invoice;
        const failedCustomerId = failedInvoice.customer as string;

        if (failedCustomerId) {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: failedCustomerId },
          });
          if (user) {
            // Could mark subscription as past_due
            console.log(`Payment failed for user ${user.id}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subCustomerId = subscription.customer as string;

        if (subscription.status === "canceled" || subscription.status === "past_due") {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: subCustomerId },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionTier: "free" },
            });
            console.log(`Subscription cancelled/past_due for user ${user.id}, reverted to free`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as Stripe.Subscription;
        const deletedCustomerId = deletedSub.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: deletedCustomerId },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: "free",
              subscriptionId: null,
            },
          });
          console.log(`Subscription deleted for user ${user.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}