// Main notification service — provider-agnostic
// Future: Add SMS provider, Push provider here
import { EmailSendOptions, BrandingConfig } from "./types";
import { getProviders } from "./provider-registry";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
  from?: string;
  replyTo?: string;
  businessId?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const providers = getProviders();
  
  // Try each provider in order
  for (const provider of providers) {
    const result = await provider.send({
      to: params.to,
      subject: params.subject,
      html: params.html,
      from: params.from,
      fromName: params.fromName,
      replyTo: params.replyTo,
    });

    if (result.success) {
      return { success: true, messageId: result.messageId };
    }

    // If Resend isn't configured, log and succeed silently
    if (result.error?.includes("not configured")) {
      console.log(`[Notification] Would email ${params.to}: ${params.subject}`);
      return { success: true };
    }

    // If this provider failed and there's another, try the next
    console.warn(`[Notification] Provider ${provider.name} failed:`, result.error);
  }

  return { success: false, error: "All email providers failed" };
}

// Branded email wrapper — uses business branding
export function brandEmail(
  content: string,
  branding: BrandingConfig
): string {
  const color = branding.brandColor || "#2563EB";
  const logo = branding.logoUrl
    ? `<img src="${branding.logoUrl}" alt="${branding.businessName}" style="height:40px;margin-bottom:20px" />`
    : `<div style="font-size:24px;font-weight:bold;color:${color};margin-bottom:20px">${branding.businessName || "CleanFlow"}</div>`;

  const socialLinks = branding.socialLinks ? parseSocialLinks(branding.socialLinks) : "";

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
<p style="margin:0 0 8px 0;font-size:12px;color:#94a3b8">
${branding.businessName || "CleanFlow"}<br/>
${branding.businessAddress ? branding.businessAddress + "<br/>" : ""}
${branding.businessPhone ? branding.businessPhone + "<br/>" : ""}
</p>
${branding.emailSignature ? `<p style="margin:0 0 8px 0;font-size:12px;color:#64748b">${branding.emailSignature}</p>` : ""}
${socialLinks}
</td></tr>
</table>
<p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:12px">Powered by <a href="https://www.cleanflow.cloud" style="color:#94a3b8">CleanFlow</a></p>
</td></tr>
</table>
</body>
</html>`;
}

function parseSocialLinks(links: string): string {
  const lines = links.split("\n").filter(l => l.trim());
  const html = lines.map(line => {
    const [name, url] = line.split(":").map(s => s.trim());
    if (!name || !url) return "";
    return `<a href="${url}" style="color:#94a3b8;text-decoration:none;font-size:12px;margin:0 8px">${name}</a>`;
  }).filter(Boolean).join("");
  return html ? `<p style="margin:8px 0 0 0">${html}</p>` : "";
}