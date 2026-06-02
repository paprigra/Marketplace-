import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/deals/[shortId]/pay">) {
  const { shortId } = await ctx.params;
  const deal = await prisma.deal.findUnique({ where: { shortId } });
  if (!deal) return Response.json({ error: "ไม่พบดีล" }, { status: 404 });
  if (deal.status !== "waiting_payment") {
    return Response.json({ error: "ดีลนี้ไม่สามารถชำระเงินได้" }, { status: 400 });
  }

  const updated = await prisma.deal.update({
    where: { shortId },
    data: { status: "holding", paidAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: deal.sellerId || undefined,
      title: "ได้รับการชำระเงิน",
      message: `ดีล #${shortId} — ${deal.itemName} ชำระเงิน ฿${deal.amount.toLocaleString()} แล้ว ระบบถือเงินไว้`,
      type: "payment",
    },
  });

  return Response.json({ deal: updated, message: "ชำระเงินสำเร็จ เงินถูกเก็บไว้อย่างปลอดภัย" });
}
