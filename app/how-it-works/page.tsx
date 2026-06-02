import Link from "next/link";
import { Shield, Copy, Banknote, Truck, CheckCircle, MessageCircle, HelpCircle } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">วิธีใช้งาน ThaiBazaar</h1>
      <p className="text-gray-500 mb-10">บริการสื่อกลางถือเงิน ซื้อขายออนไลน์ปลอดภัย ไม่กลัวโดนโกง</p>

      {/* Steps */}
      <div className="space-y-6 mb-12">
        {[
          {
            icon: Shield,
            color: "bg-blue-100 text-blue-600",
            title: "1. สร้างดีล",
            desc: "กรอกชื่อสินค้า ราคา และข้อมูลผู้ซื้อ-ผู้ขาย ระบบจะสร้างรหัสดีลและลิงค์ให้ทันที ใช้งานได้เลยโดยไม่ต้องสมัครสมาชิก",
          },
          {
            icon: Copy,
            color: "bg-purple-100 text-purple-600",
            title: "2. แชร์ลิงค์ผ่าน Facebook",
            desc: "คัดลอกลิงค์ดีลแชร์ให้อีกฝ่ายผ่าน Facebook Messenger, โพสต์, หรือ Line ก็ได้ อีกฝ่ายกดลิงค์มาดูรายละเอียดดีลได้เลย",
          },
          {
            icon: Banknote,
            color: "bg-green-100 text-green-600",
            title: "3. ผู้ซื้อชำระเงิน",
            desc: "ผู้ซื้อโอนเงินเข้าระบบของเรา เงินจะถูกเก็บไว้อย่างปลอดภัย ผู้ขายไม่ได้รับเงินในขั้นตอนนี้ ทั้งสองฝ่ายจะได้รับแจ้งเตือน",
          },
          {
            icon: Truck,
            color: "bg-orange-100 text-orange-600",
            title: "4. ผู้ขายส่งสินค้า",
            desc: "ผู้ขายจัดส่งสินค้าและบันทึกเลขพัสดุในระบบ ผู้ซื้อจะได้รับแจ้งเตือนเพื่อติดตามพัสดุ",
          },
          {
            icon: CheckCircle,
            color: "bg-emerald-100 text-emerald-600",
            title: "5. ยืนยันรับสินค้า → ได้รับเงิน",
            desc: "เมื่อผู้ซื้อได้รับสินค้าและตรวจสอบเรียบร้อย กดยืนยัน ระบบจะโอนเงินให้ผู้ขายทันที (หักค่าบริการ) ดีลสำเร็จ!",
          },
        ].map((step) => (
          <div key={step.title} className="flex gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
              <step.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Facebook */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📘</span>
          <h2 className="font-bold text-gray-800">ใช้งานผ่าน Facebook Messenger</h2>
        </div>
        <p className="text-gray-600 text-sm mb-3">ส่งข้อความหา Page เราบน Facebook เพื่อ:</p>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>💬 ถามเรื่องวิธีใช้และค่าบริการ</li>
          <li>📦 เช็คสถานะดีล พิมพ์ "เช็ค + รหัสดีล" เช่น "เช็ค ABC123"</li>
          <li>💰 คำนวณค่าบริการ พิมพ์ "ค่าบริการ + ราคา" เช่น "ค่าบริการ 2500"</li>
          <li>🤖 ถามคำถามทั่วไปได้เลย AI จะตอบทันที</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="space-y-3 mb-10">
        <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-500" /> คำถามที่พบบ่อย</h2>
        {[
          { q: "ต้องสมัครสมาชิกไหม?", a: "ไม่ต้องครับ สร้างดีลได้เลยโดยไม่ต้องมีบัญชี แต่ถ้าสมัครจะจัดการดีลได้สะดวกกว่า" },
          { q: "ถ้าสินค้าไม่ตรงปกหรือไม่ได้รับของ?", a: "อย่ากดยืนยันรับของครับ ติดต่อทีมงานเพื่อเปิดข้อพิพาท เราจะช่วยไกล่เกลี่ย" },
          { q: "ค่าบริการคิดจากใคร?", a: "คิดจากผู้ขายครับ หักออกจากยอดที่ได้รับเมื่อดีลสำเร็จ ผู้ซื้อไม่ต้องจ่ายค่าบริการเพิ่ม" },
          { q: "เงินปลอดภัยแค่ไหน?", a: "เงินถูกเก็บในระบบของเรา ไม่ได้โอนตรงให้ผู้ขาย จนกว่าผู้ซื้อจะยืนยันรับสินค้าแล้วเท่านั้น" },
        ].map((faq) => (
          <div key={faq.q} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-gray-800 mb-1">{faq.q}</p>
            <p className="text-gray-500 text-sm">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/create-deal" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors text-lg">
          <Shield className="w-5 h-5" /> สร้างดีลเลย
        </Link>
      </div>
    </div>
  );
}
