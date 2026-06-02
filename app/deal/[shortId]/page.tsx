"use client";
import { useState, useEffect, use } from "react";
import { Shield, Truck, CheckCircle, Copy, AlertCircle, Clock } from "lucide-react";
import { formatCurrency, formatDate, DEAL_STATUS } from "@/lib/utils";

interface Deal {
  id: string;
  shortId: string;
  itemName: string;
  description: string | null;
  amount: number;
  fee: number;
  status: string;
  buyerName: string | null;
  sellerName: string | null;
  buyerPhone: string | null;
  sellerPhone: string | null;
  trackingNo: string | null;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
}

export default function DealPage({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [trackingInput, setTrackingInput] = useState("");
  const [showShipForm, setShowShipForm] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/deals/${shortId}`);
    const data = await res.json();
    if (data.deal) setDeal(data.deal);
    setLoading(false);
  };

  useEffect(() => { load(); }, [shortId]);

  const doAction = async (endpoint: string, body?: Record<string, unknown>) => {
    setActionLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/deals/${shortId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : "{}",
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error); setMsgType("error"); return; }
      setMsg(data.message || "สำเร็จ");
      setMsgType("success");
      load();
    } catch {
      setMsg("เกิดข้อผิดพลาด"); setMsgType("error");
    } finally {
      setActionLoading(false);
      setShowShipForm(false);
      setShowJoinForm(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="max-w-xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  );

  if (!deal) return (
    <div className="text-center py-20">
      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">ไม่พบดีลนี้</p>
    </div>
  );

  const statusInfo = DEAL_STATUS[deal.status] || { label: deal.status, color: "bg-gray-100 text-gray-600", desc: "" };
  const needsBuyer = !deal.buyerName;
  const needsSeller = !deal.sellerName;
  const sellerReceives = deal.amount - deal.fee;

  const steps = [
    { label: "สร้างดีล", done: true },
    { label: "ชำระเงิน", done: ["holding","shipped","completed"].includes(deal.status) },
    { label: "จัดส่ง", done: ["shipped","completed"].includes(deal.status) },
    { label: "สำเร็จ", done: deal.status === "completed" },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-blue-200 text-sm mb-1">รหัสดีล</p>
            <h1 className="text-3xl font-bold tracking-wider">#{deal.shortId}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <h2 className="text-lg font-semibold mb-1">{deal.itemName}</h2>
        <p className="text-blue-100 text-sm">{statusInfo.desc}</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {step.done ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className={`text-xs mt-1 ${step.done ? "text-blue-600 font-medium" : "text-gray-400"}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 ${steps[i + 1].done ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm mb-4 border ${msgType === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
          {msg}
        </div>
      )}

      {/* Deal Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-800">รายละเอียดดีล</div>
        <div className="p-5 space-y-3 text-sm">
          {deal.description && (
            <div><span className="text-gray-400">รายละเอียด:</span> <span className="text-gray-700">{deal.description}</span></div>
          )}
          <div className="flex justify-between"><span className="text-gray-400">ราคาสินค้า</span><span className="font-semibold">{formatCurrency(deal.amount)}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">ค่าบริการ</span><span className="text-red-500">-{formatCurrency(deal.fee)}</span></div>
          <div className="flex justify-between border-t pt-3"><span className="text-gray-600 font-semibold">ผู้ขายได้รับ</span><span className="font-bold text-blue-600 text-base">{formatCurrency(sellerReceives)}</span></div>
          {deal.note && <div className="bg-yellow-50 rounded-xl p-3 text-yellow-700 text-xs">{deal.note}</div>}
          {deal.trackingNo && (
            <div className="bg-purple-50 rounded-xl p-3">
              <span className="text-purple-600 font-semibold">เลขพัสดุ: {deal.trackingNo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Parties */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-800">ผู้เกี่ยวข้อง</div>
        <div className="p-5 grid grid-cols-2 gap-4 text-sm">
          <div className={`rounded-xl p-3 ${deal.buyerName ? "bg-blue-50" : "bg-yellow-50 border border-dashed border-yellow-300"}`}>
            <p className="text-gray-400 text-xs mb-1">ผู้ซื้อ</p>
            {deal.buyerName ? (
              <>
                <p className="font-semibold text-gray-800">{deal.buyerName}</p>
                {deal.buyerPhone && <p className="text-gray-500 text-xs">{deal.buyerPhone}</p>}
              </>
            ) : (
              <p className="text-yellow-600 text-xs">รอผู้ซื้อเข้าร่วม</p>
            )}
          </div>
          <div className={`rounded-xl p-3 ${deal.sellerName ? "bg-green-50" : "bg-yellow-50 border border-dashed border-yellow-300"}`}>
            <p className="text-gray-400 text-xs mb-1">ผู้ขาย</p>
            {deal.sellerName ? (
              <>
                <p className="font-semibold text-gray-800">{deal.sellerName}</p>
                {deal.sellerPhone && <p className="text-gray-500 text-xs">{deal.sellerPhone}</p>}
              </>
            ) : (
              <p className="text-yellow-600 text-xs">รอผู้ขายเข้าร่วม</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Share link */}
        <button onClick={copyLink} className="w-full py-3 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200">
          <Copy className="w-4 h-4" />
          {copied ? "คัดลอกแล้ว! ✓" : "คัดลอกลิงค์แชร์"}
        </button>

        {/* Join deal */}
        {(needsBuyer || needsSeller) && deal.status === "waiting_payment" && (
          !showJoinForm ? (
            <button onClick={() => setShowJoinForm(true)} className="w-full py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors">
              {needsBuyer ? "เข้าร่วมเป็นผู้ซื้อ" : "เข้าร่วมเป็นผู้ขาย"}
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <p className="font-semibold text-gray-800">ข้อมูลของคุณ</p>
              <input type="text" value={joinName} onChange={(e) => setJoinName(e.target.value)} placeholder="ชื่อ *" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="tel" value={joinPhone} onChange={(e) => setJoinPhone(e.target.value)} placeholder="เบอร์โทร" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <div className="flex gap-2">
                <button onClick={() => doAction("join", { name: joinName, phone: joinPhone })} disabled={!joinName || actionLoading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-70">
                  {actionLoading ? "..." : "ยืนยัน"}
                </button>
                <button onClick={() => setShowJoinForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">ยกเลิก</button>
              </div>
            </div>
          )
        )}

        {/* Pay */}
        {deal.status === "waiting_payment" && deal.buyerName && deal.sellerName && (
          <button onClick={() => doAction("pay")} disabled={actionLoading} className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            {actionLoading ? "กำลังดำเนินการ..." : `ผู้ซื้อ: ชำระเงิน ${formatCurrency(deal.amount)}`}
          </button>
        )}

        {/* Ship */}
        {deal.status === "holding" && (
          !showShipForm ? (
            <button onClick={() => setShowShipForm(true)} className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Truck className="w-4 h-4" /> ผู้ขาย: บันทึกการจัดส่ง
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <p className="font-semibold text-gray-800">กรอกเลขพัสดุ</p>
              <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="เลขพัสดุ (ไม่บังคับ)" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              <div className="flex gap-2">
                <button onClick={() => doAction("ship", { trackingNo: trackingInput })} disabled={actionLoading} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-70">
                  {actionLoading ? "..." : "ยืนยันจัดส่ง"}
                </button>
                <button onClick={() => setShowShipForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">ยกเลิก</button>
              </div>
            </div>
          )
        )}

        {/* Complete */}
        {deal.status === "shipped" && (
          <button onClick={() => doAction("complete")} disabled={actionLoading} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {actionLoading ? "กำลังดำเนินการ..." : `ผู้ซื้อ: ยืนยันรับของ → โอน ${formatCurrency(sellerReceives)} ให้ผู้ขาย`}
          </button>
        )}

        {deal.status === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-green-800">ดีลสำเร็จ!</p>
            <p className="text-green-600 text-sm">โอน {formatCurrency(sellerReceives)} ให้ผู้ขายแล้ว</p>
            {deal.completedAt && <p className="text-gray-400 text-xs mt-1">{formatDate(deal.completedAt)}</p>}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> ประวัติดีล</h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2 text-gray-600"><span className="text-gray-400 w-36 shrink-0">{formatDate(deal.createdAt)}</span> สร้างดีล</div>
          {deal.paidAt && <div className="flex gap-2 text-blue-600"><span className="text-gray-400 w-36 shrink-0">{formatDate(deal.paidAt)}</span> ผู้ซื้อชำระเงินแล้ว</div>}
          {deal.shippedAt && <div className="flex gap-2 text-purple-600"><span className="text-gray-400 w-36 shrink-0">{formatDate(deal.shippedAt)}</span> ผู้ขายจัดส่งแล้ว</div>}
          {deal.completedAt && <div className="flex gap-2 text-green-600"><span className="text-gray-400 w-36 shrink-0">{formatDate(deal.completedAt)}</span> ดีลสำเร็จ</div>}
        </div>
      </div>
    </div>
  );
}
