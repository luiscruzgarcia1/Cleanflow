import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, customerName, jobDate, businessName } = body;

    if (!type || !customerName) {
      return NextResponse.json({ error: "Type and customerName are required" }, { status: 400 });
    }

    const dateStr = jobDate
      ? new Date(jobDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "";

    let subject = "";
    let message = "";

    switch (type) {
      case "review_request":
        subject = "How was your cleaning experience?";
        message = `Hi ${customerName},\n\nThank you for choosing ${businessName || "our service"}! We hope you're happy with your cleaning${dateStr ? ` on ${dateStr}` : ""}.\n\nWe'd love to hear your feedback. Please take a moment to leave us a review:\n[Review Link]\n\nYour feedback helps us improve!\n\nBest regards,\n${businessName || "The Team"}`;
        break;
      case "thank_you":
        subject = "Thank you for your business!";
        message = `Hi ${customerName},\n\nThank you for your continued trust in ${businessName || "our service"}. We appreciate your business${dateStr ? ` on ${dateStr}` : ""}!\n\nIf you need anything, don't hesitate to reach out.\n\nBest regards,\n${businessName || "The Team"}`;
        break;
      case "reminder":
        subject = `Reminder: Your cleaning is scheduled${dateStr ? ` for ${dateStr}` : ""}`;
        message = `Hi ${customerName},\n\nThis is a friendly reminder that your cleaning is scheduled${dateStr ? ` for ${dateStr}` : ""} with ${businessName || "our team"}.\n\nIf you need to reschedule, please let us know at least 24 hours in advance.\n\nThank you!\n${businessName || "The Team"}`;
        break;
      default:
        return NextResponse.json({ error: "Invalid follow-up type" }, { status: 400 });
    }

    return NextResponse.json({ subject, message, type, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Follow-ups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}