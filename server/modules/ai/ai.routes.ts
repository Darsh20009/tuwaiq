import { Router } from "express";
import { ai, AI_MODEL, SYSTEM_PROMPT_QURAN, SYSTEM_PROMPT_ASSISTANT, SYSTEM_PROMPT_EVALUATE } from "../../core/ai";

const router = Router();

router.post("/quran/ask", async (req, res) => {
  try {
    const { question, context } = req.body as { question?: string; context?: string };
    if (!question?.trim()) return res.status(400).json({ error: "السؤال مطلوب" });

    const userMsg = context
      ? `السياق: السورة/الآية المعنية: "${context}"\n\nسؤال المستخدم: ${question}`
      : question;

    const completion = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_QURAN },
        { role: "user", content: userMsg },
      ],
      max_tokens: 600,
      temperature: 0.4,
    });

    const answer = completion.choices[0]?.message?.content ?? "تعذّر الحصول على إجابة.";
    res.json({ answer });
  } catch (err: any) {
    console.error("AI quran/ask error:", err?.message);
    res.status(500).json({ error: "تعذّر الاتصال بالمساعد الذكي." });
  }
});

router.post("/quran/evaluate", async (req, res) => {
  try {
    const { original, transcribed, recited, surahName } = req.body as {
      original?: string;
      transcribed?: string;
      recited?: string;
      surahName?: string;
    };
    const userText = recited || transcribed;
    if (!original || !userText)
      return res.status(400).json({ error: "النص الأصلي والمُتلو مطلوبان" });

    const surahCtx = surahName ? `السورة: ${surahName}\n` : "";
    const prompt = `${surahCtx}النص الأصلي الصحيح:\n"${original}"\n\nما تلاه المستخدم:\n"${userText}"\n\nقيّم التلاوة وصحح الأخطاء.`;

    const completion = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_EVALUATE },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const evaluation = completion.choices[0]?.message?.content ?? "تعذّر التقييم.";
    res.json({ evaluation });
  } catch (err: any) {
    console.error("AI evaluate error:", err?.message);
    res.status(500).json({ error: "تعذّر التقييم." });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const body = req.body as {
      message?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
      messages?: Array<{ role: string; content: string }>;
    };

    let resolvedMessage: string;
    let resolvedHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      // AdminAI format: { messages: [{role, content}, ...] }
      const msgs = body.messages;
      const lastUser = [...msgs].reverse().find(m => m.role === "user");
      if (!lastUser?.content?.trim()) return res.status(400).json({ error: "الرسالة مطلوبة" });
      resolvedMessage = lastUser.content;
      const lastIdx = msgs.lastIndexOf(lastUser as any);
      resolvedHistory = msgs.slice(0, lastIdx) as Array<{ role: "user" | "assistant"; content: string }>;
    } else {
      // AIAssistant format: { message, history }
      if (!body.message?.trim()) return res.status(400).json({ error: "الرسالة مطلوبة" });
      resolvedMessage = body.message;
      resolvedHistory = body.history || [];
    }

    const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT_ASSISTANT }];
    if (resolvedHistory?.length) {
      messages.push(...resolvedHistory.slice(-8));
    }
    messages.push({ role: "user", content: resolvedMessage });

    const completion = await ai.chat.completions.create({
      model: AI_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content ?? "تعذّر الرد.";
    res.json({ reply });
  } catch (err: any) {
    console.error("AI chat error:", err?.message);
    res.status(500).json({ error: "تعذّر الاتصال بالمساعد الذكي." });
  }
});

export default router;
