import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      include: { customer: true, employee: true },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Verify customer belongs to user
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId: user.id },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        customerId,
        employeeId: employeeId || null,
        title,
        description: description || null,
        jobType: jobType || "standard",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        startTime: startTime || null,
        endTime: endTime || null,
        duration: duration ? Number(duration) : null,
        squareFootage: squareFootage ? Number(squareFootage) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        price: price ? Number(price) : null,
        isRecurring: isRecurring === true,
        recurringType: recurringType || null,
        recurringDay: recurringDay || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}