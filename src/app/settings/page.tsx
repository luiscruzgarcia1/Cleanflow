"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SUBSCRIPTION_PLANS } from "@/lib/types";

export default function SettingsPage() {
  const [business, setBusiness] = useState({
    businessName: "", businessAddress: "", businessPhone: "", businessEmail: "",
  });
  const [rates, setRates] = useState({
    baseRate: 80, defaultPerSqftRate: 0.15, bedroomRate: 25, bathroomRate: 20,
    deepCleanMultiplier: 1.5, moveOutMultiplier: 1.3, postConstructionMultiplier: 1.8,
  });
  const [subscription, setSubscription] = useState({ tier: "free", trialEndsAt: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setBusiness({
          businessName: data.businessName || "",
          businessAddress: data.businessAddress || "",
          businessPhone: data.businessPhone || "",
          businessEmail: data.businessEmail || "",
        });
        setRates({
          baseRate: data.baseRate || 80,
          defaultPerSqftRate: data.defaultPerSqftRate || 0.15,
          bedroomRate: data.bedroomRate || 25,
          bathroomRate: data.bathroomRate || 20,
          deepCleanMultiplier: data.deepCleanMultiplier || 1.5,
          moveOutMultiplier: data.moveOutMultiplier || 1.3,
          postConstructionMultiplier: data.postConstructionMultiplier || 1.8,
        });
        setSubscription({
          tier: data.subscriptionTier || "free",
          trialEndsAt: data.trialEndsAt || "",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...business, ...rates }),
      });
      if (res.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (e) {
      setMessage("Error saving settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier) || SUBSCRIPTION_PLANS[0];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your business profile and preferences.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input value={business.businessName} onChange={(e) => setBusiness({ ...business, businessName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Email</label>
              <Input type="email" value={business.businessEmail} onChange={(e) => setBusiness({ ...business, businessEmail: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Address</label>
            <Input value={business.businessAddress} onChange={(e) => setBusiness({ ...business, businessAddress: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Phone</label>
            <Input value={business.businessPhone} onChange={(e) => setBusiness({ ...business, businessPhone: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">These rates are used by the AI Quote Generator.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Rate ($)</label>
              <Input type="number" value={rates.baseRate} onChange={(e) => setRates({ ...rates, baseRate: parseFloat(e.target.value) || 0 })} step="1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Per Sq Ft Rate ($)</label>
              <Input type="number" value={rates.defaultPerSqftRate} onChange={(e) => setRates({ ...rates, defaultPerSqftRate: parseFloat(e.target.value) || 0 })} step="0.01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Per Bedroom ($)</label>
              <Input type="number" value={rates.bedroomRate} onChange={(e) => setRates({ ...rates, bedroomRate: parseFloat(e.target.value) || 0 })} step="1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Per Bathroom ($)</label>
              <Input type="number" value={rates.bathroomRate} onChange={(e) => setRates({ ...rates, bathroomRate: parseFloat(e.target.value) || 0 })} step="1" />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium mb-3">Cleaning Type Multipliers</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deep Clean</label>
                <Input type="number" value={rates.deepCleanMultiplier} onChange={(e) => setRates({ ...rates, deepCleanMultiplier: parseFloat(e.target.value) || 1 })} step="0.1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Move Out/In</label>
                <Input type="number" value={rates.moveOutMultiplier} onChange={(e) => setRates({ ...rates, moveOutMultiplier: parseFloat(e.target.value) || 1 })} step="0.1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Post-Construction</label>
                <Input type="number" value={rates.postConstructionMultiplier} onChange={(e) => setRates({ ...rates, postConstructionMultiplier: parseFloat(e.target.value) || 1 })} step="0.1" />
              </div>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900">Current Plan: <Badge>{subscription.tier === "free" ? "Free Trial" : `${currentPlan.name} ($${currentPlan.price}/mo)`}</Badge></p>
              {subscription.trialEndsAt && (
                <p className="text-sm text-gray-500 mt-1">Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div key={plan.id} className={`border rounded-lg p-4 ${subscription.tier === plan.id ? "border-blue-600 ring-2 ring-blue-600" : "border-gray-200"}`}>
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">${plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-500 mt-1">Up to {plan.maxEmployees} employees</p>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-gray-600">✓ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}