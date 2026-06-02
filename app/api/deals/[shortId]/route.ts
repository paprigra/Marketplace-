import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/deals/[shortId]">) {
  const { shortId } = await ctx.params;
  const deal = await prisma.deal.findUnique({
    where: { shortId },
    include: {
      buyer: { select: { id: true, name: true, phone: true } },
      seller: { select: { id: true, name: true, phone: true } },
    },
  });
  if (!deal) return Response.json({ error: "ไม่พบดีล" }, { status: 404 });
  return Response.json({ deal });
}
