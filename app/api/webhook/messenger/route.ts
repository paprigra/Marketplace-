import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { calculateFee, DEFAULT_FEE_TIERS } from "@/lib/fees";
import { generateShortId } from "@/lib/utils";

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || "thaibazaar_verify_2024";
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || "";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `คุณคือ "บาซาร์บอท" ผู้ช่วย AI ของ ThaiBazaar บริการสื่อกลางซื้อขายออนไลน์ที่ถือเงินกลางป้องกันการโกง

บริการของเรา:
- รับซื้อขายทุกประเภท ไม่จำกัดแพลตฟอร์ม (Facebook, IG, Line ฯลฯ)
- ถือเงินของผู้ซื้อไว้จนกว่าจะได้รับสินค้า
- ค่าบริการ: 0-500 บาท = 15 บาท | 501-2,000 = 30 บาท | 2,001-5,000 = 2% | 5,001+ = 1.5%
- สร้างดีลได้ที่เว็บไซต์ แล้วแชร์ลิงค์ให้อีกฝ่าย

ขั้นตอน:
1. ผู้ซื้อ/ขายสร้างดีลที่เว็บ → ได้ลิงค์แชร์
2. ส่งลิงค์ให้อีกฝ่ายผ่าน Facebook/Line
3. ผู้ซื้อโอนเงินเข้าระบบ → ระบบถือไว้
4. ผู้ขายส่งของ → ผู้ซื้อยืนยัน → ได้รับเงิน

ตอบสั้นกระชับ เป็นกันเอง ภาษาไทย ใช้ emoji บ้าง`;

async function sendMessage(recipientId: string, text: string) {
  if (!PAGE_ACCESS_TOKEN) return;
  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });
}

async function handleMessage(senderId: string, text: string) {
  const lowerText = text.toLowerCase();

  // Check deal status command: "เช็ค XXXXXX" or "ดีล XXXXXX"
  const dealCheck = text.match(/(?:เช็ค|ดีล|deal|check)\s+([A-Z0-9]{6})/i);
  if (dealCheck) {
    const shortId = dealCheck[1].toUpperCase();
    const deal = await prisma.deal.findUnique({ where: { shortId } });
    if (deal) {
      const statusMap: Record<string, string> = {
        waiting_payment: "⏳ รอชำระเงิน",
        holding: "🔒 ถือเงินไว้ รอส่งของ",
        shipped: "🚚 กำลังจัดส่ง รอผู้ซื้อยืนยัน",
        completed: "✅ สำเร็จแล้ว",
        cancelled: "❌ ยกเลิกแล้ว",
      };
      const status = statusMap[deal.status] || deal.status;
      return `📦 ดีล #${shortId}\nสินค้า: ${deal.itemName}\nราคา: ฿${deal.amount.toLocaleString()}\nสถานะ: ${status}${deal.trackingNo ? `\nเลขพัสดุ: ${deal.trackingNo}` : ""}`;
    }
    return `❌ ไม่พบดีล #${shortId} กรุณาตรวจสอบรหัสอีกครั้ง`;
  }

  // Fee calculation: "คำนวณ 1500" or "ค่าบริการ 1500"
  const feeCalc = text.match(/(?:คำนวณ|ค่าบริการ|fee)\s+(\d+)/i);
  if (feeCalc) {
    const amount = parseFloat(feeCalc[1]);
    const fee = calculateFee(amount, DEFAULT_FEE_TIERS);
    const net = amount - fee;
    return `💰 ราคา ฿${amount.toLocaleString()}\nค่าบริการ: ฿${fee.toLocaleString()}\nผู้ขายได้รับ: ฿${net.toLocaleString()}`;
  }

  // Save/retrieve chat history for AI
  await prisma.chatMessage.create({ data: { fbUserId: senderId, role: "user", content: text } });

  const history = await prisma.chatMessage.findMany({
    where: { fbUserId: senderId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const messages = history.reverse().slice(0, -1).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  messages.push({ role: "user", content: text });

  let reply: string;
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
    reply = "สวัสดีครับ! 👋 บาซาร์บอทพร้อมช่วยเหลือ\nพิมพ์ \"เช็ค + รหัสดีล\" เพื่อเช็คสถานะ\nพิมพ์ \"ค่าบริการ + ราคา\" เพื่อคำนวณค่าบริการ\nหรือสอบถามทั่วไปได้เลย 😊";
  } else {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    });
    reply = (response.content[0] as { type: string; text: string }).text;
  }

  await prisma.chatMessage.create({ data: { fbUserId: senderId, role: "assistant", content: reply } });
  return reply;
}

// Webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Receive messages
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.object === "page") {
    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        if (event.message?.text) {
          const senderId = event.sender.id;
          const text = event.message.text;
          const reply = await handleMessage(senderId, text);
          await sendMessage(senderId, reply);
        }
      }
    }
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
