import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// This page simulates the return from payment gateway
export default function GeideaCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Simulate API verification delay
    const timer = setTimeout(() => {
      // In a real app, we would verify the query params sent by Geidea here via an API call
      // const urlParams = new URLSearchParams(window.location.search);
      // verifyTransaction(urlParams.get('token'));
      setStatus("success");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
        
        {status === "loading" && (
          <>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold font-heading">جاري التحقق من الدفع...</h2>
            <p className="text-muted-foreground">الرجاء الانتظار، لا تغلق الصفحة.</p>
          </>
        )}

        {status === "success" && (
          <>
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-green-700">تم التبرع بنجاح!</h2>
            <p className="text-muted-foreground">شكراً لعطائك. جزاك الله خيراً وجعلها في ميزان حسناتك.</p>
            <div className="pt-4 space-y-3">
              <Link href="/leaderboard">
                <Button className="w-full bg-gradient-brand">قائمة الشرف</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">العودة للرئيسية</Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-red-700">فشلت العملية</h2>
            <p className="text-muted-foreground">حدث خطأ أثناء معالجة التبرع. يرجى المحاولة مرة أخرى.</p>
            <div className="pt-4">
              <Link href="/donate">
                <Button variant="outline" className="w-full">حاول مرة أخرى</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
