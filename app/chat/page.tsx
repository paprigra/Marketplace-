"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageCircle, Bot, User, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const QUICK_QUESTIONS = [
  "ระบบเก็บเงินกลางคืออะไร?",
  "ออเดอร์ของฉันอยู่ที่ไหน?",
  "วิธีชำระเงิน?",
  "ขั้นตอนการซื้อสินค้า",
  "จะขอคืนเงินได้อย่างไร?",
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push("/auth/login"); return; }
        return fetch("/api/chat").then((r) => r.json());
      })
      .then((d) => {
        if (d?.messages) setMessages(d.messages);
      })
      .finally(() => setHistoryLoading(false));
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.reply) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 mb-4 flex items-center gap-3 text-white">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">มาร์เก็ต AI</h1>
          <div className="flex items-center gap-1 text-orange-100 text-sm">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            ออนไลน์ตลอด 24 ชั่วโมง
          </div>
        </div>
        <Sparkles className="ml-auto w-5 h-5 text-yellow-300" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-orange-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">สวัสดีครับ! มีอะไรให้ช่วยไหม?</p>
                <p className="text-sm text-gray-400 mt-1">ถามได้เลย เรื่องออเดอร์ การชำระเงิน หรืออื่นๆ</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">
                    {formatDate(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && !historyLoading && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="พิมพ์คำถาม..."
          disabled={loading}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm disabled:bg-gray-50"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
