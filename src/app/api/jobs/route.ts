import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = { userId: user.id };
  if (status) where.status = status;
  if (startDate && endDate) {
    where.scheduledDate = { gte: new Date(startDate), lte: new Date(endDate) };
  }

  const jobs = await prisma.job.findMany({
    where,
    include: { customer: true, employee: true },
    orderBy: { scheduledDate: "asc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const {
    customerId, employeeId, title, description, jobType,
    scheduledDate, startTime, endTime, duration, squareFootage,
    bedrooms, bathrooms, price, isRecurring, recurringType, recurringDay, notes,
  } = body;

  if (!customerId || !title) {
    return NextResponse.json({ error: "Customer and title are required" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      userId: user.id, customerId, employeeId, title, description,
      jobType: jobType || "standard",
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      startTime, endTime, duration, squareFootage, bedrooms, bathrooms,
      price: price ? parseFloat(price) : null,
      isRecurring: isRecurring || false, recurringType, recurringDay, notes,
    },
  });

  return NextResponse.json(job, { status: 201 });
}