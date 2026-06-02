import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  if (!user) return Response.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  return Response.json({ user });
}
