import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"), // "user" or "admin"
  isPublicDonor: boolean("is_public_donor").default(true),
  totalDonations: numeric("total_donations").default("0"),
  points: integer("points").default(0),
  bankName: text("bank_name"),
  iban: text("iban"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  donorName: text("donor_name"), // Added for guest donations
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // e.g., "general", "zakat", "waqf"
  paymentMethod: text("payment_method").default("online"), // online, bank_transfer
  bankTransferPhoto: text("bank_transfer_photo"),
  geideaRef: text("geidea_ref"),
  status: text("status").default("pending"), // pending, confirmed, rejected
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  donations: many(donations),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
}));

export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  content: text("content").notNull(),
  contentEn: text("content_en"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"), // Added for video banners
  metaDescription: text("meta_description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  department: text("department").notNull(),
  departmentEn: text("department_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  requirements: text("requirements").notNull(),
  requirementsEn: text("requirements_en"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  company: text("company").notNull(),
  companyEn: text("company_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  period: text("period").notNull(), // e.g. "2020 - 2022"
  periodEn: text("period_en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
  createdAt: true,
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  updatedAt: true,
});

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  mobile: true,
  password: true,
  isPublicDonor: true,
  role: true,
});

export const insertDonationSchema = createInsertSchema(donations).pick({
  amount: true,
  type: true,
  paymentMethod: true,
  bankTransferPhoto: true,
  donorName: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

// Custom types for API
export type LoginRequest = {
  mobile: string;
  password: string;
};

export type LeaderboardEntry = {
  name: string;
  totalDonations: number;
};
