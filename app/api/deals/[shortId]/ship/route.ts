import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/deals/[shortId]/ship">) {
  const { shortId } = await ctx.params;
  const { trackingNo } = await req.json();
  const deal = await prisma.deal.findUnique({ where: { shortId } });
  if (!deal) return Response.json({ error: "ไม่พบดีล" }, { status: 404 });
  if (deal.status !== "holding") return Response.json({ error: "ยังไม่ได้รับเงิน" }, { status: 400 });

  const updated = await prisma.deal.update({
    where: { shortId },
    data: { status: "shipped", trackingNo, shippedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: deal.buyerId || undefined,
      title: "สินค้ากำลังจัดส่ง",
      message: `ดีล #${shortId} — ${deal.itemName} เลขพัสดุ: ${trackingNo || "ไม่ระบุ"}`,
      type: "order",
    },
  });

  return Response.json({ deal: updated });
}
