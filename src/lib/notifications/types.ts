// Provider interface — any email provider must implement this
export interface EmailProvider {
  name: string;
  send(options: EmailSendOptions): Promise<EmailSendResult>;
}

export interface EmailSendOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
}

export interface EmailSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export interface NotificationChannel {
  type: "email" | "sms" | "push";
  send(recipient: string, template: string, data: Record<string, any>): Promise<{ success: boolean }>;
}

export interface BrandingConfig {
  businessName: string;
  logoUrl?: string;
  brandColor: string;
  senderName?: string;
  replyToEmail?: string;
  supportEmail?: string;
  businessAddress?: string;
  businessPhone?: string;
  emailSignature?: string;
  socialLinks?: string;
}