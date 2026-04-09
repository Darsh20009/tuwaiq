import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Megaphone, Image, TrendingUp, Users, ExternalLink, Palette, BarChart3, FileImage } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const tools = [
  {
    title: "منشئ البوسترات",
    description: "إنشاء بوسترات احترافية بهوية طويق البصرية",
    icon: FileImage,
    color: "bg-pink-100 text-pink-700",
    border: "border-pink-200",
    link: "/employee/posters",
    badge: "مدمج في النظام",
  },
  {
    title: "Canva طويق",
    description: "تصميم جميع المواد الإعلانية والحملات التسويقية",
    icon: Palette,
    color: "bg-purple-100 text-purple-700",
    border: "border-purple-200",
    link: "https://www.canva.com",
    external: true,
    badge: "Canva",
  },
  {
    title: "إدارة المحتوى",
    description: "تحديث محتوى الموقع والأخبار",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
    link: "/employee/content",
    badge: "المحتوى",
  },
];

const campaigns = [
  { title: "حملة رمضان 1446", status: "نشطة", type: "سلة رمضانية", color: "bg-green-100 text-green-700" },
  { title: "مشروع سقيا الماء", status: "جارية", type: "مياه", color: "bg-blue-100 text-blue-700" },
  { title: "إفطار الصائمين", status: "مخططة", type: "إطعام", color: "bg-amber-100 text-amber-700" },
];

export default function SalesDashboard() {
  const { user } = useAuth() as any;
  const [, setLocation] = useLocation();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <Megaphone className="h-6 w-6 text-pink-600" />
        <div>
          <h1 className="text-xl font-black">لوحة المبيعات والتسويق</h1>
          <p className="text-xs text-muted-foreground">إدارة الحملات والمواد التسويقية لجمعية طويق</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-1">مرحباً {user?.name}</h2>
          <p className="text-white/80 text-sm">مسؤول المبيعات والتسويق — جمعية طويق</p>
          <p className="text-white/60 text-xs mt-1 font-mono">{user?.employeeId}</p>
        </div>
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -left-2 bottom-2 w-16 h-16 bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className={`border ${tool.border} hover:shadow-md transition-shadow cursor-pointer group`}>
              <CardContent className="p-5">
                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-black text-sm">{tool.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tool.color}`}>{tool.badge}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{tool.description}</p>
                {tool.external ? (
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs" asChild>
                    <a href={tool.link} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3" /> فتح
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setLocation(tool.link)}>
                    فتح الأداة
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-pink-500" />
            الحملات التسويقية النشطة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {campaigns.map(c => (
              <div key={c.title} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center`}>
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.type}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${c.color}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0">
          <CardContent className="p-5">
            <Users className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-3xl font-black">2.4K</p>
            <p className="text-white/80 text-xs mt-1">متابع على منصات التواصل</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
          <CardContent className="p-5">
            <Image className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-3xl font-black">48</p>
            <p className="text-white/80 text-xs mt-1">بوستر منشور هذا الشهر</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
