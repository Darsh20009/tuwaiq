import mongoose, { Schema, Document } from "mongoose";

export interface IBeneficiary extends Document {
  name: string;
  nationalId?: string;
  phone?: string;
  location?: string;
  caseType?: string;
  status: "active" | "inactive" | "pending";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiarySchema = new Schema<IBeneficiary>(
  {
    name: { type: String, required: true },
    nationalId: { type: String },
    phone: { type: String },
    location: { type: String },
    caseType: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

BeneficiarySchema.index({ status: 1 });
BeneficiarySchema.index({ nationalId: 1 }, { sparse: true });

export const BeneficiaryModel = mongoose.models.Beneficiary || mongoose.model<IBeneficiary>("Beneficiary", BeneficiarySchema);
