import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateQuote } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, address, city,
      cleaningType, squareFootage, bedrooms, bathrooms,
      frequency, addOns, scheduledDate, startTime, notes,
    } = body;

    if (!name || !email || !scheduledDate) {
      return NextResponse.json(
        { error: "Name, email, and date are required" },
        { status: 400 }
      );
    }

    // Find the first active user (cleaning business owner)
    // In production, this would be determined by a unique booking link
    const user = await prisma.user.findFirst({
      where: { subscriptionTier: { not: "free" } },
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No active business found for booking" },
        { status: 404 }
      );
    }

    // Find or create the customer
    let customer = await prisma.customer.findFirst({
      where: { email, userId: user.id },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: user.id,
          name,
          email,
          phone: phone || null,
          address: address || null,
          city: city || null,
          notes: notes || null,
          source: "online_booking",
        },
      });
    }

    // Calculate the price using AI quote generator
    const quote = generateQuote({
      squareFootage: squareFootage || 1500,
      bedrooms: bedrooms || 3,
      bathrooms: bathrooms || 2,
      cleaningType: cleaningType || "standard",
      frequency: frequency || "once",
      addOns: addOns || [],
    });

    // Create the job
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        customerId: customer.id,
        title: `${(cleaningType || "standard").replace("_", " ")} Cleaning`,
        description: notes || null,
        jobType: cleaningType || "standard",
        status: "scheduled",
        scheduledDate: new Date(scheduledDate),
        startTime: startTime || null,
        squareFootage: squareFootage || null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        price: quote.total,
        isRecurring: frequency && frequency !== "once",
        recurringType: frequency !== "once" ? frequency : null,
        notes: notes || null,
      },
    });

    // Send notification to business owner (in-app notification)
    console.log(`New booking from ${name} for ${scheduledDate}`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      customerId: customer.id,
      total: quote.total,
      message: "Booking confirmed!",
    });
  } catch (error: any) {
    console.error("Public booking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}