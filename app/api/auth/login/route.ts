import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return Response.json({ error: "ไม่พบบัญชีผู้ใช้" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return Response.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email ?? "", role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
