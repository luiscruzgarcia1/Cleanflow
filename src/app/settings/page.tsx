/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SUBSCRIPTION_PLANS } from "@/lib/types";
import { Save, Upload, Palette, Globe, Clock, MapPin, Link2, ExternalLink, Copy } from "lucide-react";

export default function SettingsPage() {
  const [business, setBusiness] = useState({
    businessName: "", businessAddress: "", businessPhone: "", businessEmail: "",
    businessWebsite: "", logoUrl: "", brandColor: "#2563EB",
    serviceAreas: "", businessHours: "", socialLinks: "",
  });
  const [rates, setRates] = useState({
    baseRate: 80, defaultPerSqftRate: 0.15, bedroomRate: 25, bathroomRate: 20,
    deepCleanMultiplier: 1.5, moveOutMultiplier: 1.3, postConstructionMultiplier: 1.8,
  });
  const [subscription, setSubscription] = useState({ tier: "free", trialEndsAt: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"branding" | "pricing" | "subscription">("branding");

  useEffect(() => { fetchSettings(); }, []);

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
          businessWebsite: data.businessWebsite || "",
          logoUrl: data.logoUrl || "",
          brandColor: data.brandColor || "#2563EB",
          serviceAreas: data.serviceAreas || "",
          businessHours: data.businessHours || "",
          socialLinks: data.socialLinks || "",
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
    } catch (e) { console.error(e); }
  };

  const saveSettings = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...business, ...rates }),
      });
      setMessage(res.ok ? "Settings saved successfully!" : "Failed to save settings.");
    } catch (e) { setMessage("Error saving settings."); }
    finally { setSaving(false); setTimeout(() => setMessage(""), 3000); }
  };

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier) || SUBSCRIPTION_PLANS[0];

  const tabs = [
    { id: "branding" as const, label: "Branding & Profile", icon: Palette },
    { id: "pricing" as const, label: "Pricing", icon: Globe },
    { id: "subscription" as const, label: "Subscription", icon: Link2 },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Customize your business profile and platform preferences.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Branding & Profile Tab */}
      {activeTab === "branding" && (
        <>
          {/* Logo & Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Preview */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {business.logoUrl ? (
                    <img src={business.logoUrl} alt="Company logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Logo URL</label>
                  <Input
                    value={business.logoUrl}
                    onChange={(e) => setBusiness({ ...business, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a URL to your company logo (PNG, JPG, or SVG)</p>
                </div>
              </div>

              {/* Brand Color */}
              <div>
                <label className="text-sm font-medium text-gray-700">Brand Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={business.brandColor}
                    onChange={(e) => setBusiness({ ...business, brandColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-gray-300 p-0.5 cursor-pointer"
                  />
                  <Input
                    value={business.brandColor}
                    onChange={(e) => setBusiness({ ...business, brandColor: e.target.value })}
                    className="w-32"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: business.brandColor }} />
                    <span>Preview</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">This color appears on invoices, customer portal, and email notifications.</p>
              </div>
            </CardContent>
          </Card>

          {/* Business Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input value={business.businessName} onChange={(e) => setBusiness({ ...business, businessName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Email</label>
                  <Input type="email" value={business.businessEmail} onChange={(e) => setBusiness({ ...business, businessEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input value={business.businessPhone} onChange={(e) => setBusiness({ ...business, businessPhone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input value={business.businessWebsite} onChange={(e) => setBusiness({ ...business, businessWebsite: e.target.value })} placeholder="https://yourcompany.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Address</label>
                <Input value={business.businessAddress} onChange={(e) => setBusiness({ ...business, businessAddress: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Areas (comma separated)</label>
                <Input value={business.serviceAreas} onChange={(e) => setBusiness({ ...business, serviceAreas: e.target.value })} placeholder="e.g., Portland, Beaverton, Hillsboro" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Hours</label>
                  <textarea
                    value={business.businessHours}
                    onChange={(e) => setBusiness({ ...business, businessHours: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    placeholder="Mon-Fri: 8am-6pm&#10;Sat: 9am-4pm&#10;Sun: Closed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Media Links</label>
                  <textarea
                    value={business.socialLinks}
                    onChange={(e) => setBusiness({ ...business, socialLinks: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    placeholder="Facebook: https://...&#10;Instagram: https://...&#10;Yelp: https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Pricing Tab */}
      {activeTab === "pricing" && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">These rates are used by the AI Quote Generator.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Rate ($)</label>
                <Input type="number" value={rates.baseRate} onChange={(e) => setRates({ ...rates, baseRate: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Per Sq Ft Rate ($)</label>
                <Input type="number" value={rates.defaultPerSqftRate} onChange={(e) => setRates({ ...rates, defaultPerSqftRate: parseFloat(e.target.value) || 0 })} step="0.01" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Per Bedroom ($)</label>
                <Input type="number" value={rates.bedroomRate} onChange={(e) => setRates({ ...rates, bedroomRate: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Per Bathroom ($)</label>
                <Input type="number" value={rates.bathroomRate} onChange={(e) => setRates({ ...rates, bathroomRate: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Cleaning Type Multipliers</p>
              <div className="grid sm:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900">
                  Current Plan: <Badge>{subscription.tier === "free" ? "Free Trial" : `${currentPlan.name} ($${currentPlan.price}/mo)`}</Badge>
                </p>
                {subscription.trialEndsAt && (
                  <p className="text-sm text-gray-500 mt-1">Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrentPlan = subscription.tier === plan.id;
                const isUpgrade = plan.id === "pro" && subscription.tier === "starter" ||
                                  plan.id === "enterprise" && ["starter", "pro"].includes(subscription.tier);
                return (
                  <div key={plan.id} className={`border rounded-lg p-4 ${isCurrentPlan ? "border-blue-600 ring-2 ring-blue-600" : "border-gray-200"}`}>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">${plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <p className="text-sm text-gray-500 mt-1">Up to {plan.maxEmployees} employees</p>
                    <ul className="mt-3 space-y-1 mb-4">
                      {plan.features.map((f) => (
                        <li key={f} className="text-xs text-gray-600">✓ {f}</li>
                      ))}
                    </ul>
                    {isCurrentPlan ? (
                      <Badge className="w-full justify-center py-1.5">Current Plan</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        variant={isUpgrade ? "primary" : "outline"}
                        onClick={async () => {
                          const res = await fetch("/api/stripe/checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              tier: plan.id,
                              successUrl: window.location.origin + "/settings?success=true",
                              cancelUrl: window.location.origin + "/settings?cancelled=true",
                            }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            if (data.demo) window.location.href = data.url;
                            else if (data.url) window.open(data.url, "_blank");
                          }
                        }}
                      >
                        {isUpgrade ? "Upgrade" : "Switch to"} {plan.name}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Stripe Customer Portal</p>
                <p className="text-xs text-gray-500">Manage billing, invoices, and payment methods</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  const res = await fetch("/api/stripe/portal", { method: "POST" });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.url) window.open(data.url, "_blank");
                  }
                }}
              >
                <ExternalLink className="mr-1 h-3 w-3" /> Open Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button (shown on all tabs except subscription) */}
      {activeTab !== "subscription" && (
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}