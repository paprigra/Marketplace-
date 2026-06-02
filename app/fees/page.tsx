import { DEFAULT_FEE_TIERS, calculateFee } from "@/lib/fees";
import { formatCurrency } from "@/lib/utils";

export default function FeesPage() {
  const examples = [100, 500, 1000, 2000, 3000, 5000, 10000];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ค่าบริการ</h1>
      <p className="text-gray-500 mb-8">ค่าบริการคิดจากผู้ขาย โดยคำนวณจากราคาสินค้า</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h2 className="font-bold">อัตราค่าบริการ</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {DEFAULT_FEE_TIERS.map((tier, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <p className="font-medium text-gray-800">
                {tier.maxAmount
                  ? `฿${tier.minAmount.toLocaleString()} – ฿${tier.maxAmount.toLocaleString()}`
                  : `฿${tier.minAmount.toLocaleString()} ขึ้นไป`}
              </p>
              <span className="text-lg font-bold text-blue-600">
                {tier.feeType === "fixed" ? `฿${tier.feeValue}` : `${tier.feeValue}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">ตัวอย่างการคำนวณ</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-3 px-6 py-2 text-xs font-semibold text-gray-400 uppercase">
            <span>ราคาสินค้า</span>
            <span className="text-center">ค่าบริการ</span>
            <span className="text-right">ผู้ขายได้รับ</span>
          </div>
          {examples.map((amount) => {
            const fee = calculateFee(amount, DEFAULT_FEE_TIERS);
            const net = amount - fee;
            return (
              <div key={amount} className="grid grid-cols-3 px-6 py-3 hover:bg-gray-50">
                <span className="text-gray-800 font-medium">{formatCurrency(amount)}</span>
                <span className="text-center text-red-500 font-medium">-{formatCurrency(fee)}</span>
                <span className="text-right text-blue-600 font-bold">{formatCurrency(net)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-gray-400 text-center mt-6">ค่าบริการอาจมีการเปลี่ยนแปลง โปรดตรวจสอบก่อนสร้างดีล</p>
    </div>
  );
}
