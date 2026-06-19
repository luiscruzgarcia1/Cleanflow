import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

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
    businessName: user.businessName,
    businessPhone: user.phone,
    businessEmail: user.email,
    subscriptionTier: user.subscriptionTier,
    trialEndsAt: user.trialEndsAt,
    ...(s ? {
      businessAddress: s.businessAddress,
      businessWebsite: s.businessWebsite,
      logoUrl: s.logoUrl,
      brandColor: s.brandColor,
      serviceAreas: s.serviceAreas,
      businessHours: s.businessHours,
      socialLinks: s.socialLinks,
      invoiceBranding: s.invoiceBranding,
      baseRate: s.baseRate,
      defaultPerSqftRate: s.defaultPerSqftRate,
      deepCleanMultiplier: s.deepCleanMultiplier,
      moveOutMultiplier: s.moveOutMultiplier,
      postConstructionMultiplier: s.postConstructionMultiplier,
      smsReminders: s.smsReminders,
      emailReminders: s.emailReminders,
    } : {}),
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { settings: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();

  if (body.businessName || body.businessPhone !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        businessName: body.businessName !== undefined ? body.businessName : user.businessName,
        phone: body.businessPhone !== undefined ? body.businessPhone : user.phone,
      },
    });
  }

  const settingsData: any = {};
  const settingFields = [
    "businessAddress", "businessWebsite", "logoUrl", "brandColor",
    "serviceAreas", "businessHours", "socialLinks", "invoiceBranding",
    "baseRate", "defaultPerSqftRate", "bedroomRate", "bathroomRate",
    "deepCleanMultiplier", "moveOutMultiplier", "postConstructionMultiplier",
    "smsReminders", "emailReminders",
  ];
  for (const field of settingFields) {
    if (body[field] !== undefined) settingsData[field] = body[field];
  }

  if (Object.keys(settingsData).length > 0) {
    if (user.settings) {
      await prisma.businessSetting.update({ where: { userId: user.id }, data: settingsData });
    } else {
      await prisma.businessSetting.create({ data: { userId: user.id, ...settingsData } });
    }
  }

  return NextResponse.json({ success: true });
}