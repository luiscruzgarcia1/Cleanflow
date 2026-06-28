// Email templates for CleanFlow
import { wrapEmail } from "./email";
import { formatCurrency } from "./utils";

export interface TemplateData {
  customerName: string;
  businessName?: string;
  brandColor?: string;
  logoUrl?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export interface BookingConfirmationData extends TemplateData {
  serviceType: string;
  date: string;
  time: string;
  address: string;
  total: number;
  notes?: string;
}

export function bookingConfirmation(data: BookingConfirmationData): string {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 20px 0">Booking Confirmed! 🎉</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 24px 0">
      Hi <strong>${data.customerName}</strong>, your cleaning has been scheduled!
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px">
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Service:</strong></td><td style="color:#1e293b">${data.serviceType}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Date:</strong></td><td style="color:#1e293b">${data.date}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Time:</strong></td><td style="color:#1e293b">${data.time}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Address:</strong></td><td style="color:#1e293b">${data.address}</td></tr>
      <tr><td><strong style="color:#475569">Total:</strong></td><td style="color:#1e293b;font-weight:bold">${formatCurrency(data.total)}</td></tr>
    </table>
    ${data.notes ? `<p style="color:#64748b;font-size:14px;margin:0 0 20px 0"><strong>Notes:</strong> ${data.notes}</p>` : ""}
    <p style="color:#475569;line-height:1.6;margin:0">We'll send you a reminder 24 hours before your appointment.</p>
  `;
  return wrapEmail(content, data);
}

export function appointmentReminder(data: BookingConfirmationData): string {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 20px 0">Reminder: Cleaning Tomorrow!</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 24px 0">
      Hi <strong>${data.customerName}</strong>, this is a friendly reminder about your cleaning tomorrow.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px">
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Service:</strong></td><td style="color:#1e293b">${data.serviceType}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Date:</strong></td><td style="color:#1e293b">${data.date}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Time:</strong></td><td style="color:#1e293b">${data.time}</td></tr>
      <tr><td><strong style="color:#475569">Address:</strong></td><td style="color:#1e293b">${data.address}</td></tr>
    </table>
    <p style="color:#475569;line-height:1.6;margin:0">Need to reschedule? Please contact us at least 24 hours in advance.</p>
  `;
  return wrapEmail(content, data);
}

export interface InvoiceEmailData extends TemplateData {
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  payUrl: string;
  description?: string;
}

export function invoiceEmail(data: InvoiceEmailData): string {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 20px 0">Invoice Ready 💰</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 24px 0">
      Hi <strong>${data.customerName}</strong>, your invoice is ready.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px">
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Invoice:</strong></td><td style="color:#1e293b">${data.invoiceNumber}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Amount Due:</strong></td><td style="color:#1e293b;font-weight:bold;font-size:18px">${formatCurrency(data.amount)}</td></tr>
      <tr><td><strong style="color:#475569">Due Date:</strong></td><td style="color:#1e293b">${data.dueDate}</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${data.payUrl}" style="display:inline-block;background:${data.brandColor || "#2563EB"};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Pay Now</a>
      </td></tr>
    </table>
    ${data.description ? `<p style="color:#64748b;font-size:14px;margin:20px 0 0 0">${data.description}</p>` : ""}
  `;
  return wrapEmail(content, data);
}

export interface PaymentReceiptData extends TemplateData {
  invoiceNumber: string;
  amount: number;
  paidAt: string;
  paymentMethod?: string;
}

export function paymentReceipt(data: PaymentReceiptData): string {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 20px 0">Payment Received ✅</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 24px 0">
      Thank you <strong>${data.customerName}</strong>! Your payment has been received.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px">
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Invoice:</strong></td><td style="color:#1e293b">${data.invoiceNumber}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Amount:</strong></td><td style="color:#1e293b;font-weight:bold">${formatCurrency(data.amount)}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Paid On:</strong></td><td style="color:#1e293b">${data.paidAt}</td></tr>
      ${data.paymentMethod ? `<tr><td><strong style="color:#475569">Payment Method:</strong></td><td style="color:#1e293b">${data.paymentMethod}</td></tr>` : ""}
    </table>
  `;
  return wrapEmail(content, data);
}

export function newBookingNotification(data: BookingConfirmationData & { customerEmail: string; customerPhone?: string }): string {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 20px 0">New Booking Received!</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 24px 0">
      A new booking was made by <strong>${data.customerName}</strong>.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px">
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Customer:</strong></td><td style="color:#1e293b">${data.customerName}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Email:</strong></td><td style="color:#1e293b">${data.customerEmail}</td></tr>
      ${data.customerPhone ? `<tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Phone:</strong></td><td style="color:#1e293b">${data.customerPhone}</td></tr>` : ""}
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Service:</strong></td><td style="color:#1e293b">${data.serviceType}</td></tr>
      <tr><td style="border-bottom:1px solid #e2e8f0"><strong style="color:#475569">Date:</strong></td><td style="color:#1e293b">${data.date}</td></tr>
      <tr><td><strong style="color:#475569">Address:</strong></td><td style="color:#1e293b">${data.address}</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.cleanflow.cloud"}/schedule" style="display:inline-block;background:${data.brandColor || "#2563EB"};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">View in Schedule</a>
      </td></tr>
    </table>
  `;
  return wrapEmail(content, data);
}

export function invoicePaidNotification(data: InvoiceEmailData & { customerEmail: string }): string {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 20px 0">Payment Received 💵</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 24px 0">
      <strong>${data.customerName}</strong> has paid invoice ${data.invoiceNumber}.
    </p>
    <div style="font-size:32px;font-weight:bold;color:#16a34a;text-align:center;padding:20px;background:#f0fdf4;border-radius:8px;margin-bottom:24px">
      ${formatCurrency(data.amount)}
    </div>
  `;
  return wrapEmail(content, data);
}

export function dailySummary(data: TemplateData & { jobs: { customer: string; time: string; service: string }[] }): string {
  const jobsList = data.jobs.map(j => `
    <tr><td style="border-bottom:1px solid #e2e8f0;padding:10px 0"><strong>${j.customer}</strong></td><td style="padding:10px 0;color:#64748b">${j.time}</td><td style="padding:10px 0;color:#64748b">${j.service}</td></tr>
  `).join("");

  const content = `
    <h2 style="color:#1e293b;margin:0 0 20px 0">Today's Schedule 📋</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px 0">Good morning! Here's your schedule for today.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px">
      <tr><td style="padding:12px;border-bottom:2px solid #e2e8f0;font-weight:bold;color:#475569">Customer</td><td style="padding:12px;border-bottom:2px solid #e2e8f0;font-weight:bold;color:#475569">Time</td><td style="padding:12px;border-bottom:2px solid #e2e8f0;font-weight:bold;color:#475569">Service</td></tr>
      ${jobsList || '<tr><td colspan="3" style="padding:20px;text-align:center;color:#94a3b8">No jobs scheduled today</td></tr>'}
    </table>
  `;
  return wrapEmail(content, data);
}