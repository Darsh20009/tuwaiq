import { MongoClient, ObjectId } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set.");
}

const client = new MongoClient(process.env.MONGODB_URI);
export const db = client.db();
export const usersCollection = db.collection("users");
export const donationsCollection = db.collection("donations");
export const contentCollection = db.collection("content");
export const jobsCollection = db.collection("jobs");
export const experiencesCollection = db.collection("experiences");
export const branchesCollection = db.collection("branches");
export const jobApplicationsCollection = db.collection("job_applications");
export const sliderItemsCollection = db.collection("slider_items");

// Connection helper
export async function connectToMongo() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI must be set.");
    }
    await client.connect();
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // In production/Render, we might want to retry or handle this gracefully
    // throw error; // Keep throwing to prevent app from starting with broken DB
  }
}
