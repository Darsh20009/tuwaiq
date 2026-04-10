import { motion } from "framer-motion";
import { Smartphone, Tablet, Monitor } from "lucide-react";

export function DevicesSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-white" dir="rtl">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, hsl(152 42% 36%) 0%, transparent 70%)" }} />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, hsl(28 44% 59%) 0%, transparent 70%)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "hsl(28 44% 55%)" }}>تجربة سلسة في كل مكان</p>
          <h2 className="text-3xl md:text-4xl font-black font-heading mb-3" style={{ color: "hsl(152 42% 22%)" }}>
            متوافق مع كل الأجهزة
          </h2>
          <p className="text-lg font-semibold" style={{ color: "hsl(215 15% 45%)" }}>
            تبرعك صار أسهل 🌿
          </p>
        </motion.div>

        <div className="flex items-end justify-center gap-6 md:gap-10 flex-wrap">
          {/* Laptop */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative">
              <div
                className="rounded-xl overflow-hidden shadow-2xl"
                style={{
                  width: 280,
                  height: 175,
                  background: "hsl(152 42% 28%)",
                  border: "3px solid hsl(210 22% 20%)",
                  padding: "8px",
                }}
              >
                <div className="w-full h-full rounded-lg overflow-hidden relative" style={{ background: "hsl(35 28% 97%)" }}>
                  <div className="h-5 flex items-center gap-1 px-2" style={{ background: "hsl(152 42% 28%)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <div className="flex-1 mx-2 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                  </div>
                  <div className="p-2 space-y-1.5">
                    <div className="flex gap-1.5">
                      <div className="h-6 w-6 rounded" style={{ background: "hsl(152 42% 36%)" }} />
                      <div className="flex-1 h-6 rounded" style={{ background: "hsl(35 15% 88%)" }} />
                    </div>
                    <div className="h-14 rounded-lg" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(152 42% 45%))" }}>
                      <div className="flex items-center justify-center h-full">
                        <div className="text-white text-[8px] font-bold text-center leading-tight">
                          <div>تبرع الآن</div>
                          <div className="opacity-70 text-[6px]">جمعية طويق</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-8 rounded" style={{ background: "hsl(35 15% 90%)" }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-3 mx-auto rounded-b-xl" style={{ width: "90%", background: "hsl(210 22% 18%)" }} />
              <div className="h-1.5 mx-auto rounded-full" style={{ width: "50%", background: "hsl(210 22% 25%)" }} />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "hsl(215 15% 42%)" }}>
              <Monitor className="w-4 h-4" />
              الحاسوب
            </div>
          </motion.div>

          {/* iPad */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl relative"
              style={{
                width: 140,
                height: 195,
                background: "hsl(210 22% 18%)",
                border: "4px solid hsl(210 22% 22%)",
                padding: "8px 6px",
              }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden" style={{ background: "hsl(35 28% 97%)" }}>
                <div className="h-4 flex items-center justify-center" style={{ background: "hsl(152 42% 28%)" }}>
                  <div className="w-6 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                </div>
                <div className="p-1.5 space-y-1">
                  <div className="h-10 rounded-lg" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(152 42% 45%))" }}>
                    <div className="flex items-center justify-center h-full text-white text-[7px] font-bold">تبرع الآن</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-8 rounded-lg" style={{ background: "hsl(35 15% 90%)" }} />
                    ))}
                  </div>
                  <div className="h-6 rounded-lg" style={{ background: "hsl(152 42% 90%)" }} />
                </div>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border-2" style={{ borderColor: "hsl(210 22% 30%)" }} />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "hsl(215 15% 42%)" }}>
              <Tablet className="w-4 h-4" />
              آيباد
            </div>
          </motion.div>

          {/* iPhone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl relative"
              style={{
                width: 90,
                height: 188,
                background: "hsl(210 22% 12%)",
                border: "4px solid hsl(210 22% 20%)",
                padding: "10px 5px",
              }}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full" style={{ background: "hsl(210 22% 20%)" }} />
              <div className="w-full h-full rounded-2xl overflow-hidden" style={{ background: "hsl(35 28% 97%)" }}>
                <div className="h-3 flex items-center justify-center" style={{ background: "hsl(152 42% 28%)" }}>
                  <div className="w-4 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                </div>
                <div className="p-1 space-y-1">
                  <div className="h-8 rounded-xl" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(152 42% 45%))" }}>
                    <div className="flex items-center justify-center h-full text-white text-[6px] font-bold">تبرع الآن</div>
                  </div>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-5 rounded-lg" style={{ background: "hsl(35 15% 90%)" }} />
                  ))}
                  <div className="h-6 rounded-xl font-bold flex items-center justify-center text-white text-[6px]"
                    style={{ background: "hsl(28 44% 59%)" }}>
                    ادفع الآن
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full" style={{ background: "hsl(210 22% 30%)" }} />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "hsl(215 15% 42%)" }}>
              <Smartphone className="w-4 h-4" />
              آيفون
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: "✅", text: "دفع آمن مشفّر SSL" },
            { icon: "📱", text: "تطبيق ويب متجاوب" },
            { icon: "🍎", text: "Apple Pay & مدى" },
            { icon: "🏦", text: "تحويل بنكي مباشر" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(152 42% 30%)" }}>
              <span>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
