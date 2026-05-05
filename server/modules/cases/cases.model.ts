import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "file" | "image" | "video" | "audio" | "select" | "radio" | "checkbox" | "location";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ICaseForm extends Document {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  questions: IQuestion[];
  submissionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICaseSubmission extends Document {
  formId: mongoose.Types.ObjectId;
  formTitle: string;
  formSlug: string;
  answers: Record<string, any>;
  location?: { lat: number; lng: number; address?: string };
  status: "new" | "reviewed" | "accepted" | "rejected";
  aiAnalysis?: string;
  employeeNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [String],
  placeholder: String,
}, { _id: false });

const CaseFormSchema = new Schema<ICaseForm>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  questions: [QuestionSchema],
  submissionsCount: { type: Number, default: 0 },
}, { timestamps: true });

const CaseSubmissionSchema = new Schema<ICaseSubmission>({
  formId: { type: Schema.Types.ObjectId, required: true, ref: "CaseForm" },
  formTitle: { type: String, required: true },
  formSlug: { type: String, required: true },
  answers: { type: Schema.Types.Mixed, default: {} },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  status: { type: String, enum: ["new", "reviewed", "accepted", "rejected"], default: "new" },
  aiAnalysis: String,
  employeeNotes: String,
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: String,
});

export const CaseForm = mongoose.models.CaseForm || mongoose.model<ICaseForm>("CaseForm", CaseFormSchema);
export const CaseSubmission = mongoose.models.CaseSubmission || mongoose.model<ICaseSubmission>("CaseSubmission", CaseSubmissionSchema);
