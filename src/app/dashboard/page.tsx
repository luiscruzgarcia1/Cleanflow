"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    upcomingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
  });
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);
  const [recentRevenue, setRecentRevenue] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setUpcomingJobs(data.upcomingJobs || []);
        setRecentRevenue(data.recentRevenue || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {session?.user?.name || "User"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Customers"
          value={stats.totalCustomers}
          color="blue"
        />
        <StatCard
          label="Upcoming Jobs"
          value={stats.upcomingJobs}
          color="amber"
        />
        <StatCard
          label="Completed"
          value={stats.completedJobs}
          color="green"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="blue"
        />
        <StatCard
          label="Pending Invoices"
          value={stats.pendingInvoices}
          color="red"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Jobs</h2>
          {upcomingJobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming jobs scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500">
                      {job.customer?.name} — {formatDate(job.scheduledDate)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {job.price ? formatCurrency(job.price) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          {recentRevenue.length === 0 ? (
            <p className="text-gray-500 text-sm">No revenue data yet.</p>
          ) : (
            <div className="space-y-3">
              {/* Simple bar chart */}
              <div className="flex items-end gap-2 h-32">
                {recentRevenue.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-600 rounded-t"
                    style={{
                      height: `${Math.max(5, (val / Math.max(...recentRevenue)) * 100)}%`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center">
                Last {recentRevenue.length} months
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color].split(" ")[1]}`}>
        {value}
      </p>
    </div>
  );
}