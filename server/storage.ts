import { ObjectId } from "mongodb";
import { usersCollection, donationsCollection, contentCollection, jobsCollection, experiencesCollection } from "./db";
import { 
  type User, type InsertUser, type Donation, type InsertDonation, 
  type Content, type InsertContent, type Job, type InsertJob, 
  type Experience, type InsertExperience 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number | string): Promise<User | undefined>;
  getUserByMobile(mobile: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPrivacy(id: number | string, isPublicDonor: boolean): Promise<User>;
  updateUserTotalDonations(id: number | string, amount: number): Promise<void>;
  
  createDonation(donation: InsertDonation & { userId?: number | string; geideaRef?: string; status: string }): Promise<Donation>;
  updateDonationStatus(geideaRef: string, status: string): Promise<Donation | undefined>;
  getDonations(userId: number | string): Promise<Donation[]>;
  getTopDonors(limit?: number): Promise<{ name: string; totalDonations: number }[]>;

  getContent(slug: string): Promise<Content | undefined>;
  updateContent(slug: string, content: Partial<InsertContent>): Promise<Content>;
  getAllContent(): Promise<Content[]>;

  // Jobs
  getJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<void>;
  deleteJob(id: string): Promise<void>;

  // Experiences
  getExperiences(): Promise<Experience[]>;
  createExperience(exp: InsertExperience): Promise<Experience>;
  updateExperience(id: string, exp: Partial<InsertExperience>): Promise<void>;
  deleteExperience(id: string): Promise<void>;
  
  // Bank transfer email field
  updateBankTransferEmail(id: string, email: string): Promise<void>;
}

export class MongoStorage implements IStorage {
  private toUser(doc: any): User {
    return { ...doc, id: doc._id.toString() };
  }

  private toDonation(doc: any): Donation {
    return { ...doc, id: doc._id.toString(), userId: doc.userId?.toString() };
  }

  private toContent(doc: any): Content {
    return { ...doc, id: doc._id.toString() };
  }

  private toJob(doc: any): Job {
    return { ...doc, id: doc._id.toString() };
  }

  private toExperience(doc: any): Experience {
    return { ...doc, id: doc._id.toString() };
  }

  async getContent(slug: string): Promise<Content | undefined> {
    const doc = await contentCollection.findOne({ slug });
    return doc ? this.toContent(doc) : undefined;
  }

  async updateContent(slug: string, content: Partial<InsertContent>): Promise<Content> {
    const updateData = { ...content, updatedAt: new Date() };
    await contentCollection.updateOne(
      { slug },
      { $set: updateData },
      { upsert: true }
    );
    const doc = await contentCollection.findOne({ slug });
    return this.toContent(doc);
  }

  async getAllContent(): Promise<Content[]> {
    const cursor = contentCollection.find({});
    const docs = await cursor.toArray();
    return docs.map(d => this.toContent(d));
  }

  // Job methods
  async getJobs(): Promise<Job[]> {
    const cursor = jobsCollection.find({});
    const docs = await cursor.toArray();
    return docs.map(d => this.toJob(d));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const res = await jobsCollection.insertOne({ ...job, createdAt: new Date() });
    const doc = await jobsCollection.findOne({ _id: res.insertedId });
    return this.toJob(doc);
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<void> {
    await jobsCollection.updateOne({ _id: new ObjectId(id) }, { $set: job });
  }

  async deleteJob(id: string): Promise<void> {
    await jobsCollection.deleteOne({ _id: new ObjectId(id) });
  }

  // Experience methods
  async getExperiences(): Promise<Experience[]> {
    const cursor = experiencesCollection.find({});
    const docs = await cursor.toArray();
    return docs.map(d => this.toExperience(d));
  }

  async createExperience(exp: InsertExperience): Promise<Experience> {
    const res = await experiencesCollection.insertOne({ ...exp, createdAt: new Date() });
    const doc = await experiencesCollection.findOne({ _id: res.insertedId });
    return this.toExperience(doc);
  }

  async updateExperience(id: string, exp: Partial<InsertExperience>): Promise<void> {
    await experiencesCollection.updateOne({ _id: new ObjectId(id) }, { $set: exp });
  }

  async deleteExperience(id: string): Promise<void> {
    await experiencesCollection.deleteOne({ _id: new ObjectId(id) });
  }

  async updateBankTransferEmail(id: string, email: string): Promise<void> {
    await db.collection("bank_transfers").updateOne(
      { _id: new ObjectId(id) },
      { $set: { donorEmail: email } }
    );
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await usersCollection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toUser(doc) : undefined;
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    const doc = await usersCollection.findOne({ mobile });
    return doc ? this.toUser(doc) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const res = await usersCollection.insertOne({ ...insertUser, totalDonations: "0" });
    const doc = await usersCollection.findOne({ _id: res.insertedId });
    return this.toUser(doc);
  }

  async updateUserPrivacy(id: string, isPublicDonor: boolean): Promise<User> {
    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isPublicDonor } });
    const doc = await usersCollection.findOne({ _id: new ObjectId(id) });
    return this.toUser(doc);
  }

  async updateUserTotalDonations(id: string, amount: number): Promise<void> {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    const currentTotal = Number(user?.totalDonations || 0);
    const currentPoints = Number(user?.points || 0);
    const earnedPoints = Math.floor(amount * 10);
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          totalDonations: String(currentTotal + amount),
          points: currentPoints + earnedPoints
        } 
      }
    );
  }

  async updateBankDetails(id: string, bankName: string, iban: string): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { bankName, iban } }
    );
  }

  async createDonation(donation: any): Promise<Donation> {
    const pointsEarned = Number(donation.amount) * 10;
    const doc = { 
      ...donation, 
      userId: donation.userId ? new ObjectId(donation.userId) : null,
      donorName: donation.donorName || null,
      pointsEarned,
      createdAt: new Date()
    };
    const res = await donationsCollection.insertOne(doc);
    const created = await donationsCollection.findOne({ _id: res.insertedId });
    return this.toDonation(created);
  }

  async updateDonationStatus(geideaRef: string, status: string): Promise<Donation | undefined> {
    const donation = await donationsCollection.findOne({ geideaRef });
    if (!donation) return undefined;

    await donationsCollection.updateOne({ geideaRef }, { $set: { status } });
    
    // If confirmed, update user total donations and points
    if (status === "confirmed" && donation.userId) {
      await this.updateUserTotalDonations(donation.userId.toString(), Number(donation.amount));
    }

    const doc = await donationsCollection.findOne({ geideaRef });
    return doc ? this.toDonation(doc) : undefined;
  }

  async getDonations(userId: string): Promise<Donation[]> {
    const cursor = donationsCollection.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 });
    const docs = await cursor.toArray();
    return docs.map(d => this.toDonation(d));
  }

  async getTopDonors(limit: number = 10): Promise<{ name: string; totalDonations: number }[]> {
    const cursor = usersCollection.find({ isPublicDonor: true })
      .sort({ totalDonations: -1 })
      .limit(limit);
    const docs = await cursor.toArray();
    return docs.map(u => ({
      name: u.name,
      totalDonations: Number(u.totalDonations),
    }));
  }
}

export const storage = new MongoStorage();
