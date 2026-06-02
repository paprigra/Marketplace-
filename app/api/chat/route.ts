import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { calculateFee, DEFAULT_FEE_TIERS } from "@/lib/fees";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `คุณคือ "บาซาร์บอท" ผู้ช่วย AI ของ ThaiBazaar บริการสื่อกลางซื้อขายออนไลน์

หน้าที่:
- อธิบายวิธีใช้บริการ ขั้นตอนสร้างดีล
- คำนวณค่าบริการ: 0-500บ.=15บ. | 501-2,000บ.=30บ. | 2,001-5,000บ.=2% | 5,001+บ.=1.5%
- ตอบคำถามเกี่ยวกับ Escrow/สื่อกลาง
- แนะนำวิธีแชร์ลิงค์ดีลผ่าน Facebook

ขั้นตอนหลัก: สร้างดีล → แชร์ลิงค์ → ผู้ซื้อจ่าย → ผู้ขายส่ง → ยืนยัน → โอนเงิน

ตอบสั้นกระชับ เป็นกันเอง ภาษาไทย`;

export async function POST(req: NextRequest) {
  const session = await getSession();
  const { message } = await req.json();
  if (!message?.trim()) return Response.json({ error: "กรุณาพิมพ์ข้อความ" }, { status: 400 });

  const feeCalc = message.match(/(?:คำนวณ|ค่าบริการ)\s+(\d+)/);
  if (feeCalc) {
    const amount = parseFloat(feeCalc[1]);
    const fee = calculateFee(amount, DEFAULT_FEE_TIERS);
    return Response.json({ reply: `ราคา ฿${amount.toLocaleString()} → ค่าบริการ ฿${fee.toLocaleString()} → ผู้ขายได้รับ ฿${(amount - fee).toLocaleString()}` });
  }

  const whereClause = session
    ? { userId: session.userId }
    : { userId: undefined, fbUserId: undefined };

  if (session) {
    await prisma.chatMessage.create({ data: { userId: session.userId, role: "user", content: message } });
  }

  const history = session
    ? await prisma.chatMessage.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" }, take: 10 })
    : [];

  const messages = history.reverse().slice(0, -1).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  messages.push({ role: "user", content: message });

  let reply: string;
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
    const demos: Record<string, string> = {
      "ค่าบริการ": "ค่าบริการของเรา 💰\n• 0-500 บาท = 15 บาท\n• 501-2,000 บาท = 30 บาท\n• 2,001-5,000 บาท = 2%\n• 5,001+ บาท = 1.5%",
      "วิธีใช้": "วิธีใช้งาน 📋\n1. สร้างดีล → ได้ลิงค์\n2. แชร์ลิงค์ให้อีกฝ่ายใน Facebook\n3. ผู้ซื้อจ่ายเงิน → ระบบถือไว้\n4. ผู้ขายส่งของ → ผู้ซื้อยืนยัน\n5. โอนเงินให้ผู้ขาย ✅",
      "โกง": "ไม่ต้องกลัวโดนโกงครับ 🛡️ เงินของผู้ซื้อถูกเก็บไว้กับระบบเรา ไม่ได้โอนตรงให้ผู้ขาย จนกว่าผู้ซื้อจะยืนยันว่าได้รับของแล้ว",
      "facebook": "วิธีใช้กับ Facebook 📘\n1. สร้างดีลในเว็บเรา\n2. คัดลอกลิงค์ดีล\n3. แชร์ใน Messenger หรือ Comment โพสต์\n4. อีกฝ่ายกดลิงค์มาเข้าร่วมดีลได้เลย",
    };
    const key = Object.keys(demos).find((k) => message.includes(k));
    reply = key ? demos[key] : "สวัสดีครับ! 👋 มีอะไรให้ช่วยไหม? ถามเรื่องค่าบริการ วิธีใช้ หรืออื่นๆ ได้เลยครับ";
  } else {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    });
    reply = (res.content[0] as { type: string; text: string }).text;
  }

  if (session) {
    await prisma.chatMessage.create({ data: { userId: session.userId, role: "assistant", content: reply } });
  }

  return Response.json({ reply });
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ messages: [] });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return Response.json({ messages });
}
