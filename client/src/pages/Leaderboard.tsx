import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { motion } from "framer-motion";
import { Award, Trophy, Medal, Star } from "lucide-react";

export default function Leaderboard() {
  const { data: donors, isLoading } = useLeaderboard();

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (index === 1) return <Medal className="w-8 h-8 text-gray-400" />;
    if (index === 2) return <Medal className="w-8 h-8 text-amber-700" />;
    return <Star className="w-6 h-6 text-primary/40" />;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-yellow-50 border-yellow-200 ring-1 ring-yellow-200";
    if (index === 1) return "bg-gray-50 border-gray-200";
    if (index === 2) return "bg-amber-50 border-amber-100";
    return "bg-white border-gray-100 hover:bg-gray-50";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block p-4 rounded-full bg-primary/10 text-primary mb-6">
            <Award className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold font-heading text-gradient mb-4">قائمة الشرف</h1>
          <p className="text-xl text-muted-foreground">
            هؤلاء هم صناع الأثر الذين ساهموا في تغيير حياة الكثيرين. شكراً لعطائكم المستمر.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {donors?.map((donor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 shadow-sm ${getRankStyle(index)}`}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading">{donor.name}</h3>
                    {index < 3 && <p className="text-sm text-muted-foreground">من كبار المحسنين</p>}
                  </div>
                </div>
                <div className="text-left">
                  <span className="block text-2xl font-bold text-primary font-mono tracking-tight">
                    {Number(donor.totalDonations).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">ريال سعودي</span>
                </div>
              </motion.div>
            ))}
            
            {donors?.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-muted-foreground text-lg">لا توجد بيانات حالياً. كن أول المتبرعين!</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
