"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, ChevronRight, Plus } from "lucide-react";
import { formatCurrency, formatDate, DEAL_STATUS } from "@/lib/utils";

interface Deal {
  id: string;
  shortId: string;
  itemName: string;
  amount: number;
  status: string;
  createdAt: string;
  buyerName: string | null;
  sellerName: string | null;
}

export default function MyDealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/auth/login"); return; }
      fetch("/api/deals").then(r => r.json()).then(d => setDeals(d.deals || [])).finally(() => setLoading(false));
    });
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" /> ดีลของฉัน
        </h1>
        <Link href="/create-deal" className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> สร้างดีล
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">ยังไม่มีดีล</p>
          <Link href="/create-deal" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold">
            สร้างดีลแรก
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => {
            const s = DEAL_STATUS[deal.status] || { label: deal.status, color: "bg-gray-100 text-gray-600" };
            return (
              <Link key={deal.id} href={`/deal/${deal.shortId}`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">
                  {deal.shortId}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm truncate">{deal.itemName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${s.color}`}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatCurrency(deal.amount)}</span>
                    <span>{formatDate(deal.createdAt)}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
