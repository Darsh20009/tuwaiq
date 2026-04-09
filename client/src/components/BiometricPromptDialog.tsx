import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Fingerprint, Loader2, Shield, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function BiometricPromptDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!user) return;

    const justLoggedIn = sessionStorage.getItem("biometric_just_logged_in") === "true";
    if (!justLoggedIn) return;

    const alreadyAsked = localStorage.getItem(`biometric_asked_${user.id}`);
    if (alreadyAsked) {
      sessionStorage.removeItem("biometric_just_logged_in");
      return;
    }

    const isSupported = !!window.PublicKeyCredential;
    if (!isSupported) {
      sessionStorage.removeItem("biometric_just_logged_in");
      return;
    }

    const alreadyHasBiometric = (user as any).webauthnCredentials?.length > 0;
    if (alreadyHasBiometric) {
      sessionStorage.removeItem("biometric_just_logged_in");
      return;
    }

    sessionStorage.removeItem("biometric_just_logged_in");
    setTimeout(() => setOpen(true), 1200);
  }, [user]);

  const dismiss = () => {
    if (user) {
      localStorage.setItem(`biometric_asked_${user.id}`, "1");
    }
    setOpen(false);
  };

  const handleRegister = async () => {
    if (!user) return;
    setIsPending(true);
    try {
      const res = await apiRequest("GET", "/api/auth/webauthn/challenge");
      const { challenge } = await res.json();

      const challengeBuffer = Uint8Array.from(atob(challenge), c => c.charCodeAt(0));
      const userIdBuffer = Uint8Array.from(user.id || "", c => c.charCodeAt(0));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: {
            name: "جمعية طويق",
            id: window.location.hostname,
          },
          user: {
            id: userIdBuffer,
            name: (user as any).mobile || "user",
            displayName: user.name || "User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          timeout: 60000,
          attestation: "none",
          authenticatorSelection: {
            userVerification: "required",
          },
        },
      }) as any;

      if (!credential) throw new Error("لم يتم إنشاء البصمة");

      const response = credential.response;
      let publicKey = "";
      if (response.getPublicKey) {
        const pkBuffer = new Uint8Array(response.getPublicKey());
        let binary = "";
        for (let i = 0; i < pkBuffer.length; i++) {
          binary += String.fromCharCode(pkBuffer[i]);
        }
        publicKey = btoa(binary);
      }

      await apiRequest("POST", "/api/auth/webauthn/register", {
        credential: { id: credential.id, publicKey },
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      toast({
        title: "تم تفعيل البصمة",
        description: "يمكنك الآن الدخول بسرعة بدون كلمة مرور",
      });

      localStorage.setItem(`biometric_asked_${user.id}`, "1");
      setOpen(false);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        toast({
          title: "تم الإلغاء",
          description: "يمكنك تفعيل البصمة لاحقاً من الملف الشخصي",
        });
      } else {
        toast({
          title: "خطأ",
          description: err.message || "فشل تسجيل البصمة",
          variant: "destructive",
        });
      }
      dismiss();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-sm text-center" dir="rtl">
        <DialogHeader className="items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Fingerprint className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">فعّل الدخول بالبصمة</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            أنشئ بصمتك الآن لتسجيل الدخول بسرعة وأمان بدون كلمة مرور في المرات القادمة
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
          <Shield className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>بصمتك محفوظة على جهازك فقط ولا تُرسل لأي جهة</span>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full gap-2 text-base font-bold h-11"
            onClick={handleRegister}
            disabled={isPending}
            data-testid="button-biometric-setup-confirm"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Fingerprint className="w-4 h-4" />
            )}
            إنشاء بصمتي الآن
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground text-sm"
            onClick={dismiss}
            disabled={isPending}
            data-testid="button-biometric-setup-skip"
          >
            <X className="w-4 h-4 ml-1" />
            لاحقاً
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
