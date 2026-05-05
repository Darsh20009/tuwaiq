import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  previewHeight?: string;
  testId?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "صورة",
  className = "",
  previewHeight = "h-40",
  testId = "image-upload",
}: ImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "خطأ", description: "الملف المختار ليس صورة", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة أكبر من 10 ميجابايت", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) throw new Error("فشل");
      const data = await res.json();
      onChange(data.url);
      toast({ title: "✓ تم رفع الصورة بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "فشل رفع الصورة، حاول مجدداً", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file: File | undefined) => { if (file) upload(file); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          {label}
        </p>
      )}

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-border group max-w-sm">
          <img
            src={value}
            alt="معاينة"
            className={`w-full ${previewHeight} object-cover`}
            onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="gap-1.5 text-xs"
              data-testid={`${testId}-change`}
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {uploading ? "جاري الرفع..." : "تغيير"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onChange("")}
              className="gap-1.5 text-xs"
              data-testid={`${testId}-remove`}
            >
              <X className="w-3 h-3" />
              حذف
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all max-w-sm
            ${dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5"}
          `}
          data-testid={`${testId}-zone`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري رفع الصورة...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">انقر أو اسحب الصورة هنا</p>
                <p className="text-xs mt-0.5">PNG، JPG، WEBP — حتى 10 ميجابايت</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid={`${testId}-input`}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
      />
    </div>
  );
}
