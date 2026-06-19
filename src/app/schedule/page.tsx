"use client";

import { useState, useEffect } from "react";
import { Plus, CalendarDays, Clock, User, MapPin, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Customer { id: string; name: string; }
interface Employee { id: string; name: string; color?: string; }
interface Job {
  id: string; title: string; status: string; scheduledDate: string;
  startTime?: string; endTime?: string; price?: number;
  customer?: Customer; employee?: Employee;
  jobType?: string; isRecurring?: boolean; recurringType?: string;
}

const STATUS_STYLES: Record<string, "warning" | "success" | "default" | "danger"> = {
  scheduled: "warning",
  in_progress: "default",
  completed: "success",
  cancelled: "danger",
};

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "", title: "", scheduledDate: "", startTime: "",
    employeeId: "", jobType: "standard", price: "",
    isRecurring: false, recurringType: "weekly",
  });
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, customersRes, employeesRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/customers"),
        fetch("/api/employees"),
      ]);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (customersRes.ok) setCustomers(await customersRes.json());
      if (employeesRes.ok) setEmployees(await employeesRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: formData.price ? parseFloat(formData.price) : null }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setSubmitError("");
        setFormData({ customerId: "", title: "", scheduledDate: "", startTime: "", employeeId: "", jobType: "standard", price: "", isRecurring: false, recurringType: "weekly" });
        fetchData();
      } else {
        const err = await res.json();
        setSubmitError(err.error || "Failed to create booking");
      }
    } catch (e) {
      console.error(e);
      setSubmitError("Network error — please try again");
    }
  };

  const todayJobs = jobs.filter(j => j.status === "scheduled").slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500">Manage appointments and recurring bookings.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/book`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Booking Link"}
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Booking
            </Button>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : todayJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming jobs. Schedule your first booking!</p>
            ) : (
              <div className="space-y-3">
                {todayJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <CalendarDays size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                          {job.customer && (
                            <span className="flex items-center gap-1">
                              <User size={12} /> {job.customer.name}
                            </span>
                          )}
                          {job.scheduledDate && <span>{formatDate(job.scheduledDate)}</span>}
                          {job.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {job.startTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.price && <span className="font-medium text-gray-900">{formatCurrency(job.price)}</span>}
                      <Badge variant={STATUS_STYLES[job.status] || "default"}>{job.status.replace("_", " ")}</Badge>
                      {job.status === "scheduled" && (
                        <button
                          onClick={async () => {
                            if (confirm("Cancel this booking?")) {
                              await fetch(`/api/jobs/${job.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "cancelled" }),
                              });
                              fetchData();
                            }
                          }}
                          className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Mini View */}
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const dayJobs = jobs.filter((j) => {
                  if (!j.scheduledDate) return false;
                  const d = new Date(j.scheduledDate);
                  return d.toLocaleDateString("en-US", { weekday: "short" }) === day;
                });
                return (
                  <div key={day} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-600 w-10">{day}</span>
                    <span className="text-xs text-gray-500">{dayJobs.length > 0 ? `${dayJobs.length} job${dayJobs.length > 1 ? 's' : ''}` : "—"}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Booking Dialog */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Booking">
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="bg-red-50 text-red-700 px-4 py-2.5 rounded-lg text-sm border border-red-200">
              {submitError}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer *</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Standard Home Cleaning"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Unassigned</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="standard">Standard</option>
                <option value="deep">Deep Clean</option>
                <option value="move_out">Move Out/In</option>
                <option value="post_construction">Post-Construction</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="recurring" className="text-sm font-medium">Recurring</label>
            {formData.isRecurring && (
              <select
                value={formData.recurringType}
                onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
                className="ml-2 h-8 rounded-lg border border-gray-300 px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Booking</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}