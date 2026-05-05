import { createContext, useContext, useState } from "react";

interface PendingPayment {
  paymentUrl: string;
  donationId: string;
}

interface PaymentContextValue {
  pendingPayment: PendingPayment | null;
  openPayment: (data: PendingPayment) => void;
  closePayment: () => void;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  const openPayment = (data: PendingPayment) => setPendingPayment(data);
  const closePayment = () => setPendingPayment(null);

  return (
    <PaymentContext.Provider value={{ pendingPayment, openPayment, closePayment }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePaymentContext() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePaymentContext must be used inside PaymentProvider");
  return ctx;
}
