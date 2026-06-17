import type { Metadata } from "next";
import "./globals.css";
import AuthLayout from "@/components/layout/AuthLayout";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

export const metadata: Metadata = {
  title: "CleanFlow - AI-Powered Cleaning Business Management",
  description:
    "Manage your cleaning business with AI-powered quoting, scheduling, invoicing, and customer management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthLayout>{children}</AuthLayout>
        <ChatbotWidget />
      </body>
    </html>
  );
}
