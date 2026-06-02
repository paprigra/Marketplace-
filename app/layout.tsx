import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "ThaiBazaar - สื่อกลางซื้อขายออนไลน์ปลอดภัย",
  description: "บริการถือเงินกลาง ซื้อขายออนไลน์ไม่กลัวโดนโกง เชื่อมต่อ Facebook ได้เลย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[family-name:var(--font-sarabun)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-800 text-gray-300 text-center py-5 text-sm mt-8">
          <p className="mb-1">© 2025 ThaiBazaar · บริการสื่อกลางซื้อขายออนไลน์ปลอดภัย</p>
          <p className="text-gray-500 text-xs">เราถือเงินกลาง — ผู้ขายได้เงินเมื่อผู้ซื้อได้รับสินค้าแล้วเท่านั้น</p>
        </footer>
      </body>
    </html>
  );
}
