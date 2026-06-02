import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateFee } from "@/lib/fees"; import { getFeeTiers } from "@/lib/fees-server";
import { generateShortId } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const deals = await prisma.deal.findMany({
    where: {
      OR: [{ buyerId: session.userId }, { sellerId: session.userId }, { createdBy: session.userId }],
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ deals });
}

export async function POST(req: NextRequest) {
  const { itemName, description, amount, buyerName, buyerPhone, sellerName, sellerPhone, note, createdAs } = await req.json();

  if (!itemName || !amount || amount <= 0) {
    return Response.json({ error: "กรุณากรอกชื่อสินค้าและราคา" }, { status: 400 });
  }

  const session = await getSession();
  const tiers = await getFeeTiers();
  const fee = calculateFee(parseFloat(amount), tiers);

  let shortId = generateShortId();
  let attempts = 0;
  while (await prisma.deal.findUnique({ where: { shortId } }) && attempts < 5) {
    shortId = generateShortId();
    attempts++;
  }

  const deal = await prisma.deal.create({
    data: {
      shortId,
      itemName,
      description,
      amount: parseFloat(amount),
      fee,
      buyerName: createdAs === "buyer" ? (session ? undefined : buyerName) : buyerName,
      buyerPhone: createdAs === "buyer" ? (session ? undefined : buyerPhone) : buyerPhone,
      sellerName: createdAs === "seller" ? (session ? undefined : sellerName) : sellerName,
      sellerPhone: createdAs === "seller" ? (session ? undefined : sellerPhone) : sellerPhone,
      note,
      buyerId: session && createdAs === "buyer" ? session.userId : undefined,
      sellerId: session && createdAs === "seller" ? session.userId : undefined,
      createdBy: session?.userId || "anonymous",
    },
  });

  return Response.json({ deal }, { status: 201 });
}
