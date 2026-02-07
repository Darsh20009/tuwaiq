import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDonationSchema } from "@shared/schema";
import { type InsertDonation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDonations } from "@/hooks/use-donations";
import { Heart, Coins, Building2, Loader2, CreditCard, Landmark } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Label } from "@/components/ui/label";

export function DonationCard() {
  const { donate, isDonating } = useDonations();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"online" | "transfer">("transfer");
  
  const form = useForm<any>({
    resolver: zodResolver(insertDonationSchema.extend({
      donorName: z.string().min(2, "يرجى إدخال الاسم للشهادة")
    })),
    defaultValues: {
      amount: "100",
      type: "general",
      donorName: user?.name || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (paymentMethod === "transfer") {
        await donate({
          ...data,
          paymentMethod: "bank_transfer",
          status: "pending"
        });
        setLocation(`/bank-transfer?amount=${data.amount}&type=${data.type}&donorName=${encodeURIComponent(data.donorName || "")}`);
        return;
      }
      
      await donate(data);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold font-heading">تبرع سريع</h3>
          <p className="text-sm text-muted-foreground">اختر نوع التبرع والمبلغ المناسب</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="donorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">اسم المتبرع (ليظهر في الشهادة)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="أدخل الاسم الذي ترغب بوضعه في الشهادة" 
                    className="h-12 border-2 focus-visible:ring-primary/20"
                    {...field} 
                    data-testid="input-donor-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold">نوع التبرع</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-3 gap-3"
                  >
                    {[
                      { value: "general", label: "عام", icon: Heart },
                      { value: "zakat", label: "زكاة", icon: Coins },
                      { value: "waqf", label: "وقف", icon: Building2 },
                    ].map((type) => (
                      <FormItem key={type.value}>
                        <FormControl>
                          <RadioGroupItem value={type.value} className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200">
                          <type.icon className="mb-2 h-6 w-6" />
                          <span className="text-sm font-bold">{type.label}</span>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Label className="text-base font-semibold">طريقة التبرع</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v: any) => setPaymentMethod(v)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center opacity-50 cursor-not-allowed">
                <RadioGroupItem value="online" id="online" className="peer sr-only" disabled />
                <Label
                  htmlFor="online"
                  className="flex flex-1 flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all duration-200"
                >
                  <CreditCard className="mb-2 h-6 w-6" />
                  <span className="text-sm font-bold">دفع إلكتروني</span>
                  <span className="text-[10px] font-bold">(قريباً)</span>
                </Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
                <Label
                  htmlFor="transfer"
                  className="flex flex-1 flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200"
                >
                  <Landmark className="mb-2 h-6 w-6" />
                  <span className="text-sm font-bold">تحويل بنكي</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">المبلغ (ريال سعودي)</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type="number" 
                      className="pl-4 pr-4 h-14 text-2xl font-bold font-heading text-center border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">SAR</span>
                </div>
                
                <div className="flex gap-2 mt-3">
                  {["50", "100", "500", "1000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => form.setValue("amount", amt)}
                      className="flex-1 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-accent hover:text-primary transition-colors"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg font-bold bg-gradient-brand shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 rounded-xl"
            disabled={isDonating || paymentMethod === "online"}
            data-testid="button-donate-submit"
          >
            {isDonating ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              paymentMethod === "online" ? "تحت التطوير" : "متابعة التحويل"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
