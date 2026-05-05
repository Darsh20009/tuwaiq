import mongoose, { Schema, Document } from "mongoose";

export interface IRecurringDonation extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: string;
  campaignId?: mongoose.Types.ObjectId;
  frequency: "daily" | "monthly";
  duration: number;
  chargesRemaining: number;
  status: "active" | "paused" | "cancelled" | "completed";
  paymentMethod: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  nextChargeDate?: Date;
  lastChargeDate?: Date;
  totalCharged: number;
  chargeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringDonationSchema = new Schema<IRecurringDonation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1, max: 1000000 },
    type: { type: String, default: "general" },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    frequency: { type: String, enum: ["daily", "monthly"], required: true },
    duration: { type: Number, required: true, min: 1 },
    chargesRemaining: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "completed"],
      default: "active",
    },
    paymentMethod: { type: String, default: "rajhi" },
    donorName: { type: String },
    donorEmail: { type: String },
    donorPhone: { type: String },
    nextChargeDate: { type: Date },
    lastChargeDate: { type: Date },
    totalCharged: { type: Number, default: 0 },
    chargeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RecurringDonationSchema.index({ userId: 1 });
RecurringDonationSchema.index({ status: 1 });
RecurringDonationSchema.index({ nextChargeDate: 1, status: 1 });

export const RecurringDonationModel =
  mongoose.models.RecurringDonation ||
  mongoose.model<IRecurringDonation>("RecurringDonation", RecurringDonationSchema);
