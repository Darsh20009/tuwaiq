import mongoose, { Schema, Document } from "mongoose";

export interface IDelivery extends Document {
  beneficiaryId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  deliveryPerson?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  deliveredAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    beneficiaryId: { type: Schema.Types.ObjectId, ref: "Beneficiary", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    deliveryPerson: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    deliveredAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

DeliverySchema.index({ beneficiaryId: 1 });
DeliverySchema.index({ campaignId: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ deliveryPerson: 1 });

export const DeliveryModel = mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema);
