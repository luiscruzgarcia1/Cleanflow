import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();

  const [totalCustomers, upcomingJobs, completedJobs, paidInvoices, pendingInvoices] =
    await Promise.all([
      prisma.customer.count({ where: { userId: user.id } }),
      prisma.job.count({
        where: { userId: user.id, status: "scheduled", scheduledDate: { gte: now } },
      }),
      prisma.job.count({
        where: { userId: user.id, status: "completed" },
      }),
      prisma.invoice.aggregate({
        where: { userId: user.id, status: "paid" },
        _sum: { total: true },
      }),
      prisma.invoice.count({
        where: { userId: user.id, status: { in: ["pending", "sent"] } },
      }),
    ]);

  const jobs = await prisma.job.findMany({
    where: { userId: user.id, status: "scheduled", scheduledDate: { gte: now } },
    include: { customer: true },
    orderBy: { scheduledDate: "asc" },
    take: 5,
  });

  return NextResponse.json({
    stats: {
      totalCustomers,
      upcomingJobs,
      completedJobs,
      totalRevenue: paidInvoices._sum.total || 0,
      pendingInvoices,
    },
    upcomingJobs: jobs,
    recentRevenue: [],
  });
}