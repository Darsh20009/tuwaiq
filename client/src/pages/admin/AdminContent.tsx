import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ArrowRight, Settings, Globe, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImageUpload } from "@/components/ImageUpload";

export default function AdminContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    titleEn: "",
    content: "",
    contentEn: "",
    imageUrl: "",
    videoUrl: "",
    metaDescription: "",
    metaDescriptionEn: ""
  });

  const { data: contents = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/content'],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/content", { credentials: "include" });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
      } catch { return []; }
    },
  });

  useEffect(() => {
    if (selectedSlug && contents) {
      const item = contents.find(c => c.slug === selectedSlug);
      if (item) {
        setFormData({
          title: item.title || "",
          titleEn: item.titleEn || "",
          content: item.content || "",
          contentEn: item.contentEn || "",
          imageUrl: item.imageUrl || "",
          videoUrl: item.videoUrl || "",
          metaDescription: item.metaDescription || "",
          metaDescriptionEn: item.metaDescriptionEn || ""
        });
      }
    }
  }, [selectedSlug, contents]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/admin/content/${selectedSlug}`, data);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث المحتوى بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    }
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'direction': 'rtl' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <Button variant="ghost" size="icon" asChild>
          <a href="/admin"><ArrowRight className="h-4 w-4" /></a>
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">إدارة محتوى الصفحات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">قائمة الصفحات</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {contents?.map(item => (
              <Button
                key={item.id}
                variant={selectedSlug === item.slug ? "default" : "ghost"}
                className="w-full justify-start text-right"
                onClick={() => setSelectedSlug(item.slug)}
              >
                <FileText className="ml-2 h-4 w-4" />
                {item.title || item.slug}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          {selectedSlug ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                <div>
                  <CardTitle>تعديل: {formData.title || selectedSlug}</CardTitle>
                  <CardDescription>قم بتعديل المحتوى والترجمة بالأسفل</CardDescription>
                </div>
                <Button onClick={() => updateMutation.mutate(formData)} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                  حفظ التغييرات
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      العنوان (عربي)
                    </Label>
                    <Input 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      العنوان (English)
                    </Label>
                    <Input 
                      value={formData.titleEn} 
                      onChange={e => setFormData({...formData, titleEn: e.target.value})} 
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>المحتوى (عربي)</Label>
                  <div className="bg-white text-black">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.content} 
                      onChange={val => setFormData({...formData, content: val})}
                      modules={quillModules}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>المحتوى (English)</Label>
                  <div className="bg-white text-black" dir="ltr">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.contentEn} 
                      onChange={val => setFormData({...formData, contentEn: val})}
                      modules={quillModules}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={url => setFormData({...formData, imageUrl: url})}
                      label="صورة الصفحة"
                      testId="content-image"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>رابط الفيديو (اختياري)</Label>
                    <Input 
                      value={formData.videoUrl} 
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>يرجى اختيار صفحة لتعديل محتواها</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
