import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Save, Globe, CheckCircle2,
  Home, Info, Target, Users, FileText, Star,
  Newspaper, Heart, BookOpen, ShieldCheck,
  LayoutGrid, Image, Video, Link,
  AlignLeft, Type, ExternalLink, Sparkles,
  Upload, X, Phone, HandHeart, Layers,
  Briefcase, CreditCard, PenSquare, Globe2,
  Baby, AlertCircle, ClipboardList,
  ThumbsUp, Scale, UserCheck, Eye, Building2,
  UserPlus, Megaphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type PageDef = {
  slug: string;
  label: string;
  icon: React.ElementType;
  path: string;
  desc: string;
  color: string;
  group: string;
};

const PAGES: PageDef[] = [
  // ── الرئيسية ──────────────────────────────────────────────────
  { slug: "home-hero",       label: "الصفحة الرئيسية",          icon: Home,          path: "/",                desc: "البانر الرئيسي وعنوان الموقع",          color: "blue",    group: "الرئيسية" },

  // ── الخدمات ───────────────────────────────────────────────────
  { slug: "services",        label: "جميع الخدمات",             icon: Layers,        path: "/services",        desc: "صفحة الخدمات الرئيسية",                 color: "violet",  group: "الخدمات" },
  { slug: "service-hajj",    label: "كفالة حاج",                icon: Globe2,        path: "/services/hajj",     desc: "خدمة كفالة الحاج وتفاصيلها",           color: "emerald", group: "الخدمات" },
  { slug: "service-families",label: "كفالة أسر أرامل",          icon: Home,          path: "/services/families", desc: "خدمة كفالة الأسر وتفاصيلها",           color: "sky",     group: "الخدمات" },
  { slug: "service-orphan",  label: "كفالة يتيم",               icon: Baby,          path: "/services/orphan",   desc: "خدمة كفالة اليتيم وتفاصيلها",          color: "amber",   group: "الخدمات" },
  { slug: "service-relief",  label: "تفريج كربة",               icon: HandHeart,     path: "/services/relief",   desc: "خدمة تفريج الكربة وتفاصيلها",          color: "violet",  group: "الخدمات" },

  // ── عن الجمعية ────────────────────────────────────────────────
  { slug: "about",           label: "نشأة الجمعية",             icon: Info,          path: "/about",           desc: "تاريخ ونشأة الجمعية",                   color: "emerald", group: "عن الجمعية" },
  { slug: "vision",          label: "الرؤية والرسالة",          icon: Target,        path: "/vision",          desc: "رؤية ورسالة وقيم الجمعية",              color: "purple",  group: "عن الجمعية" },
  { slug: "goals",           label: "أهداف الجمعية",            icon: Star,          path: "/goals",           desc: "الأهداف الاستراتيجية",                  color: "amber",   group: "عن الجمعية" },
  { slug: "founders",        label: "مؤسسو الجمعية",            icon: Star,          path: "/founders",        desc: "المؤسسون الحاليون",                      color: "orange",  group: "عن الجمعية" },
  { slug: "founders-legacy", label: "المؤسسون التاريخيون",      icon: BookOpen,      path: "/founders",        desc: "مؤسسو الجمعية التاريخيون",              color: "stone",   group: "عن الجمعية" },
  { slug: "board",           label: "أعضاء مجلس الإدارة",       icon: Users,         path: "/board",           desc: "مجلس الإدارة الحالي",                   color: "rose",    group: "عن الجمعية" },
  { slug: "assembly",        label: "أعضاء الجمعية العمومية",   icon: Users,         path: "/assembly",        desc: "الجمعية العمومية",                       color: "cyan",    group: "عن الجمعية" },
  { slug: "programs",        label: "برامج الجمعية",            icon: Layers,        path: "/programs",        desc: "البرامج والمبادرات",                     color: "violet",  group: "عن الجمعية" },
  { slug: "newsletters",     label: "نشرات الجمعية",            icon: Newspaper,     path: "/newsletters",     desc: "النشرات الإخبارية الدورية",             color: "sky",     group: "عن الجمعية" },

  // ── خدماتنا (للمستفيدين) ──────────────────────────────────────
  { slug: "beneficiaries",   label: "خدمات المستفيدين",         icon: HandHeart,     path: "/beneficiaries",   desc: "الخدمات المقدمة للمستفيدين",            color: "lime",    group: "خدماتنا" },
  { slug: "jobs",            label: "إعلانات الوظائف",          icon: Briefcase,     path: "/jobs",            desc: "الوظائف والفرص الوظيفية",               color: "blue",    group: "خدماتنا" },
  { slug: "apply-job",       label: "التقدم للتوظيف",           icon: UserPlus,      path: "/apply-job",       desc: "صفحة التقدم للوظائف",                   color: "indigo",  group: "خدماتنا" },
  { slug: "volunteer",       label: "تطوع الآن",                icon: Heart,         path: "/volunteer",       desc: "صفحة التطوع والانضمام",                 color: "pink",    group: "خدماتنا" },

  // ── الحوكمة ───────────────────────────────────────────────────
  { slug: "bylaws",          label: "اللائحة الأساسية",         icon: FileText,      path: "/bylaws",          desc: "اللائحة والأنظمة التأسيسية",            color: "indigo",  group: "الحوكمة" },
  { slug: "financials",      label: "القوائم المالية",           icon: ShieldCheck,   path: "/financials",      desc: "التقارير المالية والميزانيات",           color: "teal",    group: "الحوكمة" },
  { slug: "policies",        label: "السياسات واللوائح",        icon: ClipboardList, path: "/policies",        desc: "السياسات والأنظمة الداخلية",            color: "gray",    group: "الحوكمة" },
  { slug: "committees",      label: "اللجان",                   icon: Users,         path: "/committees",      desc: "لجان الجمعية ومهامها",                  color: "rose",    group: "الحوكمة" },
  { slug: "satisfaction",    label: "قياس رضاء أصحاب العلاقة", icon: ThumbsUp,      path: "/satisfaction",    desc: "نتائج قياس رضا أصحاب المصلحة",         color: "green",   group: "الحوكمة" },
  { slug: "ethics",          label: "الميثاق الأخلاقي",        icon: Scale,         path: "/ethics",          desc: "ميثاق وقواعد السلوك الأخلاقي",         color: "purple",  group: "الحوكمة" },
  { slug: "executive",       label: "المسؤول التنفيذي",         icon: UserCheck,     path: "/executive",       desc: "نبذة عن المسؤول التنفيذي",             color: "amber",   group: "الحوكمة" },
  { slug: "disclosure",      label: "الإفصاح",                  icon: Eye,           path: "/disclosure",      desc: "الإفصاح والشفافية",                     color: "cyan",    group: "الحوكمة" },

  // ── تواصل ومعلومات ────────────────────────────────────────────
  { slug: "news",            label: "الأخبار",                  icon: Megaphone,     path: "/news",            desc: "آخر أخبار الجمعية",                     color: "blue",    group: "تواصل ومعلومات" },
  { slug: "blog",            label: "المدونة",                  icon: PenSquare,     path: "/blog",            desc: "مقالات وتدوينات الجمعية",               color: "emerald", group: "تواصل ومعلومات" },
  { slug: "bank-accounts",   label: "الحسابات البنكية",         icon: Building2,     path: "/bank-accounts",   desc: "أرقام حسابات التبرع البنكية",           color: "teal",    group: "تواصل ومعلومات" },
  { slug: "bank-transfer",   label: "التحويل البنكي",           icon: CreditCard,    path: "/bank-transfer",   desc: "صفحة رفع إيصالات التحويل",             color: "orange",  group: "تواصل ومعلومات" },
  { slug: "bank-transfers-list", label: "سجل التحويلات",         icon: ClipboardList, path: "/admin/transfers",  desc: "إدارة إيصالات التحويل البنكي",         color: "blue",    group: "التحويلات" },
  { slug: "contact",         label: "تواصل معنا",               icon: Phone,         path: "/contact",         desc: "معلومات الاتصال والتواصل",              color: "green",   group: "تواصل ومعلومات" },
  { slug: "privacy-policy", label: "سياسة الخصوصية",           icon: ShieldCheck,   path: "/privacy-policy",  desc: "سياسة خصوصية البيانات",                 color: "blue",    group: "تواصل ومعلومات" },
];

const PAGE_GROUPS = Array.from(new Set(PAGES.map((p) => p.group)));

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ direction: "rtl" }],
    ["link", "image"],
    ["clean"],
  ],
};

const emptyForm = {
  title: "",
  titleEn: "",
  content: "",
  contentEn: "",
  imageUrl: "",
  images: [] as string[],
  videoUrl: "",
  metaDescription: "",
  metaDescriptionEn: "",
};

export default function AdminPages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMore, setUploadingMore] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const moreImagesRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: contents } = useQuery<any[]>({
    queryKey: ["/api/admin/content"],
  });

  const selectedPage = PAGES.find((p) => p.slug === selectedSlug);
  const dbContent = Array.isArray(contents) ? contents.find((c) => c.slug === selectedSlug) : null;

  useEffect(() => {
    if (selectedSlug === "bank-accounts") {
      // Special handling for bank accounts to show JSON in the editor
      const fetchAccounts = async () => {
        const res = await fetch("/api/bank-accounts");
        const data = await res.json();
        setForm(prev => ({ ...prev, content: JSON.stringify(data, null, 2) }));
      };
      fetchAccounts();
    } else if (selectedSlug === "bank-transfer") {
      // Special handling for bank transfer page (uses standard content API)
      setForm(emptyForm);
    } else if (dbContent) {
      setForm({
        title: dbContent.title || "",
        titleEn: dbContent.titleEn || "",
        content: dbContent.content || "",
        contentEn: dbContent.contentEn || "",
        imageUrl: dbContent.imageUrl || "",
        images: Array.isArray(dbContent.images) ? dbContent.images : [],
        videoUrl: dbContent.videoUrl || "",
        metaDescription: dbContent.metaDescription || "",
        metaDescriptionEn: dbContent.metaDescriptionEn || "",
      });
    } else if (selectedSlug) {
      setForm(emptyForm);
    }
    setSaved(false);
  }, [selectedSlug, dbContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (selectedSlug === "bank-accounts") {
        // Handle bank accounts specially since they are an array
        let accounts;
        try {
          accounts = JSON.parse(form.content);
          if (!Array.isArray(accounts)) throw new Error();
        } catch {
          throw new Error("يجب أن يكون المحتوى عبارة عن مصفوفة JSON صالحة للحسابات البنكية");
        }
        await apiRequest("PUT", "/api/admin/bank-accounts", accounts);
      } else if (selectedSlug === "bank-transfer") {
        // Bank transfer uses standard content API
        await apiRequest("PUT", `/api/admin/content/${selectedSlug}`, form);
      } else {
        await apiRequest("PUT", `/api/admin/content/${selectedSlug}`, form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content", selectedSlug] });
      toast({ title: "✓ تم الحفظ بنجاح", description: `تم تحديث محتوى صفحة "${selectedPage?.label}"` });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: any) => {
      toast({ title: "خطأ في الحفظ", description: err?.message || "حدث خطأ أثناء الحفظ", variant: "destructive" });
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/seed-content", {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "✅ تم ملء البيانات الافتراضية بنجاح", description: data.message });
    },
    onError: () => {
      toast({ title: "خطأ", description: "تعذّر ملء البيانات الافتراضية", variant: "destructive" });
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
    if (!res.ok) throw new Error("فشل رفع الصورة");
    const data = await res.json();
    return data.url as string;
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast({ title: "✓ تم رفع الصورة", description: "تم رفع الصورة الرئيسية بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "تعذّر رفع الصورة، حاول مجدداً", variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file);
      setForm((prev) => ({ ...prev, videoUrl: url }));
      toast({ title: "✓ تم رفع الفيديو", description: "تم رفع الفيديو بنجاح وسيظهر في بانر الصفحة" });
    } catch {
      toast({ title: "خطأ", description: "تعذّر رفع الفيديو، حاول مجدداً", variant: "destructive" });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleMoreImages = async (files: FileList) => {
    setUploadingMore(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        urls.push(url);
      }
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
      toast({ title: `✓ تم رفع ${urls.length} صورة`, description: "تم رفع الصور الإضافية بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "تعذّر رفع إحدى الصور، حاول مجدداً", variant: "destructive" });
    } finally {
      setUploadingMore(false);
      if (moreImagesRef.current) moreImagesRef.current.value = "";
    }
  };

  const hasContent = (slug: string) => {
    return Array.isArray(contents) && contents.some((c) => c.slug === slug && (c.title || c.content));
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-black">محرر الصفحات</h1>
              <p className="text-xs text-muted-foreground">{PAGES.length} صفحة قابلة للتعديل</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="gap-2 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          {seedMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          ملء البيانات الافتراضية
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-l border-border/50 overflow-y-auto bg-muted/10 shrink-0">
          <div className="p-3 space-y-4">
            {PAGE_GROUPS.map((group) => {
              const groupPages = PAGES.filter((p) => p.group === group);
              return (
                <div key={group}>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {groupPages.map((page) => {
                      const Icon = page.icon;
                      const hasData = hasContent(page.slug);
                      const isSelected = selectedSlug === page.slug;
                      return (
                        <button
                          key={page.slug}
                          onClick={() => setSelectedSlug(page.slug)}
                          data-testid={`page-btn-${page.slug}`}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary-foreground" : `text-${page.color}-500`}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{page.label}</p>
                          </div>
                          {hasData && !isSelected && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          {!selectedSlug ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <LayoutGrid className="h-10 w-10 text-primary/40" />
              </div>
              <h2 className="text-xl font-black mb-2">اختر صفحة للتعديل</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                اختر أي صفحة من القائمة على اليمين لتعديل محتواها بسهولة تامة
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-lg">
                {PAGES.slice(0, 6).map((page) => (
                  <button
                    key={page.slug}
                    onClick={() => setSelectedSlug(page.slug)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <page.icon className={`h-5 w-5 text-${page.color}-500`} />
                    <span className="text-xs font-bold">{page.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {selectedPage && (
                    <div className={`w-10 h-10 rounded-xl bg-${selectedPage.color}-50 flex items-center justify-center`}>
                      <selectedPage.icon className={`h-5 w-5 text-${selectedPage.color}-600`} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-black">{selectedPage?.label}</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      {selectedPage?.path}
                      <a
                        href={selectedPage?.path}
                        target="_blank"
                        className="text-primary hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink className="h-3 w-3" />
                        معاينة
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {saved && (
                    <Badge className="gap-1 bg-emerald-500">
                      <CheckCircle2 className="h-3 w-3" />
                      تم الحفظ
                    </Badge>
                  )}
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    data-testid="button-save"
                    className="gap-2"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    حفظ التغييرات
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      العنوان
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">العنوان بالعربية</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="أدخل العنوان بالعربية"
                        className="font-medium"
                        data-testid="input-title-ar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">العنوان بالإنجليزية</Label>
                      <Input
                        value={form.titleEn}
                        onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                        placeholder="Enter title in English"
                        dir="ltr"
                        className="font-medium"
                        data-testid="input-title-en"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-primary" />
                      المحتوى النصي
                    </CardTitle>
                    <CardDescription>اكتب المحتوى الكامل للصفحة هنا</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="ar">
                      <TabsList className="mb-4">
                        <TabsTrigger value="ar">🇸🇦 عربي</TabsTrigger>
                        <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                      </TabsList>
                    <TabsContent value="ar">
                      {selectedSlug === "bank-accounts" ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs font-bold">أدخل الحسابات بتنسيق JSON (مصفوفة) لضمان ظهورها بشكل صحيح في صفحة الحسابات</span>
                          </div>
                          <Textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            className="font-mono text-sm min-h-[400px] text-left"
                            dir="ltr"
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg overflow-hidden border min-h-[400px] bg-white text-black">
                          <ReactQuill
                            theme="snow"
                            value={form.content}
                            onChange={(val) => setForm({ ...form, content: val })}
                            modules={quillModules}
                            className="h-[350px]"
                          />
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="en">
                      <div className="rounded-lg overflow-hidden border min-h-[400px] bg-white text-black" dir="ltr">
                        <ReactQuill
                          theme="snow"
                          value={form.contentEn}
                          onChange={(val) => setForm({ ...form, contentEn: val })}
                          modules={quillModules}
                          className="h-[350px]"
                        />
                      </div>
                    </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Media */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      الوسائط
                    </CardTitle>
                    <CardDescription>أضف صورة رئيسية أو صور إضافية أو فيديو للصفحة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main Image */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        الصورة الرئيسية
                      </Label>

                      {form.imageUrl ? (
                        <div className="relative rounded-lg overflow-hidden border max-w-sm group">
                          <img
                            src={form.imageUrl}
                            alt="معاينة الصورة"
                            className="w-full h-44 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => imageInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="gap-1.5 text-xs"
                            >
                              {uploadingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              تغيير الصورة
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setForm({ ...form, imageUrl: "" })}
                              className="gap-1.5 text-xs"
                            >
                              <X className="h-3 w-3" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => imageInputRef.current?.click()}
                          className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer hover:bg-primary/5 transition-all max-w-sm"
                          data-testid="upload-image-zone"
                        >
                          {uploadingImage ? (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <p className="text-sm">جاري الرفع...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Upload className="h-8 w-8 text-primary/40" />
                              <p className="text-sm font-medium">انقر لرفع الصورة الرئيسية</p>
                              <p className="text-xs">PNG، JPG، WEBP</p>
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        data-testid="input-image-file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                          e.target.value = "";
                        }}
                      />
                    </div>

                    {/* Additional Images */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          صور إضافية ({(form.images || []).length})
                        </Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moreImagesRef.current?.click()}
                          disabled={uploadingMore}
                          className="gap-1.5 text-xs h-7"
                        >
                          {uploadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                          إضافة صور
                        </Button>
                        <input
                          ref={moreImagesRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleMoreImages(e.target.files);
                            }
                          }}
                        />
                      </div>
                      {(form.images || []).length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {(form.images || []).map((url, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-square">
                              <img
                                src={url}
                                alt={`صورة ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                              />
                              <button
                                onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        فيديو البانر (اختياري)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={form.videoUrl}
                          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                          placeholder="رابط الفيديو أو ارفع ملفاً..."
                          dir="ltr"
                          data-testid="input-video-url"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={uploadingVideo}
                          className="shrink-0 gap-1.5"
                        >
                          {uploadingVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          رفع
                        </Button>
                        {form.videoUrl && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => setForm({ ...form, videoUrl: "" })}
                            className="shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      {form.videoUrl && form.videoUrl.startsWith("/") && (
                        <p className="text-xs text-green-600">✓ فيديو مرفوع — سيظهر في بانر الصفحة</p>
                      )}
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/mov,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      وصف محركات البحث (SEO)
                    </CardTitle>
                    <CardDescription>يساعد في ظهور الصفحة في نتائج البحث</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">الوصف بالعربية</Label>
                      <textarea
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                        placeholder="وصف مختصر للصفحة..."
                        className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        maxLength={160}
                        data-testid="input-meta-desc-ar"
                      />
                      <p className="text-[10px] text-muted-foreground">{form.metaDescription.length}/160 حرف</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">الوصف بالإنجليزية</Label>
                      <textarea
                        value={form.metaDescriptionEn}
                        onChange={(e) => setForm({ ...form, metaDescriptionEn: e.target.value })}
                        placeholder="Brief description..."
                        dir="ltr"
                        className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        maxLength={160}
                        data-testid="input-meta-desc-en"
                      />
                      <p className="text-[10px] text-muted-foreground">{form.metaDescriptionEn.length}/160 characters</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pb-8">
                  <Button
                    size="lg"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="gap-2 px-8"
                    data-testid="button-save-bottom"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    حفظ التغييرات
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
