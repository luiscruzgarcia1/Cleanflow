"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

interface QuoteResult {
  total: number;
  subtotal: number;
  discount: number;
  breakdown: { label: string; amount: number }[];
}

export default function QuotesPage() {
  const [formData, setFormData] = useState({
    squareFootage: 1500,
    bedrooms: 3,
    bathrooms: 2,
    cleaningType: "standard",
    frequency: "once",
    addOns: [] as string[],
  });
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const addOnOptions = [
    { value: "fridge", label: "Fridge Cleaning ($25)" },
    { value: "oven", label: "Oven Cleaning ($30)" },
    { value: "windows", label: "Window Cleaning ($40)" },
    { value: "carpet", label: "Carpet Shampoo ($50)" },
    { value: "garage", label: "Garage Cleaning ($35)" },
    { value: "balcony", label: "Balcony Cleaning ($20)" },
  ];

  const toggleAddOn = (value: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(value)
        ? prev.addOns.filter(a => a !== value)
        : [...prev.addOns, value],
    }));
  };

  const generateQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendToCustomer = () => {
    alert("Quote saved! You can share it with your customer from the Schedule page.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Quote Generator</h1>
        <p className="text-gray-500">Get instant pricing for any cleaning job.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
              <Input
                type="number"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: parseInt(e.target.value) || 0 })}
                min={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <Input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <Input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Type</label>
              <select
                value={formData.cleaningType}
                onChange={(e) => setFormData({ ...formData, cleaningType: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="standard">Standard Clean</option>
                <option value="deep">Deep Clean</option>
                <option value="move_out">Move Out/In Clean</option>
                <option value="post_construction">Post-Construction Clean</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="once">One Time</option>
                <option value="weekly">Weekly (15% off)</option>
                <option value="biweekly">Bi-Weekly (10% off)</option>
                <option value="monthly">Monthly (5% off)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add-On Services</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {addOnOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.addOns.includes(opt.value)}
                      onChange={() => toggleAddOn(opt.value)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={generateQuote} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Quote"}
            </Button>
          </CardContent>
        </Card>

        {/* Quote Result */}
        <Card>
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {!quote ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Fill in the job details and click "Generate Quote"</p>
                <p className="text-sm mt-2">The AI will calculate the optimal price based on your settings.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-blue-600 font-medium">Estimated Total</p>
                  <p className="text-4xl font-bold text-blue-700 mt-1">{formatCurrency(quote.total)}</p>
                  {quote.discount > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      You save {formatCurrency(quote.discount)} with recurring discount!
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {quote.breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                      <span className={i === quote.breakdown.length - 1 ? "font-semibold text-gray-900" : "text-gray-600"}>
                        {item.label}
                      </span>
                      <span className={item.amount < 0 ? "text-green-600 font-medium" : i === quote.breakdown.length - 1 ? "font-bold text-gray-900" : "text-gray-900"}>
                        {item.amount < 0 ? `-${formatCurrency(Math.abs(item.amount))}` : formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={generateQuote} className="flex-1">
                    Recalculate
                  </Button>
                  <Button onClick={sendToCustomer} className="flex-1">
                    Create Job from Quote
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}