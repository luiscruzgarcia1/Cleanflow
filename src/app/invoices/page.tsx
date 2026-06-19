"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Customer { id: string; name: string; }
interface Job { id: string; title: string; }
interface Invoice {
  id: string; invoiceNumber: string; amount: number; tax: number; total: number;
  status: string; createdAt: string; dueDate: string; paidAt: string;
  customer: Customer; job?: Job;
}

const STATUS_VARIANTS: Record<string, "warning" | "success" | "danger" | "secondary"> = {
  pending: "warning",
  sent: "secondary",
  paid: "success",
  overdue: "danger",
  cancelled: "secondary",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [formData, setFormData] = useState({
    customerId: "", amount: "", tax: "", dueDate: "", notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      const url = filterStatus ? `/api/invoices?status=${filterStatus}` : "/api/invoices";
      const [invRes, custRes] = await Promise.all([
        fetch(url), fetch("/api/customers"),
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          amount: parseFloat(formData.amount),
          tax: formData.tax ? parseFloat(formData.tax) : 0,
          dueDate: formData.dueDate || null,
          notes: formData.notes,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ customerId: "", amount: "", tax: "", dueDate: "", notes: "" });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Manage billing and payment tracking.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-lg">
          {["", "pending", "sent", "paid", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterStatus === s ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="mt-1">Create your first invoice to get paid.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left text-sm font-medium text-gray-500 p-4">Invoice</th>
                    <th className="text-left text-sm font-medium text-gray-500 p-4">Customer</th>
                    <th className="text-left text-sm font-medium text-gray-500 p-4 hidden md:table-cell">Date</th>
                    <th className="text-right text-sm font-medium text-gray-500 p-4">Amount</th>
                    <th className="text-center text-sm font-medium text-gray-500 p-4">Status</th>
                    <th className="text-right text-sm font-medium text-gray-500 p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                      <td className="p-4 text-gray-700">{inv.customer?.name}</td>
                      <td className="p-4 text-gray-500 hidden md:table-cell">{formatDate(inv.createdAt || inv.dueDate)}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(inv.total)}</td>
                      <td className="p-4 text-center">
                        <Badge variant={STATUS_VARIANTS[inv.status] || "secondary"}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status !== "paid" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => markAsPaid(inv.id)}>
                                Mark Paid
                              </Button>
                              <Button 
                                size="sm"
                                onClick={async () => {
                                  const res = await fetch("/api/invoices/pay", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ invoiceId: inv.id }),
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    if (data.url) window.open(data.url, "_blank");
                                    if (data.paid) fetchData();
                                  }
                                }}
                              >
                                <ExternalLink className="mr-1 h-3 w-3" /> Pay Now
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Invoice">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount *</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax</label>
              <Input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}