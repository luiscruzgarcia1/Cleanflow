// Email provider registry — add new providers here
import { EmailProvider } from "../types";
import { ResendProvider } from "./providers/email/resend";

const providers: EmailProvider[] = [];

export function registerProvider(provider: EmailProvider) {
  providers.push(provider);
}

export function getProviders(): EmailProvider[] {
  if (providers.length === 0) {
    registerProvider(new ResendProvider());
  }
  return providers;
}

export function getActiveProvider(): EmailProvider | null {
  const all = getProviders();
  // Prefer Resend if configured
  const resend = all.find(p => p.name === "resend");
  if (resend) {
    // Try sending — if Resend is configured, use it
    return resend;
  }
  return all[0] || null;
}