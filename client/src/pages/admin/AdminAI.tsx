import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Bot, Send, Trash2, Copy, Check, Sparkles, RefreshCw,
  ChevronLeft, ChevronRight, Loader2, User, Lightbulb,
  FileText, Mail, BarChart3, Heart, Megaphone, MessageSquare,
  BookOpen, PenLine, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

const QUICK_PROMPTS = [
  {
    category: "المحتوى والحملات",
    icon: Megaphone,
    color: "#059669",
    prompts: [
      { label: "محتوى كفالة حاج", text: "اكتب منشوراً جذاباً لحملة كفالة حاج يشجع المتبرعين على المشاركة" },
      { label: "محتوى كفالة يتيم", text: "اكتب منشوراً عاطفياً ومؤثراً لحملة كفالة يتيم مع ذكر الأثر" },
      { label: "محتوى كفالة أسر أرامل", text: "اكتب وصفاً تفصيلياً لبرنامج كفالة أسر الأرامل وأثره على المجتمع" },
      { label: "محتوى تفريج كربة", text: "اكتب نصاً لحملة تفريج كربة يوضح أهمية البرنامج وطريقة التبرع" },
    ],
  },
  {
    category: "البريد والرسائل",
    icon: Mail,
    color: "#0ea5e9",
    prompts: [
      { label: "رسالة شكر للمتبرع", text: "اكتب رسالة شكر رسمية وعاطفية لمتبرع تبرع بمبلغ كبير لجمعية طويق" },
      { label: "بريد تذكير بالتبرع", text: "اكتب بريداً إلكترونياً لتذكير المتبرعين القدامى بالمشاركة في حملتنا الجديدة" },
      { label: "رسالة ترحيب بمتطوع", text: "اكتب رسالة ترحيب لمتطوع جديد انضم لجمعية طويق للخدمات الإنسانية" },
      { label: "بريد نهاية السنة", text: "اكتب بريداً إلكترونياً لملخص إنجازات جمعية طويق في نهاية العام للمتبرعين" },
    ],
  },
  {
    category: "التقارير والتحليل",
    icon: BarChart3,
    color: "#f59e0b",
    prompts: [
      { label: "تلخيص تقرير التبرعات", text: "ساعدني في تلخيص تقرير تبرعات شهري بشكل مهني واحترافي. أرسل لي البيانات وسأحللها" },
      { label: "تحليل الأداء", text: "كيف يمكنني تحليل أداء حملات التبرع وقياس مدى نجاحها؟" },
      { label: "مقارنة الفترات", text: "ما هي المعايير الأفضل لمقارنة أداء التبرعات بين الفصول الزمنية المختلفة؟" },
      { label: "توصيات تحسين", text: "قدم لي توصيات عملية لزيادة معدلات التبرع في جمعية خيرية مثل طويق" },
    ],
  },
  {
    category: "الموارد البشرية",
    icon: FileText,
    color: "#8b5cf6",
    prompts: [
      { label: "وصف وظيفي", text: "اكتب وصفاً وظيفياً احترافياً لمنصب منسق برامج خيرية في جمعية طويق" },
      { label: "إعلان توظيف", text: "اكتب إعلان توظيف جذاباً لجمعية طويق للخدمات الإنسانية" },
      { label: "تقرير حضور", text: "ساعدني في صياغة تقرير حضور شهري للموظفين بأسلوب مهني" },
      { label: "خطاب رسمي", text: "اكتب خطاباً رسمياً لموظف يخبره بقبوله في وظيفة بالجمعية" },
    ],
  },
];

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-black mt-3 mb-1">{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-2 mb-1">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-2 mb-0.5">{line.slice(4)}</h3>;
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return <div key={i} className="flex gap-2 my-0.5"><span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-current inline-block" /><span>{line.slice(2)}</span></div>;
    }
    if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)$/);
      if (match) return <div key={i} className="flex gap-2 my-0.5"><span className="font-bold shrink-0">{match[1]}.</span><span>{match[2]}</span></div>;
    }
    if (line === "") return <div key={i} className="h-2" />;
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldLine }} />;
  });
}

export default function AdminAI() {
  const { user } = useAuth() as any;
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { role: "user", content, id: Date.now().toString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    if (showPrompts && messages.length === 0) setShowPrompts(false);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply,
          id: (Date.now() + 1).toString(),
        }]);
      } else {
        toast({ title: "خطأ", description: data.message || "تعذر الاتصال", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر الاتصال بالمساعد الذكي", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "✅ تم النسخ" });
  };

  const clearChat = () => {
    setMessages([]);
    setShowPrompts(true);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">

      {/* ─── Quick Prompts Panel ──────────────────────────── */}
      <div
        className={cn(
          "border-l flex flex-col transition-all duration-300 overflow-hidden shrink-0",
          showPrompts ? "w-72" : "w-0"
        )}
        style={{ borderColor: "hsl(35 15% 88%)", backgroundColor: "hsl(35 15% 97%)" }}
      >
        <div className="p-4 border-b shrink-0" style={{ borderColor: "hsl(35 15% 88%)" }}>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: "hsl(152 42% 35%)" }} />
            <span className="font-bold text-sm" style={{ color: "hsl(210 22% 14%)" }}>قوالب سريعة</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {QUICK_PROMPTS.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                <span className="text-xs font-bold" style={{ color: "hsl(215 15% 42%)" }}>{cat.category}</span>
              </div>
              <div className="space-y-1">
                {cat.prompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { sendMessage(p.text); }}
                    disabled={isLoading}
                    className="w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition-all hover:text-white disabled:opacity-40"
                    style={{
                      backgroundColor: `${cat.color}10`,
                      color: cat.color,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = cat.color)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${cat.color}10`)}
                    data-testid={`ai-prompt-${p.label}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main Chat Area ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-5 py-3 border-b flex items-center justify-between shrink-0" style={{ borderColor: "hsl(35 15% 88%)", backgroundColor: "white" }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              data-testid="ai-toggle-prompts"
            >
              {showPrompts ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%) 0%, hsl(152 42% 40%) 100%)" }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-base" style={{ color: "hsl(210 22% 14%)" }}>المساعد الذكي — طويق AI</h1>
              <p className="text-xs" style={{ color: "hsl(215 15% 52%)" }}>مساعدك الداخلي للموظفين والإدارة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                style={{ borderColor: "hsl(35 15% 85%)", color: "hsl(215 15% 48%)" }}
                data-testid="ai-clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
                مسح المحادثة
              </button>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "hsl(152 42% 93%)", color: "hsl(152 42% 28%)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              نشط
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5" style={{ backgroundColor: "hsl(35 15% 97%)" }}>

          {/* Welcome / Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-10">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%) 0%, hsl(152 42% 42%) 100%)" }}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black" style={{ color: "hsl(210 22% 14%)" }}>مرحباً، {user?.name || "بالمساعد الذكي"}</h2>
                <p className="text-sm max-w-xs" style={{ color: "hsl(215 15% 48%)" }}>
                  أنا مساعدك الذكي الخاص بجمعية طويق. يمكنني مساعدتك في كتابة المحتوى، التقارير، والرسائل.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                {[
                  { icon: PenLine,   label: "كتابة محتوى",  prompt: "ساعدني في كتابة محتوى إبداعي لحملة خيرية" },
                  { icon: Mail,      label: "رسائل البريد", prompt: "اكتب رسالة شكر رسمية لمتبرع كريم" },
                  { icon: BarChart3, label: "تحليل البيانات", prompt: "كيف أحلل بيانات التبرعات وأستخرج منها توصيات؟" },
                  { icon: BookOpen,  label: "صياغة تقارير", prompt: "ساعدني في صياغة تقرير شهري احترافي لإدارة الجمعية" },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(s.prompt)}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 text-right text-sm font-bold transition-all hover:border-[hsl(152_42%_50%)] hover:bg-white"
                    style={{ borderColor: "hsl(35 15% 85%)", backgroundColor: "white", color: "hsl(210 22% 14%)" }}
                    data-testid={`ai-shortcut-${s.label}`}
                  >
                    <s.icon className="w-4 h-4 shrink-0" style={{ color: "hsl(152 42% 35%)" }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>

              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: msg.role === "assistant"
                    ? "linear-gradient(135deg, hsl(152 42% 28%) 0%, hsl(152 42% 42%) 100%)"
                    : "hsl(215 15% 20%)",
                }}
              >
                {msg.role === "assistant"
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={cn("max-w-[75%] group", msg.role === "user" ? "items-end" : "items-start")} style={{ display: "flex", flexDirection: "column" }}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === "user"
                    ? { backgroundColor: "hsl(152 42% 28%)", color: "white", borderBottomLeftRadius: "4px" }
                    : { backgroundColor: "white", border: "1px solid hsl(35 15% 88%)", color: "hsl(210 22% 14%)", borderBottomRightRadius: "4px" }
                  }
                >
                  {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                </div>

                {/* Copy button for assistant */}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "hsl(215 15% 52%)" }}
                    data-testid={`ai-copy-${msg.id}`}
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === msg.id ? "تم النسخ" : "نسخ"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%) 0%, hsl(152 42% 42%) 100%)" }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border" style={{ borderColor: "hsl(35 15% 88%)" }}>
                <div className="flex items-center gap-2" style={{ color: "hsl(215 15% 48%)" }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جارٍ التفكير…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: "hsl(35 15% 88%)", backgroundColor: "white" }}>
          <div
            className="flex items-end gap-3 rounded-2xl border-2 px-4 py-3 transition-all focus-within:border-[hsl(152_42%_40%)]"
            style={{ borderColor: "hsl(35 15% 84%)" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="اكتب رسالتك هنا… (Enter للإرسال، Shift+Enter لسطر جديد)"
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
              style={{ color: "hsl(210 22% 14%)", minHeight: "44px", maxHeight: "160px" }}
              data-testid="ai-input"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ backgroundColor: input.trim() && !isLoading ? "hsl(152 42% 28%)" : "hsl(35 15% 88%)" }}
              data-testid="ai-send"
            >
              {isLoading
                ? <RefreshCw className="w-4 h-4 animate-spin text-white" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: "hsl(215 15% 60%)" }}>
            المساعد الذكي مخصص للموظفين والإدارة فقط — الردود مولّدة بالذكاء الاصطناعي وقد تحتاج مراجعة
          </p>
        </div>
      </div>
    </div>
  );
}
