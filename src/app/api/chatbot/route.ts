import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = getChatbotResponse(message);

    // Generate suggested questions
    const suggestedQuestions = [
      "How much does a standard cleaning cost?",
      "What's included in a deep clean?",
      "How long does cleaning take?",
      "Can I reschedule my booking?",
      "What payment methods do you accept?",
    ];

    return NextResponse.json({
      response,
      suggestedQuestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}