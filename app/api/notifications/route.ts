import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { ids } = await req.json();

  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: session.userId },
    data: { read: true },
  });

  return Response.json({ success: true });
}
