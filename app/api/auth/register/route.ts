import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return Response.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "user" },
    });

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
