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

// Connection helper
export async function connectToMongo() {
  await client.connect();
  console.log("Connected to MongoDB");
}
