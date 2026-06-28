import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateQuote } from "@/lib/ai";
import { sendEmail } from "@/lib/email";
import { bookingConfirmation, newBookingNotification } from "@/lib/email-templates";

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

    // Send confirmation email to customer
    const cleanTypeLabel = (cleaningType || "standard").replace("_", " ");
    const formattedDate = new Date(scheduledDate).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

    await sendEmail({
      to: email,
      subject: "Booking Confirmed!",
      html: bookingConfirmation({
        customerName: name,
        businessName: user.businessName || undefined,
        serviceType: cleanTypeLabel,
        date: formattedDate,
        time: startTime || "To be confirmed",
        address: `${address || ""}${city ? `, ${city}` : ""}`,
        total: quote.total,
        notes: notes || undefined,
      }),
    });

    // Notify business owner
    await sendEmail({
      to: user.email,
      subject: `New Booking from ${name}`,
      html: newBookingNotification({
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        businessName: user.businessName || undefined,
        serviceType: cleanTypeLabel,
        date: formattedDate,
        time: startTime || "To be confirmed",
        address: `${address || ""}${city ? `, ${city}` : ""}`,
        total: quote.total,
      }),
    });

    // Log the email (simple logging)
    console.log(`Emails sent: confirmation to ${email}, notification to ${user.email}`);

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