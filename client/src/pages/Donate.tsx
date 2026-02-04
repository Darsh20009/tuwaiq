import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DonationCard } from "@/components/DonationCard";

export default function Donate() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading text-gradient mb-2">اصنع فرقاً اليوم</h1>
            <p className="text-muted-foreground">مساهمتك مهما كانت بسيطة، تصنع أثراً عظيماً.</p>
          </div>
          <DonationCard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
