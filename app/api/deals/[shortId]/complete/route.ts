import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/deals/[shortId]/complete">) {
  const { shortId } = await ctx.params;
  const deal = await prisma.deal.findUnique({ where: { shortId } });
  if (!deal) return Response.json({ error: "ไม่พบดีล" }, { status: 404 });
  if (deal.status !== "shipped") return Response.json({ error: "ยังไม่ได้จัดส่ง" }, { status: 400 });

  const sellerAmount = deal.amount - deal.fee;

  const updated = await prisma.deal.update({
    where: { shortId },
    data: { status: "completed", completedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: deal.sellerId || undefined,
      title: "ดีลสำเร็จ — ได้รับเงินแล้ว",
      message: `ดีล #${shortId} เสร็จสิ้น ฿${sellerAmount.toLocaleString()} (หักค่าบริการ ฿${deal.fee.toLocaleString()}) โอนให้คุณแล้ว`,
      type: "payment",
    },
  });

  return Response.json({ deal: updated, sellerAmount, message: `ยืนยันรับสินค้าแล้ว โอน ฿${sellerAmount.toLocaleString()} ให้ผู้ขาย (หักค่าบริการ ฿${deal.fee.toLocaleString()})` });
}
