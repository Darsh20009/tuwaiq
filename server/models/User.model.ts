import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  mobile?: string;
  phone?: string;
  password?: string;
  address?: string;
  role: "admin" | "manager" | "employee" | "accountant" | "delivery" | "programmer" | "sales" | "donor" | "user";
  status: "active" | "inactive" | "suspended";
  isPublicDonor: boolean;
  totalDonations: number;
  points: number;
  donationCount: number;
  level: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  badges: string[];
  setupToken?: string;
  verifiedFlag: boolean;
  bankName?: string;
  iban?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: String },
    phone: { type: String },
    password: { type: String },
    address: { type: String },
    role: {
      type: String,
      enum: ["admin", "manager", "employee", "accountant", "delivery", "programmer", "sales", "donor", "user"],
      default: "donor",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isPublicDonor: { type: Boolean, default: false },
    totalDonations: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    donationCount: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond"],
      default: "bronze",
    },
    badges: [{ type: String }],
    setupToken: { type: String },
    verifiedFlag: { type: Boolean, default: false },
    bankName: { type: String },
    iban: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { sparse: true });
UserSchema.index({ mobile: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ totalDonations: -1 });

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
