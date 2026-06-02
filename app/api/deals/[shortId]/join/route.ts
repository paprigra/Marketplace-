import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/deals/[shortId]/join">) {
  const { shortId } = await ctx.params;
  const { name, phone } = await req.json();
  const session = await getSession();

  const deal = await prisma.deal.findUnique({ where: { shortId } });
  if (!deal) return Response.json({ error: "ไม่พบดีล" }, { status: 404 });
  if (!["waiting_payment"].includes(deal.status)) {
    return Response.json({ error: "ดีลนี้ไม่สามารถเข้าร่วมได้แล้ว" }, { status: 400 });
  }

  // Determine role: join as the missing side
  const joinAsBuyer = !deal.buyerId && !deal.buyerName;
  const joinAsSeller = !deal.sellerId && !deal.sellerName;

  if (!joinAsBuyer && !joinAsSeller) {
    return Response.json({ error: "ดีลนี้มีผู้เข้าร่วมครบแล้ว" }, { status: 400 });
  }

  const updated = await prisma.deal.update({
    where: { shortId },
    data: joinAsBuyer
      ? { buyerId: session?.userId, buyerName: name, buyerPhone: phone }
      : { sellerId: session?.userId, sellerName: name, sellerPhone: phone },
  });

  return Response.json({ deal: updated });
}
