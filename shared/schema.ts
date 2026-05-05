import { z } from "zod";

// ========== User ==========
export const userSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  mobile: z.string().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["admin", "manager", "employee", "accountant", "delivery", "programmer", "sales", "donor", "user"]).default("donor"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  isPublicDonor: z.boolean().default(false),
  totalDonations: z.number().default(0),
  points: z.number().default(0),
  donationCount: z.number().default(0),
  level: z.enum(["bronze", "silver", "gold", "platinum", "diamond"]).default("bronze"),
  badges: z.array(z.string()).default([]),
  setupToken: z.string().optional(),
  verifiedFlag: z.boolean().default(false),
  bankName: z.string().optional(),
  iban: z.string().optional(),
  webauthnCredentials: z.array(z.object({
    id: z.string(),
    publicKey: z.string(),
    createdAt: z.date().optional(),
  })).optional().default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertUserSchema = userSchema.omit({ _id: true, id: true, createdAt: true, updatedAt: true });
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ========== Campaign ==========
export const campaignSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string().min(1),
  titleAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  goalAmount: z.number().min(0),
  currentAmount: z.number().default(0),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["active", "completed", "draft", "paused"]).default("draft"),
  image: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCampaignSchema = campaignSchema.omit({ _id: true, id: true, createdAt: true, updatedAt: true });
export type Campaign = z.infer<typeof campaignSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

// ========== Donation ==========
export const donationSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  donorId: z.string().optional(),
  userId: z.string().optional(),
  campaignId: z.string().optional(),
  amount: z.number().min(1),
  currency: z.string().default("SAR"),
  paymentMethod: z.enum(["bank_transfer", "rajhi", "cash", "online"]).optional(),
  paymentStatus: z.enum(["pending", "confirmed", "failed", "refunded"]).default("pending"),
  status: z.enum(["pending", "confirmed", "failed", "refunded"]).default("pending"),
  donorName: z.string().optional(),
  donorEmail: z.string().optional(),
  donorPhone: z.string().optional(),
  type: z.string().optional(),
  bankTransferPhoto: z.string().optional(),
  certificateId: z.string().optional(),
  receiptId: z.string().optional(),
  geideaRef: z.string().optional(),
  rajhiRef: z.string().optional(),
  isDeleted: z.boolean().default(false),
  pointsEarned: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertDonationSchema = donationSchema.omit({ _id: true, id: true, createdAt: true, updatedAt: true });
export type Donation = z.infer<typeof donationSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

// ========== Donor ==========
export const donorSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  totalDonations: z.number().default(0),
  donationCount: z.number().default(0),
  level: z.enum(["bronze", "silver", "gold", "platinum", "diamond"]).default("bronze"),
  badges: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
});
export type Donor = z.infer<typeof donorSchema>;

// ========== Payment ==========
export const paymentSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  donationId: z.string().optional(),
  provider: z.enum(["bank_transfer", "rajhi", "cash"]),
  transactionId: z.string().optional(),
  amount: z.number(),
  status: z.enum(["pending", "success", "failed", "refunded"]).default("pending"),
  paidAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
});

export const insertPaymentSchema = paymentSchema.omit({ _id: true, id: true, createdAt: true });
export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// ========== Beneficiary ==========
export const beneficiarySchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  name: z.string().min(1),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  caseType: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("pending"),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertBeneficiarySchema = beneficiarySchema.omit({ _id: true, id: true, createdAt: true, updatedAt: true });
export type Beneficiary = z.infer<typeof beneficiarySchema>;
export type InsertBeneficiary = z.infer<typeof insertBeneficiarySchema>;

// ========== Delivery ==========
export const deliverySchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  beneficiaryId: z.string(),
  campaignId: z.string().optional(),
  deliveryPerson: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  deliveredAt: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertDeliverySchema = deliverySchema.omit({ _id: true, id: true, createdAt: true, updatedAt: true });
export type Delivery = z.infer<typeof deliverySchema>;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

// ========== Notification ==========
export const notificationSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean().default(false),
  createdAt: z.date().optional(),
});
export type Notification = z.infer<typeof notificationSchema>;

// ========== AuditLog ==========
export const auditLogSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().optional(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string().optional(),
  dataBefore: z.record(z.any()).optional(),
  dataAfter: z.record(z.any()).optional(),
  timestamp: z.date().optional(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;

// ========== Legacy Content / Jobs / etc. ==========
export const contentSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  slug: z.string(),
  title: z.string().optional(),
  titleEn: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  metaDescription: z.string().optional(),
  updatedAt: z.date().optional(),
});
export const insertContentSchema = contentSchema.omit({ _id: true, id: true });
export type Content = z.infer<typeof contentSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;

export const jobSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string(),
  titleEn: z.string().optional(),
  department: z.string().optional(),
  departmentEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  requirements: z.string().optional(),
  requirementsEn: z.string().optional(),
  customQuestions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  status: z.enum(["active", "inactive", "closed"]).default("active"),
  createdAt: z.date().optional(),
});
export const insertJobSchema = jobSchema.omit({ _id: true, id: true, createdAt: true });
export type Job = z.infer<typeof jobSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;

export const jobApplicationSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  jobId: z.string().optional(),
  jobTitle: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  cvUrl: z.string().optional(),
  cvData: z.string().optional(),
  customAnswers: z.array(z.string()).optional(),
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]).default("pending"),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const insertJobApplicationSchema = jobApplicationSchema.omit({ _id: true, id: true, createdAt: true, updatedAt: true });
export type JobApplication = z.infer<typeof jobApplicationSchema>;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

export const experienceSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string(),
  titleEn: z.string().optional(),
  company: z.string().optional(),
  companyEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  period: z.string().optional(),
  periodEn: z.string().optional(),
  createdAt: z.date().optional(),
});
export const insertExperienceSchema = experienceSchema.omit({ _id: true, id: true, createdAt: true });
export type Experience = z.infer<typeof experienceSchema>;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export const branchSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  name: z.string(),
  city: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  createdAt: z.date().optional(),
});
export const insertBranchSchema = branchSchema.omit({ _id: true, id: true, createdAt: true });
export type Branch = z.infer<typeof branchSchema>;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

// ========== API Types ==========
export type LoginRequest = {
  mobile?: string;
  email?: string;
  password: string;
};

export type LeaderboardEntry = {
  name: string;
  totalDonations: number;
  level?: string;
  badges?: string[];
};

// ========== Slider Item ==========
export const sliderItemSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string(),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  primaryLink: z.string().default("/donate"),
  primaryLabel: z.string().default("تبرع الآن"),
  secondaryLink: z.string().default(""),
  secondaryLabel: z.string().default(""),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
});

export const insertSliderItemSchema = sliderItemSchema.omit({ _id: true, id: true, createdAt: true });
export type SliderItem = z.infer<typeof sliderItemSchema>;
export type InsertSliderItem = z.infer<typeof insertSliderItemSchema>;
