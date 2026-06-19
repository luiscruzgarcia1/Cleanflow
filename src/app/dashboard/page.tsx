"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Users, 
  CalendarDays, 
  CheckCircle, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  Briefcase,
  Plus
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface DashboardStats {
  totalCustomers: number;
  upcomingJobs: number;
  completedJobs: number;
  totalRevenue: number;
  pendingInvoices: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    upcomingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
  });
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

  // Mock revenue data for the chart
  const revenueData = [
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 2100 },
    { name: "Mar", total: 1800 },
    { name: "Apr", total: 2400 },
    { name: "May", total: 3200 },
    { name: "Jun", total: 2800 },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
      // Load business branding
      fetch("/api/settings")
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.businessName) setBusinessName(data.businessName); })
        .catch(() => {});
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setUpcomingJobs(data.upcomingJobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back to <span className="font-semibold text-gray-900">{businessName || session?.user?.name || "User"}</span>. Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/schedule">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          description="+12.5% from last month"
          icon={DollarSign}
          trend="+12.5%"
          color="blue"
          href="/invoices"
        />
        <StatCard
          label="Active Customers"
          value={stats.totalCustomers}
          description="+4 new this week"
          icon={Users}
          trend="+4"
          color="green"
          href="/customers"
        />
        <StatCard
          label="Upcoming Jobs"
          value={stats.upcomingJobs}
          description="Next 7 days"
          icon={CalendarDays}
          color="amber"
          href="/schedule"
        />
        <StatCard
          label="Pending Invoices"
          value={stats.pendingInvoices}
          description="$1,240.00 outstanding"
          icon={Receipt}
          trend="-2.4%"
          color="red"
          href="/invoices"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
        {/* Revenue Overview Chart */}
        <Card className="lg:col-span-4 shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue growth over the last 6 months.</CardDescription>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-4 w-4" />
              <span>+18%</span>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                />
                <Bar 
                  dataKey="total" 
                  fill="#2563eb" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Jobs Summary */}
        <Card className="lg:col-span-3 shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Jobs</CardTitle>
              <CardDescription>Scheduled for the next few days.</CardDescription>
            </div>
            <Link href="/schedule">
              <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                  <CalendarDays className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No upcoming jobs scheduled</p>
                <Link href="/schedule" className="mt-4">
                  <Button variant="outline" size="sm">Create Booking</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {job.customer?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatDate(job.scheduledDate)}</p>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <ActionLink icon={Users} label="Customers" href="/customers" />
            <ActionLink icon={Briefcase} label="Employees" href="/employees" />
            <ActionLink icon={Receipt} label="Invoices" href="/invoices" />
            <ActionLink icon={Plus} label="New Quote" href="/quotes" />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest updates from your business operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ActivityItem 
                icon={CheckCircle} 
                title="Job Completed" 
                description="Standard Cleaning for Bob Smith was marked as completed." 
                time="2 hours ago" 
                color="green" 
              />
              <ActivityItem 
                icon={DollarSign} 
                title="Payment Received" 
                description="Invoice #CF-2026-0001 was paid in full by Alice Johnson." 
                time="5 hours ago" 
                color="blue" 
              />
              <ActivityItem 
                icon={CalendarDays} 
                title="New Booking" 
                description="Charlie Brown booked a Deep Cleaning for June 20th." 
                time="Yesterday" 
                color="amber" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  color,
  href,
}: {
  label: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: string;
  color: "blue" | "green" | "amber" | "red";
  href?: string;
}) {
  const bgColors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  const card = (
    <Card className="overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${bgColors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center ${
                trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : null}
                {trend}
              </span>
            )}
            <p className="text-xs text-gray-500 font-medium">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}

function ActionLink({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all text-gray-600">
        <Icon className="h-6 w-6 mb-2" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
    </Link>
  );
}

function ActivityItem({ icon: Icon, title, description, time, color }: { 
  icon: any, title: string, description: string, time: string, color: string 
}) {
  const iconColors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="flex gap-4">
      <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${iconColors[color as keyof typeof iconColors]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <span className="text-xs text-gray-400 font-medium">{time}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
