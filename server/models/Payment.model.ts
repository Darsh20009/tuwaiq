import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  donationId?: mongoose.Types.ObjectId;
  provider: "bank_transfer" | "rajhi" | "cash";
  transactionId?: string;
  amount: number;
  status: "pending" | "success" | "failed" | "refunded";
  paidAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    donationId: { type: Schema.Types.ObjectId, ref: "Donation" },
    provider: {
      type: String,
      enum: ["bank_transfer", "rajhi", "cash"],
      required: true,
    },
    transactionId: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    paidAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

PaymentSchema.index({ donationId: 1 });
PaymentSchema.index({ provider: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
