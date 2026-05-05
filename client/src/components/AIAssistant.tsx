import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_QUESTIONS = [
  "ما هي برامج الجمعية؟",
  "كيف أحسب زكاتي؟",
  "ما فضل إطعام الصائمين؟",
  "كيف أتبرع؟",
];

export function AIAssistant() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isHidden =
    location.startsWith("/admin") ||
    location.startsWith("/delivery");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (isHidden) return null;

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: messages }),
      });
      const data = await res.json();
      setMessages([...history, { role: "assistant", content: data.reply || data.error || "تعذّر الرد." }]);
    } catch {
      setMessages([...history, { role: "assistant", content: "تعذّر الاتصال بالمساعد. حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 z-50 flex flex-col items-start" dir="rtl">
      {/* Chat panel */}
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "460px" }}>
          {/* Header */}
          <div className="bg-gradient-to-l from-indigo-600 to-indigo-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none">مساعد طويق الذكي</p>
                <p className="text-white/70 text-[10px]">متصل الآن</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
            {messages.length === 0 ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="bg-indigo-50 rounded-xl rounded-tr-none px-3 py-2 text-sm text-indigo-900 max-w-[85%]">
                    أهلاً! أنا مساعد جمعية طويق الذكي. يمكنني مساعدتك في التبرع، الزكاة، والإجابة عن الأسئلة الإسلامية.
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pr-9">
                  {STARTER_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-white border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 hover:bg-indigo-50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm max-w-[82%] leading-relaxed",
                      m.role === "assistant"
                        ? "bg-indigo-50 text-indigo-900 rounded-tr-none"
                        : "bg-indigo-600 text-white rounded-tl-none"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                </div>
                <div className="bg-indigo-50 rounded-xl rounded-tr-none px-3 py-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-2 flex gap-2 bg-white">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="اكتب سؤالك..."
              className="resize-none text-sm h-9 min-h-[36px] py-2 rounded-xl border-indigo-200 focus:border-indigo-400"
              rows={1}
              data-testid="input-ai-message"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-9 w-9 p-0 shrink-0"
              data-testid="button-ai-send"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        data-testid="button-ai-assistant"
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 relative"
        style={{ background: open ? "#4338ca" : "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}
