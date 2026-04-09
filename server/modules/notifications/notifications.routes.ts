import { Router, Request, Response } from "express";
import { NotificationModel } from "../../models/Notification.model";
import { PushSubscriptionModel } from "../../models/PushSubscription.model";
import { VAPID_PUBLIC_KEY } from "../../core/pushNotifications";

const router = Router();

function requireAuth(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// GET /api/notifications — list user notifications
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const user: any = req.user;
  const userId = user._id || user.id;
  const page = parseInt((req.query.page as string) || "1");
  const limit = 20;

  const [items, total, unread] = await Promise.all([
    NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    NotificationModel.countDocuments({ userId }),
    NotificationModel.countDocuments({ userId, read: false }),
  ]);

  res.json({ data: items, total, unread, page });
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  const user: any = req.user;
  const userId = user._id || user.id;
  await NotificationModel.updateOne({ _id: req.params.id, userId }, { read: true });
  res.json({ ok: true });
});

// PATCH /api/notifications/read-all
router.patch("/read-all", requireAuth, async (req: Request, res: Response) => {
  const user: any = req.user;
  const userId = user._id || user.id;
  await NotificationModel.updateMany({ userId, read: false }, { read: true });
  res.json({ ok: true });
});

// DELETE /api/notifications/:id
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const user: any = req.user;
  const userId = user._id || user.id;
  await NotificationModel.deleteOne({ _id: req.params.id, userId });
  res.json({ ok: true });
});

// GET /api/notifications/vapid-key
router.get("/vapid-key", (_req: Request, res: Response) => {
  res.json({ key: VAPID_PUBLIC_KEY });
});

// POST /api/notifications/subscribe
router.post("/subscribe", requireAuth, async (req: Request, res: Response) => {
  const user: any = req.user;
  const userId = user._id || user.id;
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription" });
  }
  await PushSubscriptionModel.findOneAndUpdate(
    { endpoint },
    { userId, endpoint, keys },
    { upsert: true, new: true }
  );
  res.json({ ok: true });
});

// DELETE /api/notifications/unsubscribe
router.delete("/unsubscribe", requireAuth, async (req: Request, res: Response) => {
  const { endpoint } = req.body;
  if (endpoint) {
    await PushSubscriptionModel.deleteOne({ endpoint });
  }
  res.json({ ok: true });
});

// POST /api/notifications/test-push — send a test push to yourself (admin/debug)
router.post("/test-push", requireAuth, async (req: Request, res: Response) => {
  const user: any = req.user;
  const userId = (user._id || user.id).toString();

  const subs = await PushSubscriptionModel.find({ userId });
  if (!subs.length) {
    return res.status(400).json({ error: "لا يوجد اشتراك push مسجّل لهذا الحساب" });
  }

  const { sendPushToUser } = await import("../../core/pushNotifications");
  await sendPushToUser(userId, {
    title: "🔔 اختبار الإشعارات",
    body: "إشعار تجريبي من جمعية طويق — النظام يعمل بشكل صحيح ✓",
    tag: `test-${Date.now()}`,
    data: { url: "/notifications" },
  });

  res.json({ ok: true, subscriptionsFound: subs.length });
});

export default router;
