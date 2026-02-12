import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Send } from "lucide-react";

export default function AdminEmails() {
  const { toast } = useToast();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; message: string }) => {
      const res = await apiRequest("POST", "/api/admin/send-email", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الإرسال",
        description: "تم إرسال البريد الإلكتروني بنجاح",
      });
      setTo("");
      setSubject("");
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء محاولة إرسال البريد",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !message) {
      toast({
        title: "تنبيه",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    sendMutation.mutate({ to, subject, message });
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold">إدارة المراسلات البريدية</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إرسال بريد إلكتروني مخصص</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">البريد الإلكتروني للمستلم</Label>
              <Input
                id="to"
                type="email"
                placeholder="example@domain.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع</Label>
              <Input
                id="subject"
                placeholder="موضوع الرسالة"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">نص الرسالة</Label>
              <Textarea
                id="message"
                placeholder="اكتب رسالتك هنا..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال الآن
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
