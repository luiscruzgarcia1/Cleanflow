// Auth types for the application
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  subscriptionTier?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxEmployees: number;
  features: string[];
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    maxEmployees: 2,
    stripePriceId: "price_starter",
    features: [
      "Up to 2 employees",
      "Basic CRM",
      "Scheduling",
      "Email reminders",
      "Invoice management",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    maxEmployees: 10,
    stripePriceId: "price_pro",
    features: [
      "Up to 10 employees",
      "AI Quote Generator",
      "SMS reminders",
      "Recurring schedules",
      "Customer review requests",
      "Advanced dashboard",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    maxEmployees: 20,
    stripePriceId: "price_enterprise",
    features: [
      "Up to 20 employees",
      "AI Quote Generator",
      "AI invoice generation",
      "AI customer messaging",
      "SMS & Email reminders",
      "Recurring schedules",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

export const JOB_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const CLEANING_TYPE_OPTIONS = [
  { value: "standard", label: "Standard Clean" },
  { value: "deep", label: "Deep Clean" },
  { value: "move_out", label: "Move Out/In Clean" },
  { value: "post_construction", label: "Post-Construction Clean" },
];

export const RECURRING_OPTIONS = [
  { value: "once", label: "One Time" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
];