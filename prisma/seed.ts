import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  const pw = await bcrypt.hash("test1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@thaibazaar.com" },
    update: {},
    create: { email: "admin@thaibazaar.com", password: pw, name: "Admin", role: "admin" },
  });

  // Seed default fee tiers
  await prisma.feeConfig.deleteMany();
  await prisma.feeConfig.createMany({
    data: [
      { minAmount: 0,    maxAmount: 500,   feeType: "fixed",   feeValue: 15,  order: 1 },
      { minAmount: 501,  maxAmount: 2000,  feeType: "fixed",   feeValue: 30,  order: 2 },
      { minAmount: 2001, maxAmount: 5000,  feeType: "percent", feeValue: 2,   order: 3 },
      { minAmount: 5001, maxAmount: null,  feeType: "percent", feeValue: 1.5, order: 4 },
    ],
  });

  // Sample deals
  const d1 = await prisma.deal.create({
    data: {
      shortId: "DEMO01",
      itemName: "iPhone 15 Pro 256GB สีดำ",
      description: "สภาพ 99% ใช้มา 2 เดือน ครบกล่อง",
      amount: 38000,
      fee: 570,
      buyerName: "สมชาย ใจดี",
      buyerPhone: "0812345678",
      sellerName: "ร้านมือสอง iThai",
      sellerPhone: "0898765432",
      createdBy: "demo",
      status: "waiting_payment",
    },
  });

  const d2 = await prisma.deal.create({
    data: {
      shortId: "DEMO02",
      itemName: "กระเป๋า Gucci แท้ มือสอง",
      amount: 15000,
      fee: 225,
      buyerName: "วิไล สวยงาม",
      sellerName: "ป้าน้อย ของแท้",
      createdBy: "demo",
      status: "holding",
      paidAt: new Date(Date.now() - 86400000),
    },
  });

  console.log(`Created deals: ${d1.shortId}, ${d2.shortId}`);
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
