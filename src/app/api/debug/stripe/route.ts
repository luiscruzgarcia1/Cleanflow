import { NextResponse } from "next/server";

export async function GET() {
  const stripeSecretSet = process.env.STRIPE_SECRET_KEY ? 
    (process.env.STRIPE_SECRET_KEY.startsWith("sk_live") ? "✅ Live key set" : "⚠️ Key found but doesn't start with sk_live") 
    : "❌ Not set";
  
  const stripePubSet = process.env.STRIPE_PUBLISHABLE_KEY ?
    (process.env.STRIPE_PUBLISHABLE_KEY.startsWith("pk_live") ? "✅ Live key set" : "⚠️ Key found")
    : "❌ Not set";

  return NextResponse.json({
    stripe: {
      secret: stripeSecretSet,
      publishable: stripePubSet,
    },
    priceIds: {
      starter: process.env.STRIPE_STARTER_PRICE_ID ? 
        `✅ Set (${process.env.STRIPE_STARTER_PRICE_ID.substring(0, 10)}...)` : "❌ Not set",
      pro: process.env.STRIPE_PRO_PRICE_ID ?
        `✅ Set (${process.env.STRIPE_PRO_PRICE_ID.substring(0, 10)}...)` : "❌ Not set",
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID ?
        `✅ Set (${process.env.STRIPE_ENTERPRISE_PRICE_ID.substring(0, 10)}...)` : "❌ Not set",
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
    vercel: process.env.VERCEL || "not vercel",
  });
}