"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, ChevronRight, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { generateQuote } from "@/lib/ai";

type Step = "service" | "details" | "schedule" | "confirm";

export default function BookingPage() {
  const [step, setStep] = useState<Step>("service");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    cleaningType: "standard",
    squareFootage: 1500,
    bedrooms: 3,
    bathrooms: 2,
    frequency: "once",
    addOns: [] as string[],
    scheduledDate: "",
    startTime: "",
    notes: "",
  });
  const [quote, setQuote] = useState<any>(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAddOn = (value: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(value)
        ? prev.addOns.filter(a => a !== value)
        : [...prev.addOns, value],
    }));
  };

  const calculateQuote = () => {
    const result = generateQuote({
      squareFootage: formData.squareFootage,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      cleaningType: formData.cleaningType as any,
      frequency: formData.frequency as any,
      addOns: formData.addOns,
    });
    setQuote(result);
    return result;
  };

  const handleNext = () => {
    if (step === "service") {
      calculateQuote();
      setStep("details");
    } else if (step === "details") {
      setStep("schedule");
    } else if (step === "schedule") {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "details") setStep("service");
    else if (step === "schedule") setStep("details");
    else if (step === "confirm") setStep("schedule");
  };

  const handleSubmit = async () => {
    // In production this would send to the business owner
    setBookingComplete(true);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">We&apos;ll clean your home on <strong>{formData.scheduledDate}</strong> at <strong>{formData.startTime}</strong>.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-sm text-gray-600"><span className="font-medium">Service:</span> {formData.cleaningType.replace("_", " ")} Clean</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Address:</span> {formData.address}</p>
            {quote && <p className="text-lg font-bold text-blue-600">Total: {formatCurrency(quote.total)}</p>}
          </div>
          <p className="text-sm text-gray-500">A confirmation email has been sent to {formData.email}.</p>
          <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline font-medium">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CleanFlow</span>
          </Link>
          <span className="text-sm text-gray-500">Book a Cleaning</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["service", "details", "schedule", "confirm"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? "bg-blue-600 text-white" :
                ["service", "details", "schedule", "confirm"].indexOf(step) > i ? "bg-green-500 text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {["service", "details", "schedule", "confirm"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 3 && <div className={`w-12 sm:w-20 h-1 ${
                ["service", "details", "schedule", "confirm"].indexOf(step) > i ? "bg-green-500" : "bg-gray-200"
              }`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Step 1: Service Selection */}
          {step === "service" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What type of cleaning?</h2>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { value: "standard", label: "Standard Clean", desc: "Regular home maintenance", price: "Best value" },
                  { value: "deep", label: "Deep Clean", desc: "Intensive top-to-bottom", price: "Premium" },
                  { value: "move_out", label: "Move Out/In", desc: "Full property turnover", price: "Enhanced" },
                  { value: "post_construction", label: "Post-Construction", desc: "After renovation dust", price: "Heavy duty" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateField("cleaningType", opt.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      formData.cleaningType === opt.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{opt.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How often?</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "once", label: "One Time" },
                    { value: "weekly", label: "Weekly (15% off)" },
                    { value: "biweekly", label: "Bi-Weekly (10% off)" },
                    { value: "monthly", label: "Monthly (5% off)" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateField("frequency", opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.frequency === opt.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add-On Services</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { value: "fridge", label: "Fridge Clean ($25)" },
                    { value: "oven", label: "Oven Clean ($30)" },
                    { value: "windows", label: "Window Clean ($40)" },
                    { value: "carpet", label: "Carpet Shampoo ($50)" },
                    { value: "garage", label: "Garage Clean ($35)" },
                    { value: "balcony", label: "Balcony Clean ($20)" },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.addOns.includes(opt.value) ? "border-blue-600 bg-blue-50" : "border-gray-200"
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.addOns.includes(opt.value)}
                        onChange={() => toggleAddOn(opt.value)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Quote Preview */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Estimated price</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(generateQuote({
                    squareFootage: formData.squareFootage,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    cleaningType: formData.cleaningType as any,
                    frequency: formData.frequency as any,
                    addOns: formData.addOns,
                  }).total)}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Home Details */}
          {step === "details" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your home</h2>
              
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                  <input
                    type="number"
                    value={formData.squareFootage}
                    onChange={(e) => updateField("squareFootage", parseInt(e.target.value) || 0)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => updateField("bedrooms", parseInt(e.target.value) || 0)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => updateField("bathrooms", parseInt(e.target.value) || 0)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Updated Quote */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-blue-600 font-medium">Updated Estimate</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(generateQuote({
                      squareFootage: formData.squareFootage,
                      bedrooms: formData.bedrooms,
                      bathrooms: formData.bathrooms,
                      cleaningType: formData.cleaningType as any,
                      frequency: formData.frequency as any,
                      addOns: formData.addOns,
                    }).total)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === "schedule" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">When & Where</h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => updateField("scheduledDate", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => updateField("startTime", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="jane@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Portland"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === "confirm" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Booking</h2>

              <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formData.scheduledDate}</p>
                    <p className="text-sm text-gray-500">at {formData.startTime}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Service Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• {formData.cleaningType.replace("_", " ")} Cleaning</p>
                    <p>• {formData.squareFootage} sq ft, {formData.bedrooms} bed, {formData.bathrooms} bath</p>
                    <p>• {formData.frequency === "once" ? "One time" : `${formData.frequency}`}</p>
                    {formData.addOns.length > 0 && <p>• Add-ons: {formData.addOns.join(", ")}</p>}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-1">Customer Info</h3>
                  <p className="text-sm text-gray-600">{formData.name}</p>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                  {formData.phone && <p className="text-sm text-gray-600">{formData.phone}</p>}
                  <p className="text-sm text-gray-600">{formData.address}</p>
                </div>

                {quote && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(quote.total)}</p>
                    </div>
                    {quote.discount > 0 && (
                      <p className="text-sm text-green-600 mt-1">You save {formatCurrency(quote.discount)} with recurring discount!</p>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="font-medium text-yellow-800">📋 Payment Policy</p>
                <p className="mt-1">You can pay after the service is completed via invoice. We accept all major credit cards.</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                step === "service" ? "invisible" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Back
            </button>

            {step === "confirm" ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Confirm Booking
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}