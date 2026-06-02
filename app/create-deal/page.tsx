"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Copy, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { calculateFee, DEFAULT_FEE_TIERS } from "@/lib/fees";

export default function CreateDealPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "done">("form");
  const [createdDeal, setCreatedDeal] = useState<{ shortId: string; itemName: string; amount: number; fee: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    itemName: "",
    description: "",
    amount: "",
    createdAs: "buyer",
    myName: "",
    myPhone: "",
    otherName: "",
    otherPhone: "",
    note: "",
  });

  const fee = form.amount ? calculateFee(parseFloat(form.amount) || 0, DEFAULT_FEE_TIERS) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: form.itemName,
          description: form.description,
          amount: parseFloat(form.amount),
          createdAs: form.createdAs,
          buyerName: form.createdAs === "buyer" ? form.myName : form.otherName,
          buyerPhone: form.createdAs === "buyer" ? form.myPhone : form.otherPhone,
          sellerName: form.createdAs === "seller" ? form.myName : form.otherName,
          sellerPhone: form.createdAs === "seller" ? form.myPhone : form.otherPhone,
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCreatedDeal(data.deal);
      setStep("done");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const dealUrl = createdDeal ? `${typeof window !== "undefined" ? window.location.origin : ""}/deal/${createdDeal.shortId}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(dealUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === "done" && createdDeal) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">สร้างดีลสำเร็จ!</h1>
          <p className="text-gray-500 mb-6">รหัสดีล: <span className="font-bold text-blue-600 text-lg">#{createdDeal.shortId}</span></p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-sm text-gray-600"><span className="text-gray-400">สินค้า:</span> {createdDeal.itemName}</p>
            <p className="text-sm text-gray-600"><span className="text-gray-400">ราคา:</span> {formatCurrency(createdDeal.amount)}</p>
            <p className="text-sm text-gray-600"><span className="text-gray-400">ค่าบริการ:</span> {formatCurrency(createdDeal.fee)}</p>
            <p className="text-sm font-semibold text-blue-700"><span className="text-gray-400">ผู้ขายรับ:</span> {formatCurrency(createdDeal.amount - createdDeal.fee)}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 flex-1 truncate">{dealUrl}</span>
            <button onClick={copyLink} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
              {copied ? "คัดลอกแล้ว!" : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={copyLink}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> คัดลอกลิงค์แชร์ใน Facebook
            </button>
            <button
              onClick={() => router.push(`/deal/${createdDeal.shortId}`)}
              className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              ดูหน้าดีล
            </button>
          </div>

          <div className="mt-6 bg-yellow-50 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-yellow-800 mb-2">ขั้นตอนถัดไป:</p>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>คัดลอกลิงค์แชร์ให้อีกฝ่ายใน Facebook/Line</li>
              <li>ผู้ซื้อกดลิงค์มาจ่ายเงินในระบบ</li>
              <li>ผู้ขายส่งของพร้อมเลขพัสดุ</li>
              <li>ผู้ซื้อยืนยันรับของ → ผู้ขายได้รับเงิน</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">สร้างดีลใหม่</h1>
            <p className="text-sm text-gray-500">ระบบสื่อกลางถือเงินปลอดภัย</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คุณเป็น</label>
            <div className="grid grid-cols-2 gap-2">
              {["buyer", "seller"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, createdAs: r })}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.createdAs === r ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"}`}
                >
                  {r === "buyer" ? "🛒 ผู้ซื้อ" : "🏪 ผู้ขาย"}
                </button>
              ))}
            </div>
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
            <input type="text" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="เช่น iPhone 15 Pro 256GB สีดำ" required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคาสินค้า (บาท) *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" min="1" required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            {form.amount && parseFloat(form.amount) > 0 && (
              <p className="text-xs text-blue-600 mt-1">ค่าบริการ {formatCurrency(fee)} · ผู้ขายได้รับ {formatCurrency(parseFloat(form.amount) - fee)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="สภาพ, อุปกรณ์ที่แถม ฯลฯ" rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>

          {/* My info */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">ข้อมูลของคุณ ({form.createdAs === "buyer" ? "ผู้ซื้อ" : "ผู้ขาย"})</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={form.myName} onChange={(e) => setForm({ ...form, myName: e.target.value })} placeholder="ชื่อ *" required className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="tel" value={form.myPhone} onChange={(e) => setForm({ ...form, myPhone: e.target.value })} placeholder="เบอร์โทร" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>

          {/* Other party info (optional) */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">ข้อมูล{form.createdAs === "buyer" ? "ผู้ขาย" : "ผู้ซื้อ"} <span className="font-normal text-gray-400">(ถ้ารู้)</span></p>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={form.otherName} onChange={(e) => setForm({ ...form, otherName: e.target.value })} placeholder="ชื่อ" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="tel" value={form.otherPhone} onChange={(e) => setForm({ ...form, otherPhone: e.target.value })} placeholder="เบอร์โทร" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="เงื่อนไขพิเศษ ที่อยู่ส่ง ฯลฯ" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-base">
            <Shield className="w-5 h-5" />
            {loading ? "กำลังสร้าง..." : "สร้างดีลและรับลิงค์"}
          </button>
        </form>
      </div>
    </div>
  );
}
