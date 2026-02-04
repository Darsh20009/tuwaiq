import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-primary/40" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">الصفحة غير موجودة</h1>
          <p className="text-gray-500">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <Link href="/">
             <Button className="w-full bg-gradient-brand">العودة للرئيسية</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
