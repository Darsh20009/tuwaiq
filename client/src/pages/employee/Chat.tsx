import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageSquare, Send, Search, User, Circle, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

function timeAgo(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return d.toLocaleDateString("ar-SA");
}

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-purple-100 text-purple-700",
  programmer: "bg-blue-100 text-blue-700",
  accountant: "bg-amber-100 text-amber-700",
  sales: "bg-pink-100 text-pink-700",
  delivery: "bg-orange-100 text-orange-700",
  employee: "bg-gray-100 text-gray-700",
};

const roleLabels: Record<string, string> = {
  admin: "مدير", manager: "مدير تنفيذي", programmer: "مبرمج",
  accountant: "محاسب", sales: "مبيعات", delivery: "توصيل", employee: "موظف",
};

export default function EmployeeChat() {
  const { user } = useAuth() as any;
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: contacts = [], isLoading: loadingContacts } = useQuery<any[]>({
    queryKey: ["/api/chat/contacts"],
    queryFn: async () => {
      const res = await fetch("/api/chat/contacts", { credentials: "include" });
      if (!res.ok) throw new Error("فشل تحميل جهات الاتصال");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<any[]>({
    queryKey: ["/api/chat/messages", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const res = await fetch(`/api/chat/messages?with=${selectedUser.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("فشل تحميل الرسائل");
      return res.json();
    },
    enabled: !!selectedUser,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (msg: string) => {
      const res = await apiRequest("POST", "/api/chat/messages", { toId: selectedUser.id, message: msg });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/contacts"] });
      setMessage("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredContacts = contacts.filter((c: any) =>
    !search ||
    c.name?.includes(search) ||
    c.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    roleLabels[c.role]?.includes(search)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  return (
    <div className="flex h-screen" dir="rtl">
      {/* Contacts sidebar */}
      <div className="w-80 border-l border-border bg-white dark:bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="flex items-center gap-2 flex-1">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-black text-lg">الشات الداخلي</h2>
          </div>
        </div>
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الدور..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-9 h-9 text-sm"
              data-testid="input-chat-search"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm">جارٍ التحميل...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{search ? "لا توجد نتائج" : "لا يوجد موظفون"}</p>
            </div>
          ) : (
            filteredContacts.map((contact: any) => (
              <button
                key={contact.id}
                onClick={() => setSelectedUser(contact)}
                data-testid={`contact-${contact.id}`}
                className={`w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/30 text-right ${
                  selectedUser?.id === contact.id ? "bg-primary/5 border-r-2 border-r-primary" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
                  {contact.name?.[0] || "؟"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{contact.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${roleColors[contact.role] || "bg-gray-100 text-gray-700"}`}>
                      {roleLabels[contact.role] || contact.role}
                    </span>
                    {contact.employeeId && (
                      <span className="text-[10px] text-muted-foreground font-mono">{contact.employeeId}</span>
                    )}
                  </div>
                </div>
                <Circle className="h-2 w-2 fill-green-500 text-green-500 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-muted/20 min-w-0">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold">اختر موظفاً للمحادثة</p>
              <p className="text-sm mt-1">التواصل السريع بين فريق طويق</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white dark:bg-card border-b border-border p-4 flex items-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                {selectedUser.name?.[0] || "؟"}
              </div>
              <div>
                <p className="font-black">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {roleLabels[selectedUser.role] || selectedUser.role}
                  {selectedUser.employeeId && ` · ${selectedUser.employeeId}`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="text-center text-muted-foreground py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                </div>
              ) : (messages as any[]).length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-sm">لا توجد رسائل بعد. ابدأ المحادثة!</p>
                </div>
              ) : (
                (messages as any[]).map((msg: any) => {
                  const isMe = msg.fromId === String(user?.id);
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-white dark:bg-card border border-border rounded-tl-sm"
                      }`}>
                        <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {timeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSend} className="bg-white dark:bg-card border-t border-border p-3 flex gap-2">
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك... (Enter للإرسال)"
                className="flex-1"
                data-testid="input-chat-message"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || sendMutation.isPending}
                data-testid="button-send-chat"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
