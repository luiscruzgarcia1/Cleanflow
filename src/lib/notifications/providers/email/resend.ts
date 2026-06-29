import { Resend } from "resend";
import { EmailProvider, EmailSendOptions, EmailSendResult } from "../types";

export class ResendProvider implements EmailProvider {
  name = "resend";
  private client: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.client = new Resend(apiKey);
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async send(options: EmailSendOptions): Promise<EmailSendResult> {
    if (!this.client) {
      return { success: false, provider: this.name, error: "Resend API key not configured" };
    }

    try {
      const from = options.fromName
        ? `${options.fromName} <${options.from || "noreply@cleanflow.cloud"}>`
        : options.from || "CleanFlow <noreply@cleanflow.cloud>";

      const result = await this.client.emails.send({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });

      return {
        success: true,
        provider: this.name,
        messageId: result.data?.id,
      };
    } catch (error: any) {
      console.error(`[ResendProvider] Error:`, error);
      return { success: false, provider: this.name, error: error.message };
    }
  }
}