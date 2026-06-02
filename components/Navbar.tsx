"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Shield, MessageCircle, User, LogOut, ClipboardList, Menu, X } from "lucide-react";

interface UserData { id: string; name: string; role: string }

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">Thai<span className="text-blue-600">Bazaar</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/create-deal" className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">+ สร้างดีล</Link>
            <Link href="/how-it-works" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">วิธีใช้</Link>
            <Link href="/fees" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">ค่าบริการ</Link>
            <Link href="/chat" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> AI Chat
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/my-deals" className="hidden md:flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <ClipboardList className="w-4 h-4" /> ดีลของฉัน
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{user.name[0]}</div>
                  <span className="text-sm font-medium text-blue-700 hidden md:block">{user.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">เข้าสู่ระบบ</Link>
                <Link href="/auth/register" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">สมัครสมาชิก</Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <Link href="/create-deal" className="block px-3 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold text-center mb-2" onClick={() => setMobileOpen(false)}>+ สร้างดีล</Link>
            {[
              { href: "/how-it-works", label: "วิธีใช้" },
              { href: "/fees", label: "ค่าบริการ" },
              { href: "/chat", label: "AI Chat" },
              { href: "/my-deals", label: "ดีลของฉัน" },
            ].map(link => (
              <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl" onClick={() => setMobileOpen(false)}>{link.label}</Link>
            ))}
            {!user && <>
              <Link href="/auth/login" className="block px-3 py-2 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>เข้าสู่ระบบ</Link>
              <Link href="/auth/register" className="block px-3 py-2 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>สมัครสมาชิก</Link>
            </>}
            {user && <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm text-red-500">ออกจากระบบ</button>}
          </div>
        )}
      </div>
    </nav>
  );
}
