import prisma from "../src/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  const passwordHash = await bcrypt.hash("demo1234", 12);
  
  // Clean existing demo data
  const existingUser = await prisma.user.findUnique({ where: { email: "demo@cleanflow.app" } });
  if (existingUser) {
    await prisma.invoice.deleteMany({ where: { userId: existingUser.id } });
    await prisma.job.deleteMany({ where: { userId: existingUser.id } });
    await prisma.employee.deleteMany({ where: { userId: existingUser.id } });
    await prisma.customer.deleteMany({ where: { userId: existingUser.id } });
    await prisma.businessSetting.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const user = await prisma.user.create({
    data: {
      email: "demo@cleanflow.app",
      name: "Sarah Johnson",
      passwordHash,
      businessName: "Sparkle Clean Co.",
      phone: "(555) 123-4567",
      subscriptionTier: "pro",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      settings: {
        create: {
          businessName: "Sparkle Clean Co.",
          businessAddress: "123 Main Street, Suite 100, Portland, OR 97201",
          businessPhone: "(555) 123-4567",
          businessEmail: "sarah@sparkleclean.com",
          baseRate: 80,
          defaultPerSqftRate: 0.15,
          deepCleanMultiplier: 1.5,
          moveOutMultiplier: 1.3,
          postConstructionMultiplier: 1.8,
          smsReminders: true,
          emailReminders: true,
        },
      },
    },
  });

  const customers = await Promise.all([
    prisma.customer.create({ data: { userId: user.id, name: "Emily Rodriguez", email: "emily@example.com", phone: "(503) 555-0101", address: "456 Oak Avenue", city: "Portland", state: "OR", zipCode: "97202", notes: "Prefers eco-friendly products. Has a dog." } }),
    prisma.customer.create({ data: { userId: user.id, name: "Michael Chen", email: "michael@example.com", phone: "(503) 555-0102", address: "789 Pine Street", city: "Portland", state: "OR", zipCode: "97203", notes: "Weekly recurring client. Key under mat." } }),
    prisma.customer.create({ data: { userId: user.id, name: "Jessica Williams", email: "jessica@example.com", phone: "(503) 555-0103", address: "321 Cedar Lane", city: "Beaverton", state: "OR", zipCode: "97005", notes: "Deep clean every quarter. Has allergies." } }),
    prisma.customer.create({ data: { userId: user.id, name: "David Thompson", email: "david@example.com", phone: "(503) 555-0104", address: "555 Birch Drive", city: "Portland", state: "OR", zipCode: "97204" } }),
    prisma.customer.create({ data: { userId: user.id, name: "Commercial Spaces LLC", email: "info@commercialspaces.com", phone: "(503) 555-0200", address: "1000 Business Park Blvd", city: "Portland", state: "OR", zipCode: "97205", notes: "Commercial contract. Monthly office cleaning." } }),
  ]);

  const employees = await Promise.all([
    prisma.employee.create({ data: { userId: user.id, name: "Carlos Mendez", email: "carlos@sparkleclean.com", phone: "(503) 555-0301", role: "Senior Cleaner", color: "#2563EB" } }),
    prisma.employee.create({ data: { userId: user.id, name: "Aisha Patel", email: "aisha@sparkleclean.com", phone: "(503) 555-0302", role: "Cleaner", color: "#16A34A" } }),
    prisma.employee.create({ data: { userId: user.id, name: "James Wilson", email: "james@sparkleclean.com", phone: "(503) 555-0303", role: "Cleaner", color: "#F59E0B" } }),
  ]);

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);
  const twoWeeksAgo = new Date(today); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  await Promise.all([
    prisma.job.create({ data: { userId: user.id, customerId: customers[0].id, employeeId: employees[0].id, title: "Standard Home Cleaning", description: "Regular weekly cleaning of 3BR/2BA home", jobType: "standard", status: "scheduled", scheduledDate: tomorrow, startTime: "09:00", endTime: "12:00", price: 140, squareFootage: 1800, bedrooms: 3, bathrooms: 2, isRecurring: true, recurringType: "weekly" } }),
    prisma.job.create({ data: { userId: user.id, customerId: customers[1].id, employeeId: employees[1].id, title: "Deep Clean", description: "Deep clean of 2BR/1BA apartment", jobType: "deep", status: "scheduled", scheduledDate: tomorrow, startTime: "13:00", endTime: "17:00", price: 250, squareFootage: 1200, bedrooms: 2, bathrooms: 1, isRecurring: true, recurringType: "biweekly" } }),
    prisma.job.create({ data: { userId: user.id, customerId: customers[4].id, employeeId: employees[2].id, title: "Commercial Office Cleaning", description: "Monthly cleaning of office space", jobType: "standard", status: "scheduled", scheduledDate: dayAfter, startTime: "08:00", endTime: "14:00", price: 400, squareFootage: 3500, bedrooms: 0, bathrooms: 4, isRecurring: true, recurringType: "monthly" } }),
    prisma.job.create({ data: { userId: user.id, customerId: customers[2].id, employeeId: employees[0].id, title: "Move Out Cleaning", description: "Full move-out clean of 4BR/3BA home", jobType: "move_out", status: "scheduled", scheduledDate: nextWeek, startTime: "08:00", endTime: "16:00", price: 380, squareFootage: 2400, bedrooms: 4, bathrooms: 3 } }),
    prisma.job.create({ data: { userId: user.id, customerId: customers[0].id, employeeId: employees[0].id, title: "Standard Home Cleaning", jobType: "standard", status: "completed", scheduledDate: lastWeek, price: 140, squareFootage: 1800, bedrooms: 3, bathrooms: 2 } }),
    prisma.job.create({ data: { userId: user.id, customerId: customers[1].id, employeeId: employees[1].id, title: "Deep Clean", jobType: "deep", status: "completed", scheduledDate: twoWeeksAgo, price: 250, squareFootage: 1200, bedrooms: 2, bathrooms: 1 } }),
  ]);

  await Promise.all([
    prisma.invoice.create({ data: { userId: user.id, customerId: customers[0].id, invoiceNumber: "CF-2026-0001", amount: 140, tax: 0, total: 140, status: "paid", paidAt: new Date(), notes: "Weekly cleaning" } }),
    prisma.invoice.create({ data: { userId: user.id, customerId: customers[1].id, invoiceNumber: "CF-2026-0002", amount: 250, tax: 20.63, total: 270.63, status: "paid", paidAt: new Date(), notes: "Deep clean" } }),
    prisma.invoice.create({ data: { userId: user.id, customerId: customers[2].id, invoiceNumber: "CF-2026-0003", amount: 380, tax: 31.35, total: 411.35, status: "pending", notes: "Move out cleaning" } }),
  ]);

  console.log("✅ Seed data created!");
  console.log("📧 demo@cleanflow.app / demo1234");
  console.log(`👥 ${customers.length} customers, 👷 ${employees.length} employees`);
  console.log("📅 4 upcoming jobs, 2 completed, 💰 3 invoices");
}

seed().catch(console.error).finally(() => prisma.$disconnect());