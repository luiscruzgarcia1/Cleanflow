"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CleanFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/book" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                Book a Cleaning
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            AI-Powered Cleaning Business Management
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Run Your Cleaning Business
            <span className="text-blue-600"> on Autopilot</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            CleanFlow helps cleaning companies manage customers, scheduling, quotes, invoicing, and payments — all in one place with AI-powered automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg hover:bg-gray-50 font-semibold text-lg transition-colors"
            >
              See Features
            </a>
          </div>
          <p className="text-gray-500 mt-4">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            From AI-powered quoting to automated reminders — CleanFlow handles the busy work so you can focus on cleaning.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 border ${plan.popular ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600" : "border-gray-200 bg-white"}`}
              >
                {plan.popular && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mt-3">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">CF</span>
            </div>
            <span className="text-white font-bold text-lg">CleanFlow</span>
          </div>
          <p className="text-sm">AI-powered business management for cleaning companies.</p>
          <p className="text-sm mt-2">&copy; 2026 CleanFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🤖",
    title: "AI Quote Generator",
    description:
      "Instantly generate accurate quotes based on square footage, rooms, and cleaning type. No more manual pricing.",
  },
  {
    icon: "📅",
    title: "Smart Scheduling",
    description:
      "Set up one-time or recurring schedules. Automated reminders reduce no-shows by up to 80%.",
  },
  {
    icon: "👥",
    title: "Customer CRM",
    description:
      "Store customer info, cleaning history, notes, and preferences. Everything in one searchable place.",
  },
  {
    icon: "📄",
    title: "Invoicing & Payments",
    description:
      "Generate professional invoices, send them automatically, and track payments. Stripe-powered for fast checkout.",
  },
  {
    icon: "👷",
    title: "Employee Management",
    description:
      "Assign jobs to team members, schedule routes, and track job status in real-time.",
  },
  {
    icon: "📊",
    title: "Dashboard Analytics",
    description:
      "See revenue, upcoming jobs, completed jobs, and customer activity at a glance.",
  },
];

const plans = [
  {
    name: "Starter",
    price: 49,
    description: "For solo cleaners and small teams getting started.",
    features: [
      "Up to 2 employees",
      "Basic CRM",
      "Scheduling",
      "Email reminders",
      "Invoice management",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: 99,
    description: "For growing cleaning businesses with multiple teams.",
    features: [
      "Up to 10 employees",
      "AI Quote Generator",
      "SMS & Email reminders",
      "Recurring schedules",
      "Review requests",
      "Advanced analytics",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    description: "For established companies with advanced needs.",
    features: [
      "Up to 20 employees",
      "All Pro features",
      "AI Invoice Generation",
      "AI Customer Messaging",
      "Priority support",
      "Custom branding",
    ],
    popular: false,
  },
];