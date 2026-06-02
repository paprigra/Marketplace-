"use client";
import Link from "next/link";
import { Shield, MessageCircle, Zap, ChevronRight, CheckCircle, Calculator } from "lucide-react";
import { useState } from "react";
import { calculateFee, DEFAULT_FEE_TIERS } from "@/lib/fees";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const [calcAmount, setCalcAmount] = useState("");
  const fee = calcAmount ? calculateFee(parseFloat(calcAmount) || 0, DEFAULT_FEE_TIERS) : 0;
  const net = calcAmount ? (parseFloat(calcAmount) || 0) - fee : 0;

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
            <span className="text-sm">📘</span> เชื่อมต่อกับ Facebook ได้เลย
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            ซื้อขายออนไลน์<br />
            <span className="text-yellow-300">ปลอดภัย 100%</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            เราถือเงินกลางให้คุณ — ผู้ขายได้เงินเมื่อผู้ซื้อได้รับของแล้วเท่านั้น
            ไม่ต้องกลัวโดนโกงอีกต่อไป
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-deal" className="px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-2xl hover:bg-yellow-300 transition-colors text-lg flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" /> สร้างดีลเลย
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 bg-white/20 text-white font-bold rounded-2xl hover:bg-white/30 transition-colors text-lg flex items-center justify-center gap-2">
              วิธีใช้งาน <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">วิธีใช้งาน — ง่ายมาก 4 ขั้นตอน</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: "1", icon: "📝", title: "สร้างดีล", desc: "กรอกชื่อสินค้า ราคา ข้อมูลผู้ซื้อ-ขาย" },
              { n: "2", icon: "🔗", title: "แชร์ลิงค์", desc: "ส่งลิงค์ดีลผ่าน Facebook Messenger หรือ Line" },
              { n: "3", icon: "💰", title: "ผู้ซื้อจ่าย", desc: "เงินถูกเก็บไว้กับเราอย่างปลอดภัย" },
              { n: "4", icon: "✅", title: "ส่งของ → รับเงิน", desc: "ผู้ซื้อยืนยันรับของ เราโอนเงินให้ผู้ขายทันที" },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                  {step.icon}
                </div>
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-2">
                  {step.n}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Calculator */}
      <div className="bg-gray-50 py-14">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-500" /> คำนวณค่าบริการ
            </h2>
            <p className="text-gray-500 text-sm mb-6">ค่าบริการขึ้นอยู่กับราคาสินค้า — คิดจากผู้ขาย</p>

            <div className="flex gap-3 mb-6">
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                placeholder="ราคาสินค้า (บาท)"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
              />
            </div>

            {calcAmount && parseFloat(calcAmount) > 0 && (
              <div className="bg-blue-50 rounded-xl p-5 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ราคาสินค้า</span>
                  <span>{formatCurrency(parseFloat(calcAmount))}</span>
                </div>
                <div className="flex justify-between text-sm text-red-500">
                  <span>ค่าบริการ</span>
                  <span>-{formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-800 text-lg border-t border-blue-200 pt-2">
                  <span>ผู้ขายได้รับ</span>
                  <span>{formatCurrency(net)}</span>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
              {DEFAULT_FEE_TIERS.map((tier, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 text-center text-sm">
                  <p className="text-gray-500 text-xs mb-1">
                    {tier.maxAmount ? `฿${tier.minAmount.toLocaleString()}–${tier.maxAmount.toLocaleString()}` : `฿${tier.minAmount.toLocaleString()}+`}
                  </p>
                  <p className="font-bold text-blue-600">
                    {tier.feeType === "fixed" ? `฿${tier.feeValue}` : `${tier.feeValue}%`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Facebook CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-5xl">📘</span>
          <h2 className="text-3xl font-bold mb-3">ใช้งานผ่าน Facebook ได้เลย</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            ส่งข้อความหา Page ของเรา หรือส่งลิงค์ดีลใน Messenger ได้ทันที
            บอทจะช่วยตอบทุกคำถามและเช็คสถานะดีลให้
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-deal" className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-colors">
              สร้างดีลทันที
            </Link>
            <Link href="/chat" className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> คุยกับ AI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
