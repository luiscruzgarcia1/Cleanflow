export interface QuoteInput {
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  cleaningType: "standard" | "deep" | "move_out" | "post_construction";
  frequency?: "once" | "weekly" | "biweekly" | "monthly";
  addOns?: string[];
}

export interface QuoteResult {
  basePrice: number;
  squareFootagePrice: number;
  bedroomPrice: number;
  bathroomPrice: number;
  cleaningTypeMultiplier: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

const CLEANING_TYPE_MULTIPLIERS = {
  standard: 1.0,
  deep: 1.5,
  move_out: 1.3,
  post_construction: 1.8,
};

const FREQUENCY_DISCOUNTS = {
  once: 0,
  weekly: 0.15,
  biweekly: 0.1,
  monthly: 0.05,
};

const ADDON_PRICES: Record<string, number> = {
  fridge: 25,
  oven: 30,
  windows: 40,
  carpet: 50,
  garage: 35,
  balcony: 20,
};

export function generateQuote(input: QuoteInput, rates?: {
  perSqftRate?: number;
  baseRate?: number;
  bedroomRate?: number;
  bathroomRate?: number;
}): QuoteResult {
  const perSqftRate = rates?.perSqftRate ?? 0.15;
  const baseRate = rates?.baseRate ?? 80;
  const bedroomRate = rates?.bedroomRate ?? 25;
  const bathroomRate = rates?.bathroomRate ?? 20;

  const sqftPrice = Math.round(input.squareFootage * perSqftRate * 100) / 100;
  const bedroomPrice = input.bedrooms * bedroomRate;
  const bathroomPrice = input.bathrooms * bathroomRate;
  const basePrice = baseRate;

  const typeMultiplier = CLEANING_TYPE_MULTIPLIERS[input.cleaningType];
  const frequencyDiscount = FREQUENCY_DISCOUNTS[input.frequency ?? "once"];

  const subtotalBeforeMultiplier = basePrice + sqftPrice + bedroomPrice + bathroomPrice;
  const subtotal = subtotalBeforeMultiplier * typeMultiplier;

  // Add-ons
  let addonTotal = 0;
  if (input.addOns) {
    addonTotal = input.addOns.reduce((sum, addon) => sum + (ADDON_PRICES[addon] ?? 0), 0);
  }

  const subtotalWithAddons = subtotal + addonTotal;
  const discount = subtotalWithAddons * frequencyDiscount;
  const total = Math.round((subtotalWithAddons - discount) * 100) / 100;

  const breakdown: { label: string; amount: number }[] = [
    { label: "Base Rate", amount: basePrice },
    { label: `Square Footage (${input.squareFootage} sq ft × $${perSqftRate}/sq ft)`, amount: sqftPrice },
    { label: `Bedrooms (${input.bedrooms} × $${bedroomRate})`, amount: bedroomPrice },
    { label: `Bathrooms (${input.bathrooms} × $${bathroomRate})`, amount: bathroomPrice },
    { label: `Cleaning Type Multiplier (${input.cleaningType} × ${typeMultiplier})`, amount: subtotal - subtotalBeforeMultiplier },
  ];

  if (addonTotal > 0) {
    breakdown.push({ label: "Add-on Services", amount: addonTotal });
  }

  if (discount > 0) {
    breakdown.push({
      label: `Frequency Discount (${input.frequency} - ${Math.round(frequencyDiscount * 100)}%)`,
      amount: -discount,
    });
  }

  breakdown.push({ label: "Total", amount: total });

  return {
    basePrice,
    squareFootagePrice: sqftPrice,
    bedroomPrice,
    bathroomPrice,
    cleaningTypeMultiplier: typeMultiplier,
    subtotal: subtotalWithAddons,
    discount,
    total,
    breakdown,
  };
}

export function generateInvoiceDescription(job: {
  title: string;
  cleaningType?: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  scheduledDate?: Date | string;
}): string {
  const date = job.scheduledDate
    ? new Date(job.scheduledDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  let desc = `${job.title}`;
  if (date) desc += ` on ${date}`;
  if (job.cleaningType) desc += ` (${job.cleaningType.replace("_", " ")} clean)`;
  if (job.squareFootage || job.bedrooms || job.bathrooms) {
    const details: string[] = [];
    if (job.squareFootage) details.push(`${job.squareFootage} sq ft`);
    if (job.bedrooms) details.push(`${job.bedrooms} bed`);
    if (job.bathrooms) details.push(`${job.bathrooms} bath`);
    desc += ` — ${details.join(", ")}`;
  }
  return desc;
}

export const FAQ_RESPONSES: Record<string, string> = {
  "pricing": "Our pricing depends on the size of your home, number of rooms, and type of cleaning. Use our AI Quote Generator on the Quoting page to get an instant price!",
  "cancel": "You can cancel or reschedule a booking up to 24 hours before the scheduled time with no charge. Just go to your Schedule page or contact us.",
  "whats included": "A standard cleaning includes dusting, vacuuming, mopping, bathroom cleaning, kitchen cleaning, and trash removal. Deep cleaning adds baseboards, inside cabinets, and detailed scrubbing.",
  "products": "Our team uses eco-friendly, professional-grade cleaning products. If you have specific products you'd like us to use, just let us know in the booking notes.",
  "duration": "A standard cleaning for a 2-bedroom, 2-bathroom home typically takes 2-3 hours. Deep cleaning can take 4-6 hours. The exact time depends on the size and condition of your home.",
  "payment": "We accept all major credit cards, debit cards, and bank transfers. Payment is due upon completion of service. We send digital invoices via email.",
  "insurance": "Yes, all our cleaning professionals are fully insured and bonded for your peace of mind.",
  "satisfaction": "We stand behind our work! If you're not satisfied with any part of the cleaning, contact us within 24 hours and we'll make it right at no extra cost.",
  "frequency": "You can schedule one-time, weekly, biweekly, or monthly cleanings. Recurring customers enjoy discounted rates!",
};

export function getChatbotResponse(message: string): string {
  const lower = message.toLowerCase();

  // Check for exact FAQ matches
  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key)) {
      return response;
    }
  }

  // Fallback responses
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! Welcome to CleanFlow. How can I help you today? You can ask about pricing, scheduling, services, or anything about your cleaning needs!";
  }

  if (lower.includes("thank")) {
    return "You're welcome! If you have any other questions, feel free to ask. We're here to help!";
  }

  if (lower.includes("quote") || lower.includes("estimate") || lower.includes("cost") || lower.includes("price")) {
    return "You can get an instant AI-generated quote by providing your square footage, number of bedrooms and bathrooms, and the type of cleaning you need. Head to the Quote Generator page to get started!";
  }

  if (lower.includes("book") || lower.includes("schedule") || lower.includes("appointment")) {
    return "To schedule a cleaning, you can book directly through our online booking system. Pick your preferred date and time, and we'll take care of the rest!";
  }

  if (lower.includes("reschedule") || lower.includes("change") || lower.includes("modify")) {
    return "You can modify or reschedule your booking up to 24 hours before the scheduled time. Just go to your Schedule page to make changes.";
  }

  return "I'm not sure I understood that. Could you please rephrase? You can ask me about pricing, scheduling, services, payments, or anything else about CleanFlow!";
}

export function getSuggestedQuestions(message: string): string[] {
  const lower = message.toLowerCase();
  
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return ["How much does it cost?", "What services do you offer?", "How do I book?"];
  }
  
  if (lower.includes("price") || lower.includes("quote") || lower.includes("cost")) {
    return ["What's included in a standard clean?", "Do you offer discounts for recurring cleans?", "How long does a cleaning take?"];
  }
  
  if (lower.includes("book") || lower.includes("schedule")) {
    return ["What is your cancellation policy?", "What payment methods do you accept?", "Are you insured?"];
  }
  
  return ["Tell me about your services", "Get a quote", "How do I contact support?"];
}

export function generateFollowupTemplate(type: 'review_request' | 'thank_you' | 'reminder', customerName: string, jobDate: string, businessName: string): string {
  const dateStr = new Date(jobDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  switch (type) {
    case 'review_request':
      return `Hi ${customerName}, thank you for choosing ${businessName}! We hope you enjoyed your cleaning on ${dateStr}. Would you mind taking a minute to leave us a review? It helps us out a lot!`;
    case 'thank_you':
      return `Hi ${customerName}, this is ${businessName}. Just wanted to say thank you for your business! We enjoyed cleaning your home on ${dateStr}. See you next time!`;
    case 'reminder':
      return `Hi ${customerName}, this is a friendly reminder from ${businessName} about your upcoming cleaning scheduled for ${dateStr}. We're looking forward to seeing you!`;
    default:
      return `Hi ${customerName}, thank you for choosing ${businessName}!`;
  }
}
