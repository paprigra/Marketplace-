export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const DEAL_STATUS: Record<string, { label: string; color: string; desc: string }> = {
  waiting_payment: { label: "รอชำระเงิน",    color: "bg-yellow-100 text-yellow-800", desc: "รอผู้ซื้อโอนเงินเข้าระบบ" },
  holding:         { label: "ถือเงินไว้",    color: "bg-blue-100 text-blue-800",    desc: "ระบบถือเงินไว้ รอผู้ขายส่งของ" },
  shipped:         { label: "อยู่ระหว่างจัดส่ง", color: "bg-purple-100 text-purple-800", desc: "ผู้ขายส่งของแล้ว รอผู้ซื้อยืนยัน" },
  completed:       { label: "สำเร็จ",        color: "bg-green-100 text-green-800",  desc: "ดีลเสร็จสิ้น โอนเงินให้ผู้ขายแล้ว" },
  cancelled:       { label: "ยกเลิก",        color: "bg-red-100 text-red-800",      desc: "ดีลถูกยกเลิก" },
  disputed:        { label: "มีข้อพิพาท",    color: "bg-orange-100 text-orange-800", desc: "อยู่ระหว่างการพิจารณา" },
};
