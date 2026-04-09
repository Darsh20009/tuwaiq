import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  accept?: string;
  label?: string;
  className?: string;
}

export function FileUpload({ 
  onUpload, 
  currentUrl, 
  accept = "image/*,video/*,.pdf,.doc,.docx", 
  label = "رفع ملف",
  className = ""
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 10 ميغابايت",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("فشل رفع الملف");
      }

      const data = await res.json();
      setPreview(data.url);
      onUpload(data.url);
      
      toast({
        title: "تم الرفع",
        description: "تم رفع الملف بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل رفع الملف، حاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setPreview(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = preview?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || preview?.startsWith("data:image");
  const isVideo = preview?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          {isImage && (
            <div className="relative rounded-xl overflow-hidden border bg-gray-50">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-40 object-cover"
              />
              <button
                onClick={clearFile}
                className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {isVideo && (
            <div className="relative rounded-xl overflow-hidden border bg-gray-50">
              <video 
                src={preview} 
                className="w-full h-40 object-cover"
                controls
              />
              <button
                onClick={clearFile}
                className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isImage && !isVideo && (
            <div className="flex items-center gap-3 p-4 border rounded-xl bg-gray-50">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{preview.split('/').pop()}</p>
                <p className="text-xs text-muted-foreground">تم الرفع</p>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-all text-center cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">جاري الرفع...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">اسحب الملف أو اضغط للاختيار</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
