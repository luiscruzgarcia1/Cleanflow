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
  const where: any = { userId: user.id };
  if (status) where.status = status;

  const invoices = await prisma.invoice.findMany({
    where,
    include: { customer: true, job: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { customerId, jobId, amount, tax, dueDate, lineItems, notes } = body;

  if (!customerId || !amount) {
    return NextResponse.json({ error: "Customer and amount are required" }, { status: 400 });
  }

  const count = await prisma.invoice.count();
  const invoiceNumber = `CF-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const total = amount + (tax || 0);

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id, customerId, jobId, invoiceNumber,
      amount, tax: tax || 0, total,
      dueDate: dueDate ? new Date(dueDate) : null,
      lineItems: lineItems ? JSON.stringify(lineItems) : null,
      notes, status: "pending",
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}