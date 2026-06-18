import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    POSTGRES_URL: process.env.POSTGRES_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "✅ Set" : "❌ Not set",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Not set",
    VERCEL: process.env.VERCEL || "not vercel",
    VERCEL_ENV: process.env.VERCEL_ENV || "not set",
    NODE_ENV: process.env.NODE_ENV || "not set",
  };

  return NextResponse.json(envVars);
}