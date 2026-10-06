import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting FinSoCap Database Seeding...");

  // 1. Seed Admin & Executive Team
  const defaultPassword = await bcrypt.hash("Password@123", 10);

  const users = [
    { name: "Ankit Kumar", email: "ankit.kumar@finsocap.com", role: "Executive", dept: "Operations", skill: "Food & Beverage, Compliance", skills: "FSSAI Registration (Basic), FSSAI State License, Compliance", phone: "8505828033", password: defaultPassword, status: "Active" as const, access: "Admin" },
    { name: "Pooja Mehta", email: "pooja.mehta@finsocap.com", role: "CA", dept: "Taxation", skill: "Taxation", skills: "GST Registration, GST Return Filing", phone: "8796951056", password: defaultPassword, status: "Active" as const, access: "Manager" },
    { name: "Rohit Jain", email: "rohit.jain@finsocap.com", role: "CS", dept: "Compliance", skill: "Intellectual Property, Compliance", skills: "Trademark Registration, Compliance", phone: "9355749363", password: defaultPassword, status: "Active" as const, access: "Employee" },
    { name: "Neha Verma", email: "neha.verma@finsocap.com", role: "Legal Executive", dept: "Legal", skill: "Business Compliance, Licensing", skills: "Shop Act / Trade License, Compliance", phone: "9811637390", password: defaultPassword, status: "Active" as const, access: "Employee" },
    { name: "Gaurav Sharma", email: "gaurav.sharma@finsocap.com", role: "Executive", dept: "Operations", skill: "Import Export, Taxation, Digital Services", skills: "Import Export (IEC Registration), Digital Signature Certificate (DSC)", phone: "9873207632", password: defaultPassword, status: "Active" as const, access: "Employee" },
    { name: "Rahul Jha", email: "rahul.jha@finsocap.com", role: "Manager", dept: "Franchise Partner", skill: "Compliance, Food & Beverage", skills: "FSSAI Registration (Basic), Compliance", phone: "9873207632", password: defaultPassword, status: "Active" as const, access: "Manager" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }
  console.log("✅ Seeded Admin & Staff Team");

  // 2. Seed Services Catalog
  const services = [
    { name: "FSSAI Registration (Basic)", category: "Food & Beverage", recurring: true, frequency: "Yearly", price: 4700, gov: 100, time: "1 - 3 Days", status: "Active" as const },
    { name: "FSSAI State License", category: "Food & Beverage", recurring: true, frequency: "Yearly", price: 7500, gov: 2000, time: "7 - 15 Days", status: "Active" as const },
    { name: "FSSAI Central License", category: "Food & Beverage", recurring: true, frequency: "Yearly", price: 12000, gov: 7500, time: "15 - 30 Days", status: "Active" as const },
    { name: "GST Registration", category: "Taxation", recurring: false, frequency: "One Time", price: 3500, gov: 0, time: "3 - 7 Days", status: "Active" as const },
    { name: "GST Return Filing", category: "Taxation", recurring: true, frequency: "Monthly", price: 750, gov: 0, time: "1 - 2 Days", status: "Active" as const },
    { name: "Company Incorporation (Pvt Ltd)", category: "Business Formation", recurring: false, frequency: "One Time", price: 14999, gov: 2000, time: "10 - 15 Days", status: "Active" as const },
    { name: "Trademark Registration", category: "Intellectual Property", recurring: false, frequency: "One Time", price: 6500, gov: 4500, time: "1 - 2 Days", status: "Active" as const },
    { name: "Shop Act / Trade License", category: "Licensing", recurring: true, frequency: "Yearly", price: 3200, gov: 500, time: "5 - 7 Days", status: "Active" as const },
    { name: "Import Export (IEC Registration)", category: "Import Export", recurring: false, frequency: "One Time", price: 2500, gov: 500, time: "2 - 3 Days", status: "Active" as const },
    { name: "Digital Signature Certificate (DSC)", category: "Digital Services", recurring: false, frequency: "One Time", price: 1500, gov: 0, time: "1 - 2 Days", status: "Active" as const },
    { name: "Zomato Onboarding", category: "Business Growth", recurring: false, frequency: "One Time", price: 1000, gov: 0, time: "3 - 5 Days", status: "Active" as const },
    { name: "Swiggy Onboarding", category: "Business Growth", recurring: false, frequency: "One Time", price: 1000, gov: 0, time: "3 - 5 Days", status: "Active" as const },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }
  console.log("✅ Seeded Services Catalog");

  // 3. Seed Default Franchise Partners (Synced with App)
  const partners = [
    { partnerId: "P-101", name: "Rahul Jha", shortName: "P-101 • Rahul Jha", phone: "9873207632", userId: "9873207632", email: "rahul.jha@finsocap.com", city: "Patna", state: "Bihar", status: "Active" as const, tier: "Gold Franchise", registeredAt: "10 Jan 2026", leadsCount: 512, revenueStr: "₹3.84L", activeTasks: 38 },
    { partnerId: "P-102", name: "Kanhaiya", shortName: "P-102 • Kanhaiya", phone: "7011340730", userId: "7011340730", email: "kanhaiya@finsocap.com", city: "Muzaffarpur", state: "Bihar", status: "Active" as const, tier: "Gold Franchise", registeredAt: "18 Jan 2026", leadsCount: 420, revenueStr: "₹2.95L", activeTasks: 27 },
    { partnerId: "P-103", name: "Gaurav", shortName: "P-103 • Gaurav", phone: "9312345678", userId: "9312345678", email: "gaurav@finsocap.com", city: "Gaya", state: "Bihar", status: "Active" as const, tier: "Silver Franchise", registeredAt: "05 Feb 2026", leadsCount: 310, revenueStr: "₹2.10L", activeTasks: 19 },
    { partnerId: "P-104", name: "Roshan", shortName: "P-104 • Roshan", phone: "9998887776", userId: "9998887776", email: "roshan@finsocap.com", city: "Bhagalpur", state: "Bihar", status: "Active" as const, tier: "Bronze Franchise", registeredAt: "14 Feb 2026", leadsCount: 185, revenueStr: "₹1.45L", activeTasks: 12 },
    { partnerId: "P-105", name: "Roshni", shortName: "P-105 • Roshni", phone: "8887776655", userId: "8887776655", email: "roshni@finsocap.com", city: "Darbhanga", state: "Bihar", status: "Active" as const, tier: "Silver Franchise", registeredAt: "02 Mar 2026", leadsCount: 240, revenueStr: "₹1.90L", activeTasks: 15 },
  ];

  for (const p of partners) {
    await prisma.partner.upsert({
      where: { partnerId: p.partnerId },
      update: {},
      create: {
        ...p,
        password: defaultPassword,
      },
    });
  }
  console.log("✅ Seeded Franchise Partners");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
