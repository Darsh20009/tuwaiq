import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "info" | "success" | "warning" | "error" | "prayer";
  title: string;
  body: string;
  message: string;
  link?: string;
  icon?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "info" },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    message: { type: String, default: "" },
    link: { type: String },
    icon: { type: String, default: "🔔" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
