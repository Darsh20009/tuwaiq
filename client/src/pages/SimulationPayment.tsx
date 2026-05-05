import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CreditCard, Lock, AlertTriangle } from "lucide-react";

export default function SimulationPayment() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const successUrl = params.get("successUrl") || "/payment-result?status=success";
  const failUrl = params.get("failUrl") || "/payment-result?status=failed&reason=declined";
  const amount = params.get("amount") || "0";
  const donorName = params.get("donorName") || "فاعل خير";

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState(donorName);
  const [paying, setPaying] = useState(false);

  function formatCard(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  function handlePay() {
    setPaying(true);
    setTimeout(() => {
      window.location.href = successUrl;
    }, 1200);
  }

  function handleCancel() {
    window.location.href = failUrl;
  }

  const amountNum = Number(amount) / 100;

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1a4d2e] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white text-xs opacity-80">Secure Payment Gateway</p>
                <p className="text-white font-bold text-sm">Al Rajhi Bank – Neoleap</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">المبلغ</p>
              <p className="text-white font-bold text-lg">{amountNum.toLocaleString("ar-SA")} ر.س</p>
            </div>
          </div>

          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-xs font-medium">
              وضع المحاكاة — هذه الصفحة للاختبار فقط. في الإنتاج ستظهر صفحة الراجحي الحقيقية.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-[#1a4d2e]" />
              <span className="font-semibold text-gray-800 text-sm">Card Information</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Card Number</Label>
              <Input
                data-testid="input-card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="font-mono tracking-widest text-center text-lg"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Expiry Date</Label>
                <Input
                  data-testid="input-expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="font-mono text-center"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">CVV</Label>
                <Input
                  data-testid="input-cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  type="password"
                  className="font-mono text-center"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Card Holder Name</Label>
              <Input
                data-testid="input-card-holder"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Name on Card"
              />
            </div>

            <div className="flex gap-4 justify-center mt-2">
              {["mada", "visa", "mastercard"].map((card) => (
                <div key={card} className="px-3 py-1 border rounded text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {card}
                </div>
              ))}
            </div>

            <Button
              data-testid="button-pay-now"
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-[#1a4d2e] hover:bg-[#2d7a4f] text-white py-3 text-base font-bold rounded-xl"
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري المعالجة...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Pay Now — SAR {amountNum.toLocaleString("ar-SA")}
                </span>
              )}
            </Button>

            <button
              data-testid="button-cancel-payment"
              onClick={handleCancel}
              className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors py-1"
            >
              Cancel / إلغاء
            </button>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex items-center justify-center gap-2 border-t">
            <Lock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">256-bit SSL Encryption | PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
