import mongoose, { Schema, Document } from "mongoose";

export interface IDonation extends Document {
  donorId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod?: "bank_transfer" | "rajhi" | "cash" | "online";
  paymentStatus: "pending" | "confirmed" | "failed" | "refunded";
  status: "pending" | "confirmed" | "failed" | "refunded";
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  type?: string;
  bankTransferPhoto?: string;
  certificateId?: string;
  receiptId?: string;
  geideaRef?: string;
  rajhiRef?: string;
  isDeleted: boolean;
  pointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: "User" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    amount: { type: Number, required: true, min: 1, max: 1000000 },
    currency: { type: String, default: "SAR" },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "rajhi", "cash", "online"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed", "refunded"],
      default: "pending",
    },
    donorName: { type: String },
    donorEmail: { type: String },
    donorPhone: { type: String },
    type: { type: String },
    bankTransferPhoto: { type: String },
    certificateId: { type: String },
    receiptId: { type: String },
    geideaRef: { type: String },
    rajhiRef: { type: String },
    isDeleted: { type: Boolean, default: false },
    pointsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DonationSchema.index({ userId: 1 });
DonationSchema.index({ campaignId: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ geideaRef: 1 }, { sparse: true });
DonationSchema.index({ isDeleted: 1 });

export const DonationModel = mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);
