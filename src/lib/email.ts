// Email service — uses Resend as default, supports adding other providers later
import { Resend } from "resend";

export type EmailProvider = "resend" | "smtp";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Get Resend API key from env
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

// Send email via Resend
async function sendViaResend(options: EmailOptions): Promise<EmailResult> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Resend API key not configured" };
    }

    const from = options.from || process.env.EMAIL_FROM || "CleanFlow <noreply@cleanflow.cloud>";
    
    const result = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error("Resend error:", error);
    return { success: false, error: error.message };
  }
}

// Main send function — tries Resend, falls back to log
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Try Resend first
  const result = await sendViaResend(options);
  
  // If Resend fails, log it (prevents app from breaking)
  if (!result.success) {
    console.log(`[EMAIL FALLBACK] Would send to ${options.to}: ${options.subject}`);
    console.log(`[EMAIL FALLBACK] Content: ${options.html.substring(0, 100)}...`);
    console.log(`[EMAIL FALLBACK] Reason: ${result.error}`);
  }
  
  return result;
}

// Business branding helper
export function getBrandingHtml(
  businessName?: string,
  brandColor?: string,
  logoUrl?: string
): string {
  const color = brandColor || "#2563EB";
  const name = businessName || "CleanFlow";
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="${name}" style="height:40px;margin-bottom:20px" />`
    : `<div style="font-size:24px;font-weight:bold;color:${color};margin-bottom:20px">${name}</div>`;
  return logo;
}

// Email wrapper template
export function wrapEmail(
  content: string,
  options: {
    businessName?: string;
    brandColor?: string;
    logoUrl?: string;
    businessAddress?: string;
    businessPhone?: string;
    unsubscribe?: string;
  } = {}
): string {
  const color = options.brandColor || "#2563EB";
  const name = options.businessName || "CleanFlow";
  const logo = options.logoUrl
    ? `<img src="${options.logoUrl}" alt="${name}" style="height:40px;margin-bottom:20px" />`
    : `<div style="font-size:24px;font-weight:bold;color:${color};margin-bottom:20px">${name}</div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f4f4f5">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
<tr><td style="padding:40px 40px 20px 40px;text-align:center;border-bottom:2px solid ${color}20">
${logo}
</td></tr>
<tr><td style="padding:30px 40px">${content}</td></tr>
<tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
<p style="margin:0;font-size:12px;color:#94a3b8">
${options.businessName || "CleanFlow"}<br/>
${options.businessAddress || ""}${options.businessAddress ? "<br/>" : ""}
${options.businessPhone ? options.businessPhone + "<br/>" : ""}
</p>
${options.unsubscribe ? `<p style="margin:8px 0 0 0;font-size:12px"><a href="${options.unsubscribe}" style="color:#94a3b8">Unsubscribe</a></p>` : ""}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}