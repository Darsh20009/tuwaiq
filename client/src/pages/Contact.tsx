import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { SiFacebook, SiInstagram, SiX, SiYoutube, SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const contactSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(10, "رقم الجوال غير صحيح"),
  subject: z.string().min(3, "الموضوع مطلوب"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (data: ContactForm) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال رسالتك",
        description: "سنتواصل معك في أقرب وقت ممكن",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    sendMessage.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading">تواصل معنا</h1>
            <p className="mt-4 text-lg opacity-90">نحن هنا للإجابة على استفساراتكم</p>
          </div>
        </div>

        {/* Contact Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">معلومات التواصل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">البريد الإلكتروني</p>
                      <a href="mailto:tuwaikassociation@gmail.com" className="text-muted-foreground hover:text-primary transition-colors" dir="ltr">
                        tuwaikassociation@gmail.com
                      </a>
                      <br />
                      <a href="mailto:TuwaikAssociation@hotmail.com" className="text-muted-foreground hover:text-primary transition-colors" dir="ltr">
                        TuwaikAssociation@hotmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">رقم الجوال</p>
                      <a href="tel:+966505793012" className="text-muted-foreground hover:text-primary transition-colors" dir="ltr">
                        +966 50 579 3012
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">العنوان</p>
                      <p className="text-muted-foreground">
                        المملكة العربية السعودية
                        <br />
                        منطقة الرياض
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">أوقات العمل</p>
                      <p className="text-muted-foreground">
                        الأحد - الخميس: 8:00 ص - 4:00 م
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">تابعنا على</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <a href="https://facebook.com" target="_blank" className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity" data-testid="social-facebook">
                      <SiFacebook className="w-6 h-6" />
                    </a>
                    <a href="https://instagram.com" target="_blank" className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity" data-testid="social-instagram">
                      <SiInstagram className="w-6 h-6" />
                    </a>
                    <a href="https://x.com" target="_blank" className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity" data-testid="social-twitter">
                      <SiX className="w-6 h-6" />
                    </a>
                    <a href="https://youtube.com" target="_blank" className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity" data-testid="social-youtube">
                      <SiYoutube className="w-6 h-6" />
                    </a>
                    <a href="https://wa.me/966505793012" target="_blank" className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity" data-testid="social-whatsapp">
                      <SiWhatsapp className="w-6 h-6" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">أرسل رسالة</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل اسمك" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="example@email.com" dir="ltr" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الجوال</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="05xxxxxxxx" dir="ltr" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموضوع</FormLabel>
                          <FormControl>
                            <Input placeholder="موضوع الرسالة" {...field} data-testid="input-subject" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرسالة</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="اكتب رسالتك هنا..." 
                              className="min-h-[150px] resize-none"
                              {...field} 
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-brand" 
                      disabled={sendMessage.isPending}
                      data-testid="button-send"
                    >
                      {sendMessage.isPending ? (
                        "جاري الإرسال..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 ml-2" />
                          إرسال الرسالة
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
